import json
from calendar import month_abbr
from decimal import Decimal, InvalidOperation, ROUND_HALF_UP
from functools import wraps

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.db import transaction
from django.db.models import Sum
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.utils import timezone
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_exempt

from .models import Expense, ExpenseGroup, GroupMembership


MONEY_ZERO = Decimal('0.00')


# --------------------------------------------------
# Helpers
# --------------------------------------------------

def json_body(request):
    if not request.body:
        return {}

    try:
        return json.loads(
            request.body.decode('utf-8')
        )
    except (json.JSONDecodeError, UnicodeDecodeError):
        raise ValueError(
            'Request body must be valid JSON.'
        )


def money(value):
    return Decimal(value).quantize(
        Decimal('0.01'),
        rounding=ROUND_HALF_UP
    )


def money_float(value):
    return float(money(value))


def method_required(method):
    def decorator(view_func):

        @wraps(view_func)
        def wrapper(request, *args, **kwargs):

            if request.method != method:
                return JsonResponse(
                    {
                        'error':
                            f'Use {method} for this endpoint.'
                    },
                    status=405
                )

            return view_func(
                request,
                *args,
                **kwargs
            )

        return wrapper

    return decorator


def login_required_json(view_func):

    @wraps(view_func)
    def wrapper(request, *args, **kwargs):

        if not request.user.is_authenticated:
            return JsonResponse(
                {
                    'error':
                        'Authentication required.'
                },
                status=401
            )

        return view_func(
            request,
            *args,
            **kwargs
        )

    return wrapper


# --------------------------------------------------
# Group calculations
# --------------------------------------------------

def get_group_balance(group, user):

    member_ids = list(
        group.memberships.values_list(
            'user_id',
            flat=True
        )
    )

    member_count = len(member_ids)

    if member_count == 0:
        return MONEY_ZERO

    paid = (
        group.expenses
        .filter(paid_by=user)
        .aggregate(total=Sum('amount'))['total']
        or MONEY_ZERO
    )

    total = (
        group.expenses
        .aggregate(total=Sum('amount'))['total']
        or MONEY_ZERO
    )

    share = total / Decimal(member_count)

    return money(paid - share)


def serialize_group(group, user):

    members = list(
        User.objects
        .filter(
            expense_group_memberships__group=group
        )
        .order_by('username')
        .values_list(
            'username',
            flat=True
        )
    )

    total = (
        group.expenses
        .aggregate(total=Sum('amount'))['total']
        or MONEY_ZERO
    )

    return {
        'id': group.id,
        'name': group.name,
        'members': members,
        'totalExpenses': money_float(total),
        'balance': money_float(
            get_group_balance(
                group,
                user
            )
        ),
    }


def user_groups(user):
    return (
        ExpenseGroup.objects
        .filter(memberships__user=user)
        .distinct()
    )


# --------------------------------------------------
# Health
# --------------------------------------------------

@method_required('GET')
def health(request):

    return JsonResponse({
        'status': 'ok',
        'message': 'Django API is running.',
    })


# --------------------------------------------------
# Authentication
# --------------------------------------------------

@csrf_exempt
@method_required('POST')
def signup(request):

    try:
        data = json_body(request)
    except ValueError as exc:
        return JsonResponse(
            {'error': str(exc)},
            status=400
        )

    username = str(
        data.get('username', '')
    ).strip()

    password = str(
        data.get('password', '')
    )

    if not username or not password:
        return JsonResponse(
            {
                'error':
                    'username and password are required.'
            },
            status=400
        )

    if len(username) > 150:
        return JsonResponse(
            {
                'error':
                    'Username is too long.'
            },
            status=400
        )

    if User.objects.filter(
        username=username
    ).exists():

        return JsonResponse(
            {
                'error':
                    'Username already exists.'
            },
            status=409
        )

    if len(password) < 6:
        return JsonResponse(
            {
                'error':
                    'Password must be at least 6 characters.'
            },
            status=400
        )

    user = User.objects.create_user(
        username=username,
        password=password
    )

    login(
        request,
        user
    )

    return JsonResponse(
        {
            'success': True,
            'user': {
                'id': user.id,
                'username': user.username,
            },
        },
        status=201
    )


