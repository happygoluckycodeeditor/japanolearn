import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase-config";
import { collection, getDocs } from "firebase/firestore";
import img1 from "../assets/img1.svg";
import img2 from "../assets/img2.svg";
import img3 from "../assets/img3.svg";

const Home = () => {
  const [userName, setUserName] = useState<string | null>(null);
  const [totalTimeSpent, setTotalTimeSpent] = useState<number | null>(null);
  const [averageProgress, setAverageProgress] = useState<number | null>(null);
  const [overallAverageAccuracy, setOverallAverageAccuracy] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserName(user.displayName);
        fetchTotalTimeSpent(user.uid);
        fetchAverageProgress(user.uid);
        fetchAverageAccuracy(user.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch total time spent from Firestore
  const fetchTotalTimeSpent = async (userUid: string) => {
    try {
      const querySnapshot = await getDocs(collection(db, "userLessonStats"));
      let totalTime = 0;
      querySnapshot.forEach((doc) => {
        if (doc.id.startsWith(userUid + "_")) {
          const data = doc.data();
          if (data.timeSpent) {
            totalTime += data.timeSpent;
          }
        }
      });
      setTotalTimeSpent(totalTime);
    } catch (error) {
      console.error("Error fetching user stats:", error);
    }
  };

  // Fetch average lesson progress from Firestore
  const fetchAverageProgress = async (userUid: string) => {
    try {
      const querySnapshot = await getDocs(collection(db, "userLessonStats"));
      let totalProgress = 0;
      let count = 0;
      querySnapshot.forEach((doc) => {
        if (doc.id.startsWith(userUid + "_")) {
          const data = doc.data();
          if (data.lessonProgress !== undefined) {
            totalProgress += data.lessonProgress;
            count++;
          }
        }
      });
      const avgProgress = count > 0 ? totalProgress / count : 0;
      setAverageProgress(avgProgress);
    } catch (error) {
      console.error("Error fetching lesson progress:", error);
    }
  };

  // Fetch overall average accuracy from Firestore
  const fetchAverageAccuracy = async (userUid: string) => {
    try {
      const querySnapshot = await getDocs(collection(db, "userTestData"));
      let totalAccuracy = 0;
      let count = 0;
      querySnapshot.forEach((doc) => {
        if (doc.id.startsWith(userUid + "_")) {
          const data = doc.data();
          // Check if averageAccuracy is defined and greater than 0
          if (data.averageAccuracy !== undefined && data.averageAccuracy > 0) {
            totalAccuracy += data.averageAccuracy;
            count++;
          }
        }
      });
      const overallAvgAccuracy = count > 0 ? totalAccuracy / count : 0;
      setOverallAverageAccuracy(overallAvgAccuracy);
    } catch (error) {
      console.error("Error fetching average accuracy:", error);
    }
  };

  // Convert seconds to hours and minutes
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return (
      <div className="text-center">
        <span className="text-4xl font-bold">{hours}h</span>
        <span className="text-4xl font-semibold ml-2">{minutes}m</span>
      </div>
    );
  };

  return (
    <div className="p-6 sm:pl-10 sm:pr-10 md:pl-24 md:pr-24">
      {/* Greeting */}
      <h1 className="text-4xl font-bold">Hi, {userName ? userName : "User"}!</h1>
      <p className="mt-4">Let's Start learning Japanese</p>

      {/* Masonry Layout */}
      <div className="mt-6">
        <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3 }}>
          <Masonry gutter="16px">
            {/* Card 1 - Lessons */}
            <div
              className="relative bg-gray-200 rounded-lg h-48 cursor-pointer transition-shadow duration-300 ease-in-out hover:shadow-2xl"
              onClick={() => navigate("/lessons")}
            >
              <img
                src={img1}
                alt="Lessons"
                className="w-full h-full object-cover rounded-lg"
                style={{ filter: "brightness(0.7)" }}
              />
              <div className="absolute inset-0 flex flex-col justify-center items-center text-white">
                <h2 className="text-2xl font-bold">Lessons</h2>
                <p className="text-sm ml-3 mr-3">Practice and improve your Japanese skills</p>
              </div>
            </div>

            {/* Card 2 - Exercises */}
            <div
              className="relative bg-gray-200 rounded-lg h-64 cursor-pointer transition-shadow duration-300 ease-in-out hover:shadow-2xl"
              onClick={() => navigate("/exercises")}
            >
              <img
                src={img2}
                alt="Exercises"
                className="w-full h-full object-cover rounded-lg"
                style={{ filter: "brightness(0.7)" }}
              />
              <div className="absolute inset-0 flex flex-col justify-center items-center text-white">
                <h2 className="text-2xl font-bold">Exercises</h2>
                <p className="text-sm ml-3 mr-3">Practice and improve your Japanese skills</p>
              </div>
            </div>

            {/* Card 3 - Average Lesson Progress */}
            <div className="bg-[#fde265] p-4 rounded-lg h-52 flex flex-col justify-center items-center transition-shadow duration-300 ease-in-out hover:shadow-2xl">
              <h2 className="text-2xl font-bold text-black">Average Lesson Progress</h2>
              <div className="mt-4">
                {averageProgress !== null ? (
                  <div
                    className="radial-progress text-black"
                    style={{ "--value": Math.round(averageProgress) } as React.CSSProperties}
                    role="progressbar"
                  >
                    {Math.round(averageProgress)}%
                  </div>
                ) : (
                  "Loading..."
                )}
              </div>
            </div>

            {/* Card 4 - Total Time Spent */}
            <div className="bg-[#ff5757] p-4 rounded-lg h-52 text-white flex flex-col justify-center items-center transition-shadow duration-300 ease-in-out hover:shadow-2xl">
              <h2 className="text-2xl font-bold">Total Time Spent in Lessons</h2>
              <div className="mt-4">
                {totalTimeSpent !== null ? formatTime(totalTimeSpent) : "Loading..."}
              </div>
            </div>

            {/* Card 5 - Overall Average Accuracy */}
            <div className="bg-[#fde265] p-4 rounded-lg h-52 flex flex-col justify-center items-center transition-shadow duration-300 ease-in-out hover:shadow-2xl">
              <h2 className="text-2xl font-bold text-black">Overall Average Accuracy in Exercises</h2>
              <div className="mt-4">
                {overallAverageAccuracy !== null ? (
                  <div
                    className="radial-progress text-black"
                    style={{ "--value": Math.round(overallAverageAccuracy) } as React.CSSProperties}
                    role="progressbar"
                  >
                    {Math.round(overallAverageAccuracy)}%
                  </div>
                ) : (
                  "Loading..."
                )}
              </div>
            </div>

            {/* Card 6 - Dictionary */}
            <div
              className="relative bg-gray-200 rounded-lg h-48 cursor-pointer transition-shadow duration-300 ease-in-out hover:shadow-2xl"
              onClick={() => navigate("/dictionary")}
            >
              <img
                src={img3}
                alt="Dictionary"
                className="w-full h-full object-cover rounded-lg"
                style={{ filter: "brightness(0.7)" }}
              />
              <div className="absolute inset-0 flex flex-col justify-center items-center text-white">
                <h2 className="text-2xl font-bold">Dictionary</h2>
                <p className="text-sm ml-3 mr-3">Search and explore Japanese words</p>
              </div>
            </div>
          </Masonry>
        </ResponsiveMasonry>
      </div>
    </div>
  );
};

export default Home;
