import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase-config";
import { Link } from "react-router-dom";

interface Lesson {
  id: string;
  title: string;
  description: string;
  videoURL: string;
  content: string;
  category: string; // New category field
}

const Lessons = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  
  useEffect(() => {
    const fetchLessons = async () => {
      const lessonsCollection = collection(db, "lessons");
      const lessonSnapshot = await getDocs(lessonsCollection);
      const lessonList = lessonSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Lesson[];
      setLessons(lessonList);
    };

    fetchLessons();
  }, []);

  // Filter lessons by category
  const introductionLessons = lessons.filter(lesson => lesson.category === "introduction");
  const beginnerLessons = lessons.filter(lesson => lesson.category === "beginner");
  const aiLessons = lessons.filter(lesson => lesson.category === "ai");

  return (
    <div className="p-6">
      <h1 className="text-4xl font-bold mb-6">Lessons</h1>

      {/* Introduction to Japanolearn */}
      <h2 className="text-2xl font-bold mb-4">Beginner Lessons</h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {introductionLessons.map(lesson => (
          <div key={lesson.id} className="card lg:card-side bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">{lesson.title}</h2>
              <p>{lesson.description}</p>
              <div className="card-actions justify-end">
                <Link to={`/lessons/${lesson.id}`} className="btn btn-primary">
                  Start
                </Link>
                <Link to={`/exercises/${lesson.id}`} className="btn btn-secondary">
                  Exercise
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Beginner Lessons */}
      <h2 className="text-2xl font-bold mb-4">Beginner Lessons</h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {beginnerLessons.map(lesson => (
          <div key={lesson.id} className="card lg:card-side bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">{lesson.title}</h2>
              <p>{lesson.description}</p>
              <div className="card-actions justify-end">
                <Link to={`/lessons/${lesson.id}`} className="btn btn-primary">
                  Start
                </Link>
                <Link to={`/exercises/${lesson.id}`} className="btn btn-secondary">
                Exercise
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* How to Use AI in Japanolearn */}
      <h2 className="text-2xl font-bold mb-4">Fun Videos</h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {aiLessons.map(lesson => (
          <div key={lesson.id} className="card lg:card-side bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">{lesson.title}</h2>
              <p>{lesson.description}</p>
              <div className="card-actions justify-end">
                <Link to={`/lessons/${lesson.id}`} className="btn btn-primary">
                  Start
                </Link>
                <Link to={`/exercises/${lesson.id}`} className="btn btn-secondary">
                Exercise
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Lessons;
