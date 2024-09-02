import React from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase-config";
import logo from "../assets/love.png";

const Login = () => {
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      console.log(result.user); // You can handle the user information here
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-base-200">
      <div className="card lg:card-side bg-base-100 shadow-xl">
        <figure>
          <img
            src={logo}
            alt="JapanoLearn Logo"
            className="p-4"
            style={{ maxWidth: "400px", maxHeight: "400px", width: "100%", height: "auto" }}
          />
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
