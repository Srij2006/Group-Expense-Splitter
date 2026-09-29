from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ('api', '0002_settlement'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='GroupContribution',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('amount', models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('group', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='contributions', to='api.expensegroup')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='group_contributions', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.AddConstraint(
            model_name='groupcontribution',
            constraint=models.UniqueConstraint(fields=('group', 'user'), name='unique_group_contribution'),
        ),
        migrations.AddConstraint(
            model_name='groupcontribution',
            constraint=models.CheckConstraint(condition=models.Q(('amount__gte', 0)), name='group_contribution_nonnegative'),
        ),
    ]
