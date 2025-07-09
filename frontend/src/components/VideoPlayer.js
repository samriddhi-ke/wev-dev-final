import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const VideoPlayer = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [video, setVideo] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVideo();
    fetchComments();
  }, [id]);

  const fetchVideo = async () => {
    try {
      const response = await api.get(`/videos/${id}/`);
      setVideo(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching video:', error);
      setError('Failed to load video');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await api.get(`/videos/${id}/comments/`);
      setComments(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleLike = async () => {
    if (!user) return;
    
    try {
      const response = await api.post(`/videos/${id}/like/`);
      setVideo(prev => ({
        ...prev,
        is_liked: response.data.liked,
        likes_count: response.data.likes_count
      }));
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleSubscribe = async () => {
    if (!user || !video) return;
    
    try {
      const response = await api.post(`/users/${video.uploader.id}/subscribe/`);
      setVideo(prev => ({
        ...prev,
        is_subscribed: response.data.subscribed
      }));
    } catch (error) {
      console.error('Error toggling subscription:', error);
    }
  };

  const handleWatchLater = async () => {
    if (!user) return;
    
    try {
      const response = await api.post(`/videos/${id}/watch-later/`);
      setVideo(prev => ({
        ...prev,
        in_watch_later: response.data.in_watch_later
      }));
    } catch (error) {
      console.error('Error toggling watch later:', error);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;
    
    try {
      const response = await api.post(`/videos/${id}/comments/`, {
        content: newComment
      });
      setComments(prev => [response.data, ...prev]);
      setNewComment('');
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: video.title,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Video link copied to clipboard!');
    }
  };

  if (loading) return <div className="loading">Loading video...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!video) return <div className="error">Video not found</div>;

  return (
    <div className="video-player">
      <div className="video-container">
        <video controls className="video-element">
          <source src={video.video_file} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      
      <div className="video-details">
        <h1 className="video-title">{video.title}</h1>
        
        <div className="video-actions">
          <div className="video-stats">
            <span>{video.views} views</span>
            <span>•</span>
            <span>{new Date(video.uploaded_at).toLocaleDateString()}</span>
          </div>
          
          <div className="action-buttons">
            <button 
              onClick={handleLike}
              className={`action-btn ${video.is_liked ? 'liked' : ''}`}
              disabled={!user}
            >
              👍 {video.likes_count}
            </button>
            
            <button onClick={handleShare} className="action-btn">
              🔗 Share
            </button>
            
            <button 
              onClick={handleWatchLater}
              className={`action-btn ${video.in_watch_later ? 'added' : ''}`}
              disabled={!user}
            >
              🕐 {video.in_watch_later ? 'Added' : 'Watch Later'}
            </button>
          </div>
        </div>
        
        <div className="video-uploader">
          <div className="uploader-info">
            <Link to={`/user/${video.uploader.id}`} className="uploader-name">
              {video.uploader.username}
            </Link>
            <button 
              onClick={handleSubscribe}
              className={`subscribe-btn ${video.is_subscribed ? 'subscribed' : ''}`}
              disabled={!user}
            >
              {video.is_subscribed ? 'Subscribed' : 'Subscribe'}
            </button>
          </div>
          <p className="video-description">{video.description}</p>
        </div>
      </div>
      
      <div className="comments-section">
        <h3>Comments ({comments.length})</h3>
        
        {user && (
          <form onSubmit={handleCommentSubmit} className="comment-form">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="comment-input"
              rows="3"
            />
            <button type="submit" className="comment-submit">
              Comment
            </button>
          </form>
        )}
        
        <div className="comments-list">
          {comments.map(comment => (
            <div key={comment.id} className="comment">
              <div className="comment-author">{comment.user.username}</div>
              <div className="comment-content">{comment.content}</div>
              <div className="comment-date">
                {new Date(comment.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
