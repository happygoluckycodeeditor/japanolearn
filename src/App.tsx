import { Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Lessons from './components/Lessons';
import Exercises from './components/Exercises';
import Login from './components/Login';
import PrivateRoute from './components/PrivateRoute';
import Dictionary from './components/Dictionary';


export default function App() {
  return (
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
  );
}
