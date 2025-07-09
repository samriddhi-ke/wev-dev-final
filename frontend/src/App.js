import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Home from './components/Home';
import Upload from './components/Upload';
import Login from './components/Login';
import Register from './components/Register';
import VideoPlayer from './components/VideoPlayer';
import Dashboard from './components/Dashboard';
import WatchLater from './components/WatchLater';
import UserProfile from './components/UserProfile';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Navbar />
          <div className="app-body">
            <Sidebar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/upload" element={<Upload />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/video/:id" element={<VideoPlayer />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/watch-later" element={<WatchLater />} />
                <Route path="/user/:id" element={<UserProfile />} />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;