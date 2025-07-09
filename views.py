from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import Video, Like, Subscription, WatchLater, Comment
from .serializers import (
    UserSerializer, UserRegistrationSerializer, UserLoginSerializer,
    VideoSerializer, CommentSerializer, WatchLaterSerializer
)

# Authentication Views
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register(request):
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login(request):
    serializer = UserLoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data
        })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def logout(request):
    try:
        request.user.auth_token.delete()
        return Response({'message': 'Successfully logged out'})
    except:
        return Response({'error': 'Error logging out'}, status=status.HTTP_400_BAD_REQUEST)

# Video Views
class VideoListCreateView(generics.ListCreateAPIView):
    serializer_class = VideoSerializer
    
    def get_queryset(self):
        queryset = Video.objects.all()
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(description__icontains=search)
            )
        return queryset
    
    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]
    
    def perform_create(self, serializer):
        serializer.save(uploader=self.request.user)

class VideoDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Video.objects.all()
    serializer_class = VideoSerializer
    
    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]
    
    def retrieve(self, request, *args, **kwargs):
        video = self.get_object()
        video.views += 1
        video.save()
        return super().retrieve(request, *args, **kwargs)

# Social Features
@api_view(['POST'])
def toggle_like(request, video_id):
    video = get_object_or_404(Video, id=video_id)
    like, created = Like.objects.get_or_create(user=request.user, video=video)
    
    if not created:
        like.delete()
        liked = False
    else:
        liked = True
    
    return Response({
        'liked': liked,
        'likes_count': video.likes.count()
    })

@api_view(['POST'])
def toggle_subscription(request, user_id):
    user_to_subscribe = get_object_or_404(User, id=user_id)
    
    if user_to_subscribe == request.user:
        return Response({'error': 'Cannot subscribe to yourself'}, status=status.HTTP_400_BAD_REQUEST)
    
    subscription, created = Subscription.objects.get_or_create(
        subscriber=request.user,
        subscribed_to=user_to_subscribe
    )
    
    if not created:
        subscription.delete()
        subscribed = False
    else:
        subscribed = True
    
    return Response({
        'subscribed': subscribed,
        'subscribers_count': user_to_subscribe.subscribers.count()
    })

@api_view(['POST'])
def toggle_watch_later(request, video_id):
    video = get_object_or_404(Video, id=video_id)
    watch_later, created = WatchLater.objects.get_or_create(user=request.user, video=video)
    
    if not created:
        watch_later.delete()
        in_watch_later = False
        message = 'Removed from watch later'
    else:
        in_watch_later = True
        message = 'Added to watch later'
    
    return Response({
        'in_watch_later': in_watch_later,
        'message': message
    })

# Watch Later List
class WatchLaterListView(generics.ListAPIView):
    serializer_class = WatchLaterSerializer
    
    def get_queryset(self):
        return WatchLater.objects.filter(user=self.request.user)

# Comments
class CommentListCreateView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer
    
    def get_queryset(self):
        video_id = self.kwargs['video_id']
        return Comment.objects.filter(video_id=video_id)
    
    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]
    
    def perform_create(self, serializer):
        video_id = self.kwargs['video_id']
        video = get_object_or_404(Video, id=video_id)
        serializer.save(user=self.request.user, video=video)

# User Profile
class UserProfileView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]

class UserVideosView(generics.ListAPIView):
    serializer_class = VideoSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        user_id = self.kwargs['user_id']
        return Video.objects.filter(uploader_id=user_id)

# Search
@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def search_videos(request):
    query = request.query_params.get('q', '')
    if not query:
        return Response({'error': 'Search query is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    videos = Video.objects.filter(
        Q(title__icontains=query) | Q(description__icontains=query)
    )
    
    serializer = VideoSerializer(videos, many=True, context={'request': request})
    return Response({
        'count': videos.count(),
        'results': serializer.data
    })
