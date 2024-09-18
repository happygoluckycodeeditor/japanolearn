import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase-config";
import YouTube, { YouTubeProps, YouTubePlayer } from "react-youtube";

interface Lesson {
  title: string;
  videoURL: string;
  content: string;
}

const LessonPage = () => {
  const { id } = useParams<{ id: string }>();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [player, setPlayer] = useState<YouTubePlayer | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [videoWatched, setVideoWatched] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    const fetchLesson = async () => {
      if (id) {
        const lessonDoc = await getDoc(doc(db, "lessons", id));
        if (lessonDoc.exists()) {
          const data = lessonDoc.data() as Lesson;
          const videoID = new URL(data.videoURL).searchParams.get("v");
          setLesson({ ...data, videoURL: videoID ?? "" });
        }
      }
    };
    fetchLesson();
  }, [id]);

  useEffect(() => {
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const onReady: YouTubeProps["onReady"] = (event) => {
    setPlayer(event.target);
  };

  const onStateChange: YouTubeProps["onStateChange"] = (event) => {
    if (event.data === 1 && player && !intervalRef.current) {
      const duration = player.getDuration();
      intervalRef.current = window.setInterval(() => {
        if (player) {
          const currentTime = player.getCurrentTime();
          if (currentTime >= 0.8 * duration) {
            if (!videoWatched) {
              setVideoWatched(true);
              updateProgress();
            }
            if (intervalRef.current !== null) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
          }
        }
      }, 1000);
    } else if (event.data !== 1 && intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const updateProgress = () => {
    const targetProgress = (videoWatched ? 50 : 0) + (testCompleted ? 50 : 0);
    animateProgress(targetProgress);
  };

  const animateProgress = (targetValue: number) => {
    const duration = 1000; // Animation duration in milliseconds
    const frameRate = 60; // Frames per second
    const totalFrames = Math.round((duration / 1000) * frameRate);
    const increment = (targetValue - progress) / totalFrames;

    let currentFrame = 0;
    const animationInterval = setInterval(() => {
      currentFrame++;
      setProgress((prevProgress) => prevProgress + increment);

      if (currentFrame === totalFrames) {
        setProgress(targetValue); // Ensure it reaches the exact target value
        clearInterval(animationInterval);
      }
    }, duration / totalFrames);
  };

  const handleTestCompletion = () => {
    if (!testCompleted) {
      setTestCompleted(true);
      updateProgress();
    }
  };

  useEffect(() => {
    updateProgress();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoWatched, testCompleted]);

  if (!lesson) {
    return <div>Loading...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
      {/* Left side: Video and content */}
      <div className="lg:col-span-2">
        <h1 className="text-4xl font-bold mb-4">{lesson.title}</h1>
        <div className="mb-6">
          <YouTube
            videoId={lesson.videoURL}
            onReady={onReady}
            onStateChange={onStateChange}
            opts={{
              width: "100%",
              height: "400",
              playerVars: {
                autoplay: 0,
                controls: 1,
                modestbranding: 1,
              },
            }}
          />
        </div>
        <p className="mb-6">{lesson.content}</p>

        {/* Test Button */}
        <button
          className="btn btn-primary btn-lg"
          onClick={handleTestCompletion}
          // Removed the disabled prop
          // disabled={!videoWatched}
        >
          {testCompleted ? "Test Completed" : "Start the Test"}
        </button>
      </div>

      {/* Right side: Lesson progress */}
      <div
        className="card bg-gray-100 shadow-lg p-6 sticky top-5 flex items-center justify-center"
        style={{ height: "fit-content" }}
      >
        <h2 className="text-2xl font-semibold mb-4 text-center">Lesson Progress</h2>
        <div
          className="radial-progress"
          style={
            {
              "--value": progress,
              "--size": "12rem",
              "--thickness": "2rem",
              transition: "stroke-dashoffset 0.5s ease-in-out",
            } as React.CSSProperties
          }
          role="progressbar"
        >
          {Math.round(progress)}%
        </div>
      </div>
    </div>
  );
};

export default LessonPage;
