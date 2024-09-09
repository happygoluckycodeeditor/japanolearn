import { useEffect, useState } from "react";
import { signInWithPopup, onAuthStateChanged } from "firebase/auth";
import { auth, provider } from "../firebase-config";
import logo from "../assets/logo.svg"; // Import the new SVG logo
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [loading, setLoading] = useState(false); // State for loading spinner
  const navigate = useNavigate();

  // Check if the user is already authenticated
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/home"); // Redirect to home if already logged in
      }
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, [navigate]);

  const signInWithGoogle = async () => {
    setLoading(true); // Start loading spinner
    try {
      await signInWithPopup(auth, provider);
      navigate("/home"); // Redirect to the Home page after successful login
    } catch (error) {
      console.error("Error logging in:", error);
      alert("An error occurred during sign-in. Please try again.");
    } finally {
      setLoading(false); // Stop loading spinner after process
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-base-200">
      <div className="card lg:card-side bg-base-100 shadow-xl">
        <figure>
          <img src={logo} alt="JapanoLearn Logo" />
        </figure>
        <div className="card-body">
          <h2 className="card-title">Welcome to JapanoLearn!</h2>
          <p>Let's get started!</p>
          <div className="card-actions justify-end">
            <button 
              onClick={signInWithGoogle} 
              className="btn btn-primary" 
              disabled={loading} // Disable button during loading
            >
              {loading ? (
                <span className="loading loading-ring loading-lg"></span> // DaisyUI loading ring
              ) : (
                "Sign in with Google"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
