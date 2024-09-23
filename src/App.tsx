import { useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { signOut, onAuthStateChanged } from "firebase/auth";
import Home from './components/Home';
import Lessons from './components/Lessons';
import Exercises from './components/Exercises';
import Login from './components/Login';
import Dictionary from './components/Dictionary';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import LessonPage from './components/LessonPage';

import { auth } from './firebase-config';
import ExercisePage from './components/ExercisePage';

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    // Check if the user is already authenticated
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user && location.pathname !== '/') {
        // If the user is not logged in and tries to access a protected route, redirect to login
        navigate('/');
      }
    });

    // Set a timer for inactivity (30 minutes) and sign the user out if there's no activity
    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        // Log the user out after 30 minutes of inactivity
        signOut(auth).then(() => {
          navigate('/'); // Redirect to login page after sign-out
        });
      }, 30 * 60 * 1000); // 30 minutes
    };

    // Listen for user activity (mouse or keyboard) to reset the inactivity timer
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);

    // Initialize the timer when the app loads
    resetTimer();

    // Clean up event listeners and unsubscribe from Firebase auth changes when the component unmounts
    return () => {
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, [location.pathname, navigate]);
  return (
    <div>
      {/* Conditionally render the Navbar only if not on the login page */}
      {location.pathname !== '/' && <Navbar />}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/home"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
        <Route
          path="/lessons"
          element={
            <PrivateRoute>
              <Lessons />
            </PrivateRoute>
          }
        />
        <Route
          path="/lessons/:id"
          element={
            <PrivateRoute>
              <LessonPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/exercises"
          element={
            <PrivateRoute>
              <Exercises />
            </PrivateRoute>
          }
        />
        <Route
        path="/exercises/:id"
        element={
          <PrivateRoute>
            <ExercisePage />
          </PrivateRoute>
        }
        />
        <Route
          path="/dictionary"
          element={
            <PrivateRoute>
              <Dictionary />
            </PrivateRoute>
          }
        />

      </Routes>
    </div>
  );
}
