from django.contrib.auth.models import User
from django.db import models


class ExpenseGroup(models.Model):
    name = models.CharField(max_length=120)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_expense_groups')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at', '-id']

    def __str__(self):
        return self.name


class GroupMembership(models.Model):
    group = models.ForeignKey(ExpenseGroup, on_delete=models.CASCADE, related_name='memberships')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='expense_group_memberships')
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['group', 'user'], name='unique_group_member'),
        ]

    def __str__(self):
        return f'{self.group.name} - {self.user.username}'


class Expense(models.Model):
    group = models.ForeignKey(ExpenseGroup, on_delete=models.CASCADE, related_name='expenses')
    paid_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='paid_expenses')
    description = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at', '-id']

    def __str__(self):
        return f'{self.description} - {self.amount}'