@csrf_exempt
@method_required('POST')
def login_view(request):

    try:
        data = json_body(request)
    except ValueError as exc:
        return JsonResponse(
            {'error': str(exc)},
            status=400
        )

    username = str(
        data.get('username', '')
    ).strip()

    password = str(
        data.get('password', '')
    )

    if not username or not password:
        return JsonResponse(
            {
                'error':
                    'username and password are required.'
            },
            status=400
        )

    user = authenticate(
        request,
        username=username,
        password=password
    )

    if user is None:
        return JsonResponse(
            {
                'error':
                    'Invalid username or password.'
            },
            status=401
        )

    login(
        request,
        user
    )

    return JsonResponse({
        'success': True,
        'user': {
            'id': user.id,
            'username': user.username,
        },
    })


@csrf_exempt
@method_required('POST')
def logout_view(request):

    logout(request)

    return JsonResponse({
        'success': True
    })


# --------------------------------------------------
# CSRF
# --------------------------------------------------

@ensure_csrf_cookie
@method_required('GET')
def csrf_token(request):

    token = get_token(request)

    response = JsonResponse({
        'success': True,
        'csrfToken': token,
    })

    return response


# --------------------------------------------------
# Current user
# --------------------------------------------------

@method_required('GET')
def me(request):

    if not request.user.is_authenticated:
        return JsonResponse({
            'authenticated': False,
            'user': None,
        })

    return JsonResponse({
        'authenticated': True,
        'user': {
            'id': request.user.id,
            'username': request.user.username,
        },
    })


# --------------------------------------------------
# Dashboard
# --------------------------------------------------

@login_required_json
@method_required('GET')
def dashboard(request):

    groups = user_groups(
        request.user
    )

    total_groups = groups.count()

    total_expenses = (
        Expense.objects
        .filter(group__in=groups)
        .aggregate(total=Sum('amount'))['total']
        or MONEY_ZERO
    )

    balances = [
        get_group_balance(
            group,
            request.user
        )
        for group in groups
    ]

    you_are_owed = sum(
        (
            balance
            for balance in balances
            if balance > 0
        ),
        MONEY_ZERO
    )

    you_owe = sum(
        (
            -balance
            for balance in balances
            if balance < 0
        ),
        MONEY_ZERO
    )

    today = timezone.localdate()

    months = []

    year = today.year
    month = today.month

    for i in range(5, -1, -1):

        offset = month - i

        y = year + (
            (offset - 1) // 12
        )

        m = (
            (offset - 1) % 12
        ) + 1

        months.append(
            (y, m)
        )

    chart_data = []

    for y, m in months:

        amount = (
            Expense.objects
            .filter(
                group__in=groups,
                created_at__year=y,
                created_at__month=m,
            )
            .aggregate(
                total=Sum('amount')
            )['total']
            or MONEY_ZERO
        )

        chart_data.append({
            'month': month_abbr[m],
            'amount': money_float(amount),
        })

    return JsonResponse({

        'stats': {

            'totalGroups':
                total_groups,

            'totalExpenses':
                money_float(
                    total_expenses
                ),

            'youAreOwed':
                money_float(
                    you_are_owed
                ),

            'youOwe':
                money_float(
                    you_owe
                ),
        },

        'chartData':
            chart_data,
    })


# --------------------------------------------------
# Groups
# --------------------------------------------------

@login_required_json
def groups(request):

    if request.method == 'GET':

        data = [
            serialize_group(
                group,
                request.user
            )
            for group
            in user_groups(
                request.user
            )
        ]

        return JsonResponse({
            'groups': data
        })

    if request.method != 'POST':

        return JsonResponse(
            {
                'error':
                    'Use GET or POST for this endpoint.'
            },
            status=405
        )

    try:
        payload = json_body(request)

    except ValueError as exc:

        return JsonResponse(
            {'error': str(exc)},
            status=400
        )

    name = str(
        payload.get('name', '')
    ).strip()

    requested_members = payload.get(
        'members',
        []
    )

    if not name:

        return JsonResponse(
            {
                'error':
                    'Group name is required.'
            },
            status=400
        )

    if not isinstance(
        requested_members,
        list
    ):

        return JsonResponse(
            {
                'error':
                    'members must be an array of usernames.'
            },
            status=400
        )

    usernames = []

    for raw_username in requested_members:

        username = str(
            raw_username
        ).strip()

        if (
            username
            and username not in usernames
        ):
            usernames.append(
                username
            )

    users = list(
        User.objects.filter(
            username__in=usernames
        )
    )

    found = {
        user.username: user
        for user in users
    }

    missing = [
        username
        for username in usernames
        if username not in found
    ]

    if missing:

        return JsonResponse(
            {
                'error':
                    'These users do not exist.',
                'missingUsers':
                    missing,
            },
            status=400
        )

    with transaction.atomic():

        group = ExpenseGroup.objects.create(
            name=name,
            created_by=request.user
        )

        GroupMembership.objects.create(
            group=group,
            user=request.user
        )

        GroupMembership.objects.bulk_create([

            GroupMembership(
                group=group,
                user=user
            )

            for user in users

            if user.id != request.user.id
        ])

    return JsonResponse(
        {
            'success': True,
            'group':
                serialize_group(
                    group,
                    request.user
                ),
        },
        status=201
    )


