import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <Link to="/" className="sidebar-link">
          🏠 Home
        </Link>
        <Link to="/trending" className="sidebar-link">
          📈 Trending
        </Link>
        <Link to="/subscriptions" className="sidebar-link">
          📺 Subscriptions
        </Link>
      </div>
      
      {user && (
        <div className="sidebar-section">
          <h3>Library</h3>
          <Link to="/dashboard" className="sidebar-link">
            📹 Your Videos
          </Link>
          <Link to="/watch-later" className="sidebar-link">
            🕐 Watch Later
          </Link>
          <Link to="/liked" className="sidebar-link">
            👍 Liked Videos
          </Link>
        </div>
      )}
      
      <div className="sidebar-section">
        <h3>Categories</h3>
        <Link to="/?category=music" className="sidebar-link">
          🎵 Music
        </Link>
        <Link to="/?category=gaming" className="sidebar-link">
          🎮 Gaming
        </Link>
        <Link to="/?category=sports" className="sidebar-link">
          ⚽ Sports
        </Link>
        <Link to="/?category=news" className="sidebar-link">
          📰 News
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
