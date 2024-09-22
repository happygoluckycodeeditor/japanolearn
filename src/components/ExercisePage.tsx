import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase-config"; // Assuming firebase-config is correctly set up

interface Question {
  question: string;
  options: string[];
  answer: string;
}

interface Exercise {
  lessonID: string;
  questions: Question[];
}

interface Lesson {
  title: string;
}

interface UserTestData {
  maxExerciseScore: number;
  averageAccuracy: number;
  numberOfTries: number;
  tries: number[]; // Array of individual tries' scores
}

const ExercisePage = () => {
  const { id } = useParams<{ id: string }>();  // Get lesson ID from the URL
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [lessonTitle, setLessonTitle] = useState<string | null>(null); // For storing lesson title
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string }>({});
  const [testCompleted, setTestCompleted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [userTestData, setUserTestData] = useState<UserTestData | null>(null);

  useEffect(() => {
    const fetchExercise = async () => {
      if (id) {
        const exerciseDoc = await getDoc(doc(db, "exercises", id));  // Fetch by the lesson ID directly
        if (exerciseDoc.exists()) {
          setExercise(exerciseDoc.data() as Exercise);
        } else {
          console.log("No exercise found for this lesson.");
        }
      }
    };

    const fetchLessonTitle = async () => {
      if (id) {
        const lessonDoc = await getDoc(doc(db, "lessons", id));  // Fetch the lesson's title from lessons collection
        if (lessonDoc.exists()) {
          const lessonData = lessonDoc.data() as Lesson;
          setLessonTitle(lessonData.title);  // Set the title field
        } else {
          console.log("No lesson found for this ID.");
        }
      }
    };

    const fetchUserTestData = async () => {
      const user = auth.currentUser;
      if (user && id) {
        const userTestDoc = await getDoc(doc(db, "userTestData", `${user.uid}_${id}`));

        if (userTestDoc.exists()) {
          setUserTestData(userTestDoc.data() as UserTestData);
        } else {
          const initialTestData: UserTestData = {
            maxExerciseScore: 0,
            averageAccuracy: 0,
            numberOfTries: 0,
            tries: [],
          };
          await setDoc(doc(db, "userTestData", `${user.uid}_${id}`), initialTestData);
          setUserTestData(initialTestData);
        }
      }
    };

    fetchExercise();
    fetchLessonTitle();  // Fetch the title from lessons collection
    fetchUserTestData();
  }, [id]);

  const handleAnswerSelection = (questionIndex: number, selectedOption: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: selectedOption,
    }));
  };

  const handleTestCompletion = async () => {
    const user = auth.currentUser;
    if (!user || !exercise || !id) return;

    let correctCount = 0;
    exercise.questions.forEach((q, index) => {
      if (selectedAnswers[index] === q.answer) {
        correctCount++;
      }
    });

    const scorePercentage = (correctCount / exercise.questions.length) * 100;
    const newNumberOfTries = (userTestData?.numberOfTries || 0) + 1;
    const newTries = [...(userTestData?.tries || []), scorePercentage];
    const newMaxScore = Math.max(scorePercentage, userTestData?.maxExerciseScore || 0);
    const newAverageAccuracy =
      newTries.reduce((acc, curr) => acc + curr, 0) / newTries.length;

    // Update Firestore
    try {
      await updateDoc(doc(db, "userTestData", `${user.uid}_${id}`), {
        maxExerciseScore: newMaxScore,
        averageAccuracy: newAverageAccuracy,
        numberOfTries: newNumberOfTries,
        tries: newTries,
      });
      setUserTestData({
        maxExerciseScore: newMaxScore,
        averageAccuracy: newAverageAccuracy,
        numberOfTries: newNumberOfTries,
        tries: newTries,
      });
    } catch (error) {
      console.error("Error updating test data:", error);
    }

    setScore(correctCount);
    setTestCompleted(true);
  };

  const handleRetry = () => {
    setSelectedAnswers({});
    setTestCompleted(false);
    setScore(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
      {/* Main content inside a card with solid color #efeae6 */}
      <div className="lg:col-span-2 card p-6" style={{ backgroundColor: "#efeae6", zIndex: 0 }}>
        <h1 className="text-4xl font-bold mb-4">
          {lessonTitle ? `Exercise for ${lessonTitle}` : "Loading lesson..."}
        </h1>
        {exercise ? (
          <div>
            {exercise.questions.map((q, index) => (
              <div key={index} className="mb-4">
                <h4 className="font-semibold">{q.question}</h4>
                <div className="flex flex-col">
                  {q.options.map((option, i) => (
                    <label key={i} className="flex items-center space-x-2 mb-2">
                      <input
                        type="radio"
                        name={`question-${index}`}
                        className="radio"
                        onChange={() => handleAnswerSelection(index, option)}
                        checked={selectedAnswers[index] === option}
                        disabled={testCompleted}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
                {testCompleted && selectedAnswers[index] && (
                  <p className={`text-sm ${selectedAnswers[index] === q.answer ? 'text-green-500' : 'text-red-500'}`}>
                    {selectedAnswers[index] === q.answer ? 'Correct!' : `Wrong! The correct answer is ${q.answer}`}
                  </p>
                )}
              </div>
            ))}

            <div className="flex space-x-4 mt-4">
              <button className="btn btn-primary" onClick={handleTestCompletion} disabled={testCompleted}>
                Submit Quiz
              </button>
              <button className="btn btn-secondary" onClick={handleRetry} disabled={!testCompleted}>
                Retry Quiz
              </button>
            </div>

            {testCompleted && score !== null && (
              <div className="mt-4">
                <p className="text-lg font-semibold">You scored {score} out of {exercise.questions.length}</p>
              </div>
            )}
          </div>
        ) : (
          <p>Loading exercise...</p>
        )}
      </div>

      {/* Right sidebar for stats using DaisyUI cards */}
      <div className="sticky top-5 flex flex-col space-y-4 max-h-[calc(100vh-20px)] overflow-auto">
        <div className="card bg-base-100 shadow-md">
          <div className="card-body">
            <h3 className="card-title">Average Accuracy</h3>
            <p className="text-3xl">
              {userTestData ? userTestData.averageAccuracy.toFixed(2) : "--"}%
            </p>
          </div>
        </div>

        <div className="card bg-base-100 shadow-md">
          <div className="card-body">
            <h3 className="card-title">Max Score</h3>
            <p
              className="text-3xl bg-clip-text text-transparent"
              style={{
                backgroundImage: "linear-gradient(90deg, #ff0000, #ff9900, #ffff00, #00ff00, #0000ff, #4b0082, #8b00ff)",
              }}
            >
              {userTestData ? userTestData.maxExerciseScore : "--"}%
            </p>
          </div>
        </div>

        <div className="card bg-base-100 shadow-md">
          <div className="card-body">
            <h3 className="card-title">Number of Tries</h3>
            <p className="text-3xl">
              {userTestData ? userTestData.numberOfTries : "--"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExercisePage;
