import { useEffect, useState } from "react";
import { signInWithPopup, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore"; // Firestore functions
import { auth, provider, db } from "../firebase-config"; // Import Firestore
import logo from "../assets/logo.svg"; // Import the new SVG logo
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [loading, setLoading] = useState(false); // State for loading spinner
  const navigate = useNavigate();

  // Initialize user stats in Firestore
  const initializeUserStats = async (userId: string) => {
    try {
      const userDocRef = doc(db, "userStats", userId); // Reference to user stats document
      const userDocSnap = await getDoc(userDocRef); // Fetch the document

      // Check if the user document exists
      if (!userDocSnap.exists()) {
        // If it doesn't exist, create a new document with default values
        await setDoc(userDocRef, {
          totalTimeSpent: 0, // in seconds
          lessonsCompleted: 0,
          lastLessonId: null,
          quizScores: {}
        });
        console.log("User stats initialized for:", userId);
      }
    } catch (error) {
      console.error("Error initializing user stats:", error);
    }
  };

  // Check if the user is already authenticated
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await initializeUserStats(user.uid); // Initialize stats for the logged-in user
        navigate("/home"); // Redirect to home if already logged in
      }
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, [navigate]);

  const signInWithGoogle = async () => {
    setLoading(true); // Start loading spinner
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Initialize user stats after login
      await initializeUserStats(user.uid);

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
