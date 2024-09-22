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

interface UserTestData {
  maxExerciseScore: number;
  averageAccuracy: number;
  numberOfTries: number;
  tries: number[]; // Array of individual tries' scores
}

const ExercisePage = () => {
  const { id } = useParams<{ id: string }>();  // Get lesson ID from the URL
  const [exercise, setExercise] = useState<Exercise | null>(null);
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
    <div className="p-6 card bg-cream">
      <h1 className="text-4xl font-bold mb-4">Exercise for Lesson {id}</h1>
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
              {userTestData && (
                <p>
                  Max Score: {userTestData.maxExerciseScore}, 
                  Average Accuracy: {userTestData.averageAccuracy.toFixed(2)}%, 
                  Number of Tries: {userTestData.numberOfTries}
                </p>
              )}
            </div>
          )}
        </div>
      ) : (
        <p>Loading exercise...</p>
      )}
    </div>
  );
};

export default ExercisePage;
