from django.urls import path
from . import views

urlpatterns = [
    # Authentication
    path('auth/register/', views.register, name='register'),
    path('auth/login/', views.login, name='login'),
    path('auth/logout/', views.logout, name='logout'),
    
    # Videos
    path('videos/', views.VideoListCreateView.as_view(), name='video-list-create'),
    path('videos/<int:pk>/', views.VideoDetailView.as_view(), name='video-detail'),
    
    # Social Features
    path('videos/<int:video_id>/like/', views.toggle_like, name='toggle-like'),
    path('videos/<int:video_id>/watch-later/', views.toggle_watch_later, name='toggle-watch-later'),
    path('users/<int:user_id>/subscribe/', views.toggle_subscription, name='toggle-subscription'),
    
    # Watch Later
    path('watch-later/', views.WatchLaterListView.as_view(), name='watch-later-list'),
    
    # Comments
    path('videos/<int:video_id>/comments/', views.CommentListCreateView.as_view(), name='video-comments'),
    
    # User Profile
    path('users/<int:pk>/', views.UserProfileView.as_view(), name='user-profile'),
    path('users/<int:user_id>/videos/', views.UserVideosView.as_view(), name='user-videos'),
    
    # Search
    path('search/', views.search_videos, name='search-videos'),
]




