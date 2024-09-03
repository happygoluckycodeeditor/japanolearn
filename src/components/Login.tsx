//import React from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase-config";
import logo from "../assets/logo.svg"; // Import the new SVG logo
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      console.log(result.user);

      // Navigate to the Home page after successful login
      navigate("/home");
    } catch (error) {
      console.error("Error logging in:", error);
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
            <button onClick={signInWithGoogle} className="btn btn-primary">
              Sign in with Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
