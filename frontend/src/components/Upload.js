import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const Upload = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    video_file: null,
    thumbnail: null
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files[0]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.video_file) {
      setError('Title and video file are required');
      return;
    }

    const uploadData = new FormData();
    uploadData.append('title', formData.title);
    uploadData.append('description', formData.description);
    uploadData.append('video_file', formData.video_file);
    if (formData.thumbnail) {
      uploadData.append('thumbnail', formData.thumbnail);
    }

    try {
      setUploading(true);
      setError(null);
      
      const response = await api.post('/videos/', uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      navigate(`/video/${response.data.id}`);
    } catch (error) {
      console.error('Upload error:', error);
      setError('Failed to upload video. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (!user) {
    return <div className="loading">Redirecting to login...</div>;
  }

  return (
    <div className="upload-page">
      <h1>Upload Video</h1>
      
      {error && <div className="error">{error}</div>}
      
      <form onSubmit={handleSubmit} className="upload-form">
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            className="form-input"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows="4"
            className="form-textarea"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="video_file">Video File *</label>
          <input
            type="file"
            id="video_file"
            name="video_file"
            onChange={handleFileChange}
            accept="video/*"
            required
            className="form-file"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="thumbnail">Thumbnail (Optional)</label>
          <input
            type="file"
            id="thumbnail"
            name="thumbnail"
            onChange={handleFileChange}
            accept="image/*"
            className="form-file"
          />
        </div>
        
        <button 
          type="submit" 
          disabled={uploading}
          className="upload-btn"
        >
          {uploading ? 'Uploading...' : 'Upload Video'}
        </button>
      </form>
    </div>
  );
};

export default Upload;
