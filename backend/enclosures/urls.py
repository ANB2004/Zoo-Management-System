from rest_framework.routers import DefaultRouter
from .views import EnclosureViewSet

router = DefaultRouter()
router.register("enclosures", EnclosureViewSet, basename="enclosure")

urlpatterns = router.urls
