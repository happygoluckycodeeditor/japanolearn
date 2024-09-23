import { useEffect } from "react";
import { signInWithPopup, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore"; // Firestore functions
import { auth, provider, db } from "../firebase-config"; // Import Firestore
import logo from "../assets/logo.svg"; // Import the new SVG logo
import googleSignIn from "../assets/web_dark_rd_SI.svg"; // Import the new Google Sign-In button SVG
import { useNavigate } from "react-router-dom";
import Typewriter from "typewriter-effect";

const Login = () => {
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
          quizScores: {},
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
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Initialize user stats after login
      await initializeUserStats(user.uid);

      navigate("/home"); // Redirect to the Home page after successful login
    } catch (error) {
      console.error("Error logging in:", error);
      alert("An error occurred during sign-in. Please try again.");
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-base-200">
      {/* Typewriter animation */}
      <div className="mb-6 text-3xl font-bold text-center">
        <span>Learn </span>
        <Typewriter
          options={{
            strings: ["Japanese", "日本語", "with AI"],
            autoStart: true,
            loop: true,
            cursor: "|",
            deleteSpeed: 50,
            delay: 75,
            wrapperClassName: "inline text-[#ff5757]",
            cursorClassName: "inline text-[#ff5757] text-4xl leading-none",
          }}
        />
      </div>

      <div className="card lg:card-side bg-base-100 shadow-xl">
        <figure>
          <img src={logo} alt="JapanoLearn Logo" />
        </figure>
        <div className="card-body">
          <h2 className="card-title">Welcome to JapanoLearn!</h2>
          <p>Let's get started!</p>
          <div className="card-actions justify-end">
            <img
              src={googleSignIn}
              alt="Sign in with Google"
              onClick={signInWithGoogle} // Trigger Google sign-in on image click
              className="cursor-pointer" // Add pointer cursor to the image
            />
          </div>
        </div>
      </div>

      {/* Disclaimer text in Japanese below the card */}
      <p className="text-sm text-gray-600 mt-4 text-center">
        注意事項：Googleを通じてサインインし、レッスンや演習のデータを保存するアカウントを作成します。
        <br />
        アカウントを削除したい場合は、tanmay.bagwe.tb@gmail.comまでご連絡ください。
      </p>
    </div>
  );
};

export default Login;
