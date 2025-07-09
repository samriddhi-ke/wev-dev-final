import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../services/api';

const Home = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();

  useEffect(() => {
    fetchVideos();
  }, [location.search]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams(location.search);
      const searchQuery = params.get('search');
      
      let url = '/videos/';
      if (searchQuery) {
        url = `/search/?q=${encodeURIComponent(searchQuery)}`;
      }
      
      const response = await api.get(url);
      setVideos(response.data.results || response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching videos:', error);
      setError('Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading videos...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="home">
      <div className="video-grid">
        {videos.map(video => (
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
                <p className="video-uploader">{video.uploader?.username}</p>
                <p className="video-stats">
                  {video.views} views • {new Date(video.uploaded_at).toLocaleDateString()}
                </p>
              </div>
            </Link>
          </div>
        ))}
      </div>
      {videos.length === 0 && (
        <div className="no-videos">
          <h2>No videos found</h2>
          <p>Try searching for something else or check back later.</p>
        </div>
      )}
    </div>
  );
};

export default Home;