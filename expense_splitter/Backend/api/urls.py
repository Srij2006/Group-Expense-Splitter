from django.urls import path
from . import views

urlpatterns = [
    path('', views.health),
    path('signup', views.signup),
    path('login', views.login_view),
    path('logout', views.logout_view),
    path('me', views.me),
    path('api/csrf', views.csrf_token),
    path('api/dashboard', views.dashboard),
    path('api/groups', views.groups),
    path('api/expenses', views.expenses),
]
