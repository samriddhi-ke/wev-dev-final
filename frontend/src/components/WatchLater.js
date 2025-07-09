import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const WatchLater = () => {
  const [watchLaterVideos, setWatchLaterVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchWatchLaterVideos();
  }, [user, navigate]);

  const fetchWatchLaterVideos = async () => {
    try {
      const response = await api.get('/watch-later/');
      setWatchLaterVideos(response.data.results || response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching watch later videos:', error);
      setError('Failed to load watch later videos');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWatchLater = async (videoId) => {
    try {
      await api.post(`/videos/${videoId}/watch-later/`);
      setWatchLaterVideos(prev => prev.filter(item => item.video.id !== videoId));
    } catch (error) {
      console.error('Error removing from watch later:', error);
    }
  };

  if (!user) {
    return <div className="loading">Redirecting to login...</div>;
  }

  if (loading) return <div className="loading">Loading watch later videos...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="watch-later">
      <h1>Watch Later</h1>
      
      {watchLaterVideos.length === 0 ? (
        <div className="no-videos">
          <h2>No videos in watch later</h2>
          <p>Videos you save for later will appear here.</p>
          <Link to="/" className="home-btn">Browse Videos</Link>
        </div>
      ) : (
        <div className="video-list">
          {watchLaterVideos.map(item => (
            <div key={item.id} className="video-item">
              <Link to={`/video/${item.video.id}`} className="video-link">
                <div className="video-thumbnail">
                  {item.video.thumbnail ? (
                    <img src={item.video.thumbnail} alt={item.video.title} />
                  ) : (
                    <div className="no-thumbnail">📹</div>
                  )}
                </div>
                <div className="video-info">
                  <h3 className="video-title">{item.video.title}</h3>
                  <p className="video-uploader">{item.video.uploader?.username}</p>
                  <p className="added-date">
                    Added on {new Date(item.added_at).toLocaleDateString()}
                  </p>
                </div>
              </Link>
              <button 
                onClick={() => handleRemoveFromWatchLater(item.video.id)}
                className="remove-btn"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WatchLater;