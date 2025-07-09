from django.contrib import admin
from .models import Video, Like, Subscription, WatchLater, Comment, UserProfile

@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    list_display = ['title', 'uploader', 'uploaded_at', 'views']
    list_filter = ['uploaded_at', 'uploader']
    search_fields = ['title', 'description']

@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    list_display = ['user', 'video', 'created_at']
    list_filter = ['created_at']

@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ['subscriber', 'subscribed_to', 'created_at']
    list_filter = ['created_at']

@admin.register(WatchLater)
class WatchLaterAdmin(admin.ModelAdmin):
    list_display = ['user', 'video', 'added_at']
    list_filter = ['added_at']

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['user', 'video', 'created_at']
    list_filter = ['created_at']

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user']