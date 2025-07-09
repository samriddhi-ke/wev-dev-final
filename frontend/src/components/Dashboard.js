import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const Dashboard = () => {
  const [userVideos, setUserVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchUserVideos();
  }, [user, navigate]);

  const fetchUserVideos = async () => {
    try {
      const response = await api.get(`/users/${user.id}/videos/`);
      setUserVideos(response.data.results || response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching user videos:', error);
      setError('Failed to load your videos');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVideo = async (videoId) => {
    if (window.confirm('Are you sure you want to delete this video?')) {
      try {
        await api.delete(`/videos/${videoId}/`);
        setUserVideos(prev => prev.filter(video => video.id !== videoId));
      } catch (error) {
        console.error('Error deleting video:', error);
        alert('Failed to delete video');
      }
    }
  };

  if (!user) {
    return <div className="loading">Redirecting to login...</div>;
  }

  if (loading) return <div className="loading">Loading your videos...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="dashboard">
      <h1>Your Videos</h1>
      
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Videos</h3>
          <p>{userVideos.length}</p>
        </div>
        <div className="stat-card">
          <h3>Total Views</h3>
          <p>{userVideos.reduce((total, video) => total + video.views, 0)}</p>
        </div>
      </div>
      
      {userVideos.length === 0 ? (
        <div className="no-videos">
          <h2>No videos uploaded yet</h2>
          <p>Start sharing your content with the world!</p>
          <Link to="/upload" className="upload-btn">Upload Your First Video</Link>
        </div>
      ) : (
        <div className="video-grid">
          {userVideos.map(video => (
            <div key={video.id} className="video-card dashboard-card">
              <Link to={`/video/${video.id}`}>
                <div className="video-thumbnail">
                  {video.thumbnail ? (
                    <img src={video.thumbnail} alt={video.title} />
                  ) : (
                    <div className="no-thumbnail">📹</div>
                  )}
                </div>
              </Link>
              <div className="video-info">
                <h3 className="video-title">{video.title}</h3>
                <p className="video-stats">
                  {video.views} views • {new Date(video.uploaded_at).toLocaleDateString()}
                </p>
                <div className="video-actions">
                  <Link to={`/video/${video.id}`} className="action-link">View</Link>
                  <button 
                    onClick={() => handleDeleteVideo(video.id)}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;