import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase-config";
import { onAuthStateChanged } from "firebase/auth";
import YouTube, { YouTubeProps, YouTubePlayer } from "react-youtube";

interface Lesson {
  title: string;
  videoURL: string;
  content: string;
}

interface Quiz {
  questions: { question: string; options: string[]; answer: string }[];
}

interface UserLessonStats {
  lessonProgress: number;
  timeSpent: number;
  maxQuizScore: number;
}

const secondsToTime = (totalSeconds: number) => {
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds };
};

const LessonPage = () => {
  const { id } = useParams<{ id: string }>();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [player, setPlayer] = useState<YouTubePlayer | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [videoWatched, setVideoWatched] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string }>({});
  const [score, setScore] = useState<number | null>(null);

  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  const [userLessonStats, setUserLessonStats] = useState<UserLessonStats | null>(null);

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

    const fetchQuiz = async () => {
      if (id) {
        const quizDoc = await getDoc(doc(db, "quizzes", id));
        if (quizDoc.exists()) {
          setQuiz(quizDoc.data() as Quiz);
        }
      }
    };

    const fetchUserLessonStats = async (userUid: string) => {
      if (id && userUid) {
        const statsDoc = await getDoc(doc(db, "userLessonStats", `${userUid}_${id}`));
        if (statsDoc.exists()) {
          const stats = statsDoc.data() as UserLessonStats;
          setUserLessonStats(stats);
          setProgress(stats.lessonProgress);
          setVideoWatched(stats.lessonProgress >= 50);
          setTestCompleted(stats.lessonProgress === 100);
          const { days, hours, minutes, seconds } = secondsToTime(stats.timeSpent);
          setDays(days);
          setHours(hours);
          setMinutes(minutes);
          setSeconds(seconds);
        } else {
          const initialStats: UserLessonStats = {
            lessonProgress: 0,
            timeSpent: 0,
            maxQuizScore: 0,
          };
          await setDoc(
            doc(db, "userLessonStats", `${userUid}_${id}`),
            initialStats,
            { merge: true }
          );
          setUserLessonStats(initialStats);
        }
      }
    };

    fetchLesson();
    fetchQuiz();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUserLessonStats(user.uid);
      } else {
        setUserLessonStats(null);
      }
    });

    return () => unsubscribe();
  }, [id]);

  // Timer logic with setInterval
  useEffect(() => {
    const timeInterval = setInterval(() => {
      setSeconds((prevSeconds) => {
        if (prevSeconds + 1 === 60) {
          setMinutes((prevMinutes) => {
            if (prevMinutes + 1 === 60) {
              setHours((prevHours) => {
                if (prevHours + 1 === 24) {
                  setDays((prevDays) => prevDays + 1);
                  return 0;
                }
                return prevHours + 1;
              });
              return 0;
            }
            return prevMinutes + 1;
          });
          return 0;
        }
        return prevSeconds + 1;
      });
    }, 1000);

    return () => {
      clearInterval(timeInterval);
      updateTimeSpent();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Beforeunload listener for saving time spent when user navigates away
  useEffect(() => {
    const handleBeforeUnload = () => {
      updateTimeSpent();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days, hours, minutes, seconds]);

  const updateTimeSpent = async () => {
    if (auth.currentUser && id && userLessonStats) {
      const newTotalSeconds = days * 86400 + hours * 3600 + minutes * 60 + seconds;
      const updatedTimeSpent = userLessonStats.timeSpent + newTotalSeconds;
      try {
        await updateDoc(doc(db, "userLessonStats", `${auth.currentUser.uid}_${id}`), {
          timeSpent: updatedTimeSpent,
          lastAccessed: new Date(),
        });
        setUserLessonStats((prev) =>
          prev ? { ...prev, timeSpent: updatedTimeSpent } : null
        );
        console.log("Time spent updated successfully");
      } catch (error) {
        console.error("Error updating time spent:", error);
      }
    }
  };

  const onReady: YouTubeProps["onReady"] = (event) => {
    setPlayer(event.target);
  };

  const onStateChange: YouTubeProps["onStateChange"] = (event) => {
    if (event.data === YouTube.PlayerState.PLAYING && player) {
      const checkProgress = () => {
        const currentTime = player.getCurrentTime();
        const duration = player.getDuration();
        if (currentTime / duration >= 0.8 && !videoWatched) {
          setVideoWatched(true);
          updateProgress();
          clearInterval(intervalRef.current!);
        }
      };
      intervalRef.current = window.setInterval(checkProgress, 1000);
    } else if (
      event.data === YouTube.PlayerState.PAUSED ||
      event.data === YouTube.PlayerState.ENDED
    ) {
      clearInterval(intervalRef.current!);
    }
  };

  const updateProgress = async () => {
    if (!auth.currentUser || !id || !userLessonStats) return;

    const newProgress = Math.max(
      userLessonStats.lessonProgress || 0,
      Math.min((videoWatched ? 50 : 0) + (testCompleted ? 50 : 0), 100)
    );

    if (newProgress !== userLessonStats.lessonProgress) {
      try {
        await updateDoc(
          doc(db, "userLessonStats", `${auth.currentUser.uid}_${id}`),
          {
            lessonProgress: newProgress,
            lastAccessed: new Date(),
          }
        );
        setUserLessonStats((prev) =>
          prev ? { ...prev, lessonProgress: newProgress } : null
        );
        animateProgress(newProgress);
      } catch (error) {
        console.error("Error updating progress:", error);
      }
    }
  };

  const animateProgress = (targetValue: number) => {
    const duration = 1000;
    const frameRate = 60;
    const totalFrames = Math.round((duration / 1000) * frameRate);
    const increment = (targetValue - progress) / totalFrames;

    let currentFrame = 0;
    const animationInterval = setInterval(() => {
      currentFrame++;
      setProgress((prevProgress) => {
        const newProgress = prevProgress + increment;
        return currentFrame === totalFrames ? targetValue : newProgress;
      });

      if (currentFrame === totalFrames) {
        clearInterval(animationInterval);
      }
    }, duration / totalFrames);
  };

  const handleAnswerSelection = (questionIndex: number, selectedOption: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: selectedOption,
    }));
  };

  const handleTestCompletion = async () => {
    if (!auth.currentUser || !id || !quiz) return;

    let correctCount = 0;
    quiz.questions.forEach((q, index) => {
      if (selectedAnswers[index] === q.answer) {
        correctCount++;
      }
    });

    const scorePercentage = (correctCount / quiz.questions.length) * 100;
    await updateDoc(
      doc(db, "userLessonStats", `${auth.currentUser.uid}_${id}`),
      {
        maxQuizScore: Math.max(scorePercentage, userLessonStats?.maxQuizScore || 0),
        lastAccessed: new Date(),
      }
    );
    setUserLessonStats((prev) =>
      prev
        ? {
            ...prev,
            maxQuizScore: Math.max(scorePercentage, prev.maxQuizScore),
          }
        : null
    );

    setScore(correctCount);
    setTestCompleted(true);
    updateProgress();
  };

  if (!lesson || !userLessonStats) {
    return <div>Loading...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
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

        <div className="collapse bg-base-200 mb-6">
          <input type="checkbox" />
          <div className="collapse-title text-xl font-medium">
            Click here to start the quiz
          </div>
          <div className="collapse-content">
            {quiz ? (
              <div>
                {quiz.questions.map((q, index) => (
                  <div key={index} className="mb-4">
                    <h4 className="font-semibold">{q.question}</h4>
                    <div className="flex flex-col">
                      {q.options.map((option, i) => {
                        const isCorrect = testCompleted && option === q.answer;
                        const isSelected = selectedAnswers[index] === option;
                        return (
                          <label
                            key={i}
                            className={`flex items-center space-x-2 mb-2 border ${
                              testCompleted
                                ? isCorrect
                                  ? "border-green-400"
                                  : isSelected
                                  ? "border-red-400"
                                  : ""
                                : ""
                            }`}
                          >
                            <input
                              type="radio"
                              name={`question-${index}`}
                              className="radio"
                              onChange={() => handleAnswerSelection(index, option)}
                              disabled={testCompleted}
                            />
                            <span>{option}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
                <button
                  className="btn btn-primary mt-4"
                  onClick={handleTestCompletion}
                  disabled={testCompleted}
                >
                  Submit Quiz
                </button>
                {testCompleted && score !== null && (
                  <p className="mt-4 text-lg font-semibold">
                    You scored {score} out of {quiz.questions.length}
                  </p>
                )}
              </div>
            ) : (
              <p>Loading quiz...</p>
            )}
          </div>
        </div>
      </div>

      <div className="sticky pt-6 top-5 flex flex-col gap-4 max-h-[calc(100vh-20px)] overflow-auto">
        <div className="card bg-gray-100 shadow-lg p-6 flex items-center justify-center flex-col" style={{ height: "fit-content" }}>
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
      
        <div className="card bg-gray-100 shadow-lg p-6 flex items-center justify-center flex-col">
          <h2 className="text-2xl font-semibold mb-4 text-center">Time spent on this lesson</h2>
          <div className="grid grid-flow-col gap-5 text-center auto-cols-max">
            <div className="flex flex-col">
              <span className="countdown font-mono text-5xl">
                <span style={{ "--value": days } as React.CSSProperties}></span>
              </span>
              days
            </div>
            <div className="flex flex-col">
              <span className="countdown font-mono text-5xl">
                <span style={{ "--value": hours } as React.CSSProperties}></span>
              </span>
              hours
            </div>
            <div className="flex flex-col">
              <span className="countdown font-mono text-5xl">
                <span style={{ "--value": minutes } as React.CSSProperties}></span>
              </span>
              min
            </div>
            <div className="flex flex-col">
              <span className="countdown font-mono text-5xl">
                <span style={{ "--value": seconds } as React.CSSProperties}></span>
              </span>
              sec
            </div>
          </div>
        </div>
        
       
        {userLessonStats && (
          <div className="card bg-gray-100 shadow-lg p-6 flex items-center justify-center flex-col">
            <h2 className="text-2xl font-semibold mb-4 text-center">Highest Quiz Score</h2>
            <p className="text-4xl font-bold">{Math.round(userLessonStats.maxQuizScore)}%</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonPage;
