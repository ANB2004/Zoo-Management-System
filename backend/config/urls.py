from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("enclosures.urls")),
    path("api/", include("occupants.urls")),
    path("api/feeding/", include("feeding.urls")),
    path("api/backup/", include("backup.urls")),
    path("api/auth/", include("accounts.urls")),
]
