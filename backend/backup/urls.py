from django.urls import path
from .views import BackupExportView, BackupImportView

urlpatterns = [
    path("export/", BackupExportView.as_view(), name="backup-export"),
    path("import/", BackupImportView.as_view(), name="backup-import"),
]
