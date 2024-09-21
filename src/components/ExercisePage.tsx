import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase-config";
import QuizComponent from "./QuizComponents";  // Reuse the Quiz component

interface Exercise {
  lessonID: string;
  questions: {
    question: string;
    options: string[];
    answer: string;
  }[];
}

const ExercisePage = () => {
  const { id } = useParams<{ id: string }>();  // Get lesson ID from the URL
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [score, setScore] = useState<number | null>(null);

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

    fetchExercise();
  }, [id]);

  const handleQuizComplete = (scorePercentage: number) => {
    setScore(scorePercentage);
  };

  return (
    <div className="p-6">
      <h1 className="text-4xl font-bold mb-4">Exercise for Lesson {id}</h1>
      {exercise ? (
        <QuizComponent quiz={exercise} onQuizComplete={handleQuizComplete} />
      ) : (
        <p>Loading exercise...</p>
      )}
      {score !== null && (
        <p className="mt-4 text-lg font-semibold">Your score: {score}%</p>
      )}
    </div>
  );
};

export default ExercisePage;
