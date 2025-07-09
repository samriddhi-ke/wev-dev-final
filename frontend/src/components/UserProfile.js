import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const UserProfile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [userVideos, setUserVideos] = useState([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserProfile();
    fetchUserVideos();
  }, [id]);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get(`/users/${id}/`);
      setProfileUser(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserVideos = async () => {
    try {
      const response = await api.get(`/users/${id}/videos/`);
      setUserVideos(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching user videos:', error);
    }
  };

  const handleSubscribe = async () => {
    if (!user) return;
    
    try {
      const response = await api.post(`/users/${id}/subscribe/`);
      setIsSubscribed(response.data.subscribed);
    } catch (error) {
      console.error('Error toggling subscription:', error);
    }
  };

  if (loading) return <div className="loading">Loading profile...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!profileUser) return <div className="error">User not found</div>;

  return (
    <div className="user-profile">
      <div className="profile-header">
        <div className="profile-info">
          <h1>{profileUser.username}</h1>
          <p>{profileUser.first_name} {profileUser.last_name}</p>
          <div className="profile-stats">
            <span>{profileUser.subscribers_count || 0} subscribers</span>
            <span>•</span>
            <span>{userVideos.length} videos</span>
          </div>
        </div>
        
        {user && user.id !== parseInt(id) && (
          <button 
            onClick={handleSubscribe}
            className={`subscribe-btn ${isSubscribed ? 'subscribed' : ''}`}
          >
            {isSubscribed ? 'Subscribed' : 'Subscribe'}
          </button>
        )}
      </div>
      
      <div className="profile-content">
        <h2>Videos</h2>
        {userVideos.length === 0 ? (
          <p>No videos uploaded yet.</p>
        ) : (
          <div className="video-grid">
            {userVideos.map(video => (
              <div key={video.id} className="video-card">
                <Link to={`/video/${video.id}`}>
                  <div className="video-thumbnail">
                    {video.thumbnail ? (
                      <img src={video.thumbnail} alt={video.title} />
                    ) : (
                      <div className="no-thumbnail">📹</div>
                    )}
                  </div>
                  <div className="video-info">
                    <h3 className="video-title">{video.title}</h3>
                    <p className="video-stats">
                      {video.views} views • {new Date(video.uploaded_at).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;