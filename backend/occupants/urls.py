from rest_framework.routers import DefaultRouter
from .views import OccupantViewSet

router = DefaultRouter()
router.register("occupants", OccupantViewSet, basename="occupant")

urlpatterns = router.urls
