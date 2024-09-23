import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { auth } from "../firebase-config"; // Import Firebase authentication

const Home = () => {
  const [userName, setUserName] = useState<string | null>(null);

  // Listen to authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserName(user.displayName); // Set the user's display name
      }
    });
    return () => unsubscribe(); // Clean up the listener on unmount
  }, []);

  return (
    <div className="p-6 pl-24 pr-24">
      {/* Greeting */}
      <h1 className="text-4xl font-bold">
        Hi, {userName ? userName : "User"}! 
      </h1>
      <p className="mt-4">Let's Start learning Japanese</p>

      {/* Masonry Layout */}
      <div className="mt-6">
        <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3 }}>
          <Masonry gutter="16px">
            <div className="bg-gray-200 p-4 rounded-lg h-48">Card 1</div>
            <div className="bg-gray-200 p-4 rounded-lg h-64">Card 2</div>
            <div className="bg-gray-200 p-4 rounded-lg h-40">Card 3</div>
            <div className="bg-gray-200 p-4 rounded-lg h-52">Card 4</div>
            <div className="bg-gray-200 p-4 rounded-lg h-64">Card 5</div>
          </Masonry>
        </ResponsiveMasonry>
      </div>
    </div>
  );
};

export default Home;
