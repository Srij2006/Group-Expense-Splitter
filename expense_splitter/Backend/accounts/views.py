from django.shortcuts import render
from django.contrib.auth.models import User
from django.contrib.auth import authenticate,login,logout


def signup(request):

    if request.method == "POST":

        username = request.POST["username"]
        password = request.POST["password"]

        user = User.objects.create_user(
            username=username,
            password=password
        )

        login(request, user)

        return render(request, "accounts/home.html")

    return render(request, "accounts/signup.html")


def user_login(request):

    if request.method == "POST":

        username = request.POST["username"]
        password = request.POST["password"]

        user = authenticate(
            request,
            username=username,
            password=password
        )

        if user is not None:

            login(request, user)

            return render(request, "accounts/home.html")

        else:

            return render(
                request,
                "accounts/login.html",
                {"error": "Invalid username or password"}
            )

    return render(request, "accounts/login.html")

def user_logout(request):

    logout(request)

    return render(request, "accounts/logout.html")