# --------------------------------------------------
# Expenses
# --------------------------------------------------

@login_required_json
@csrf_exempt
def expenses(request):

    # -----------------------------
    # GET
    # -----------------------------

    if request.method == 'GET':

        expenses_qs = (
            Expense.objects

            .filter(
                group__memberships__user=request.user
            )

            .select_related(
                'group',
                'paid_by'
            )

            .distinct()
        )

        rows = []

        for expense in expenses_qs:

            rows.append({

                'id':
                    expense.id,

                'description':
                    expense.description,

                'amount':
                    money_float(
                        expense.amount
                    ),

                'createdAt':
                    expense.created_at
                    .isoformat()
                    .replace(
                        '+00:00',
                        'Z'
                    ),

                'group': {
                    'id':
                        expense.group.id,

                    'name':
                        expense.group.name,
                },

                'paidBy': {
                    'id':
                        expense.paid_by.id,

                    'username':
                        expense.paid_by.username,
                },
            })

        return JsonResponse({
            'expenses': rows
        })

    # -----------------------------
    # POST
    # -----------------------------

    if request.method != 'POST':

        return JsonResponse(
            {
                'error':
                    'Use GET or POST for this endpoint.'
            },
            status=405
        )

    try:

        payload = json_body(
            request
        )

    except ValueError as exc:

        return JsonResponse(
            {'error': str(exc)},
            status=400
        )

    description = str(
        payload.get(
            'description',
            ''
        )
    ).strip()

    amount_value = payload.get(
        'amount'
    )

    group_id = payload.get(
        'groupId'
    )

    if not description:

        return JsonResponse(
            {
                'error':
                    'Description is required.'
            },
            status=400
        )

    if len(description) > 255:

        return JsonResponse(
            {
                'error':
                    'Description is too long.'
            },
            status=400
        )

    if amount_value in (
        None,
        ''
    ):

        return JsonResponse(
            {
                'error':
                    'Amount is required.'
            },
            status=400
        )

    try:

        amount = money(
            amount_value
        )

    except (
        InvalidOperation,
        ValueError,
        TypeError
    ):

        return JsonResponse(
            {
                'error':
                    'Amount must be a valid number.'
            },
            status=400
        )

    if amount <= MONEY_ZERO:

        return JsonResponse(
            {
                'error':
                    'Amount must be greater than 0.'
            },
            status=400
        )

    if not group_id:

        return JsonResponse(
            {
                'error':
                    'groupId is required.'
            },
            status=400
        )

    try:

        group = ExpenseGroup.objects.get(
            id=group_id
        )

    except (
        ExpenseGroup.DoesNotExist,
        ValueError,
        TypeError
    ):

        return JsonResponse(
            {
                'error':
                    'Group does not exist.'
            },
            status=404
        )

    is_member = (
        GroupMembership.objects
        .filter(
            group=group,
            user=request.user
        )
        .exists()
    )

    if not is_member:

        return JsonResponse(
            {
                'error':
                    'You are not a member of this group.'
            },
            status=403
        )

    expense = Expense.objects.create(

        group=group,

        paid_by=request.user,

        description=description,

        amount=amount,
    )

    return JsonResponse({

        'success': True,

        'expense': {

            'id':
                expense.id,

            'description':
                expense.description,

            'amount':
                money_float(
                    expense.amount
                ),

            'createdAt':
                expense.created_at
                .isoformat()
                .replace(
                    '+00:00',
                    'Z'
                ),

            'group': {

                'id':
                    expense.group.id,

                'name':
                    expense.group.name,
            },

            'paidBy': {

                'id':
                    expense.paid_by.id,

                'username':
                    expense.paid_by.username,
            },
        }

    }, status=201)