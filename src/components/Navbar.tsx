//import React from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase-config";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate("/"); // Redirect to login page
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div className="navbar bg-base-100">
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow">
            <li><a href="/home">Home</a></li>
            <li>
              <a>Lessons</a>
              <ul className="p-2">
                <li><a href="/lessons">All Lessons</a></li>
              </ul>
            </li>
            <li><a href="/exercises">Exercises</a></li>
            <li><a href="/dictionary">Dictionary</a></li>
          </ul>
        </div>
        <a href="/home" className="btn btn-ghost text-xl">JapanoLearn</a>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          <li><a href="/home">Home</a></li>
          <li>
            <details>
              <summary>Lessons</summary>
              <ul className="p-2">
                <li><a href="/lessons">All Lessons</a></li>
              </ul>
            </details>
          </li>
          <li><a href="/exercises">Exercises</a></li>
          <li><a href="/dictionary">Dictionary</a></li>
        </ul>
      </div>
      <div className="navbar-end">
        <button onClick={handleLogout} className="btn btn-primary">Logout</button>
      </div>
    </div>
  );
};

export default Navbar;
