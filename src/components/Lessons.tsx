import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase-config"; // Import the Firestore database
import { Link } from "react-router-dom";

interface Lesson {
  id: string;
  title: string;
  description: string;
  videoURL: string;
  content: string;
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

  return (
    <div className="p-6">
      <h1 className="text-4xl font-bold mb-6">Lessons</h1>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {lessons.map(lesson => (
          <div key={lesson.id} className="card lg:card-side bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">{lesson.title}</h2>
              <p>{lesson.description}</p>
              <div className="card-actions justify-end">
                <Link to={`/lessons/${lesson.id}`} className="btn btn-primary">
                  Start
                </Link>
                <button className="btn btn-secondary" disabled>
                  Exercise
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Lessons;
