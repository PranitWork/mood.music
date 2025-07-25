// App.jsx
import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import { FaLinkedin, FaInstagram } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;

const App = () => {
  const videoRef = useRef();
  const [expression, setExpression] = useState('');
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoVisible, setVideoVisible] = useState(false);
  const [musicUrls, setMusicUrls] = useState([]);

  const loadModels = async () => {
    const MODEL_URL = '/models';
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
  };

  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        videoRef.current.srcObject = stream;
        setVideoVisible(true);
        setVideoLoaded(true);
      })
      .catch((err) => console.error('Camera Error:', err));
  };

  const moods = {
    happy: 'happy upbeat music',
    sad: 'soothing sad songs',
    angry: 'calm instrumental music',
    surprised: 'exciting pop songs',
    fearful: 'relaxing ambient sounds',
    disgusted: 'mellow lo-fi tracks',
    neutral: 'chill background music'
  };

  const detectMood = async () => {
    if (!videoRef.current) return;

    const detections = await faceapi
      .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceExpressions();

    if (detections && detections.expressions) {
      const mood = Object.entries(detections.expressions).reduce((a, b) => a[1] > b[1] ? a : b)[0];
      setExpression(mood);
      fetchMusic(mood);
    }
  };

  const fetchMusic = async (mood) => {
    const query = moods[mood] || 'relaxing music';

    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&key=${apiKey}&type=video&maxResults=10`
      );
      const data = await response.json();

      if (!data.items || data.items.length === 0) {
        console.error('No results returned from YouTube API:', data);
        return;
      }

      const videoUrls = data.items.map(item =>
        `https://www.youtube.com/embed/${item.id.videoId}?autoplay=0`
      );
      setMusicUrls(videoUrls);
    } catch (error) {
      console.error('YouTube API Error:', error);
    }
  };

  useEffect(() => {
    loadModels();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-tr from-gray-900 via-black to-gray-900 text-white flex flex-col items-center justify-center px-4">
      <h1 className="text-4xl font-bold mb-4 text-center">🎵 MODE_MUSIC</h1>
      <p className="text-gray-400 mb-6 text-center">Detect your mood and get music recommendations instantly</p>

      {!videoVisible && (
        <button onClick={startVideo} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 transition rounded mb-4">
          Turn On Camera
        </button>
      )}

      {videoLoaded && (
        <button onClick={detectMood} className="px-6 py-2 bg-green-600 hover:bg-green-700 transition rounded mb-4">
          Detect Mood
        </button>
      )}

      <div className="mb-4">
        <video ref={videoRef} autoPlay muted width="360" height="270" className="rounded-lg shadow" />
      </div>

      {expression && (
        <div className="mb-6 text-lg">
          Detected Mood: <span className="font-semibold text-yellow-400">{expression}</span>
        </div>
      )}

      {musicUrls.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-5xl mb-10">
          {musicUrls.map((url, index) => (
            <iframe
              key={index}
              width="100%"
              height="250"
              src={url}
              title={`YouTube video ${index + 1}`}
              frameBorder="0"
              allow="autoplay; encrypted-media"
              allowFullScreen
              className="rounded-lg shadow"
            />
          ))}
        </div>
      )}

      <footer className="mt-8 text-sm text-gray-400 text-center flex flex-col items-center gap-2">
        <p>Made with ❤️ By Pranit Daphale</p>
        <div className="flex gap-4 text-xl">
          <a href="https://in.linkedin.com/in/pranitdaphale" target="_blank" rel="noreferrer" className="hover:text-blue-400"><FaLinkedin /></a>
          <a href="https://x.com/pranitdaphale" target="_blank" rel="noreferrer" className="hover:text-white"><FaXTwitter /></a>
          <a href="https://instagram.com/pranit.daphale" target="_blank" rel="noreferrer" className="hover:text-pink-400"><FaInstagram /></a>
        </div>
      </footer>
    </div>
  );
};

export default App;
