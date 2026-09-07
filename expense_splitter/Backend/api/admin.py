from django.contrib import admin
from .models import Expense, ExpenseGroup, GroupMembership


@admin.register(ExpenseGroup)
class ExpenseGroupAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'created_by', 'created_at')
    search_fields = ('name', 'created_by__username')


@admin.register(GroupMembership)
class GroupMembershipAdmin(admin.ModelAdmin):
    list_display = ('id', 'group', 'user', 'joined_at')
    list_filter = ('group',)
    search_fields = ('group__name', 'user__username')


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ('id', 'description', 'amount', 'group', 'paid_by', 'created_at')
    list_filter = ('group', 'paid_by')
    search_fields = ('description', 'group__name', 'paid_by__username')
