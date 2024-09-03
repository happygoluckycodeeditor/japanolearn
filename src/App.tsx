import { Routes, Route, useLocation } from 'react-router-dom';
import Home from './components/Home';
import Lessons from './components/Lessons';
import Exercises from './components/Exercises';
import Login from './components/Login';
import Dictionary from './components/Dictionary';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import LessonPage from './components/LessonPage';

export default function App() {
  const location = useLocation();

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
