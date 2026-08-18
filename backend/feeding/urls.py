from django.urls import path
from .views import FeedingScheduleView, DailyFoodTotalView

urlpatterns = [
    path("schedule/", FeedingScheduleView.as_view(), name="feeding-schedule"),
    path("daily-total/", DailyFoodTotalView.as_view(), name="feeding-daily-total"),
]
