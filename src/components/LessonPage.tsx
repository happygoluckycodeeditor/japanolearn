import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase-config";

interface Lesson {
  title: string;
  videoURL: string;
  content: string;
}

const LessonPage = () => {
  const { id } = useParams<{ id: string }>();
  const [lesson, setLesson] = useState<Lesson | null>(null);

  useEffect(() => {
    const fetchLesson = async () => {
      if (id) {
        const lessonDoc = await getDoc(doc(db, "lessons", id));
        if (lessonDoc.exists()) {
          const data = lessonDoc.data() as Lesson;
          const videoID = new URL(data.videoURL).searchParams.get("v");
          const embedURL = `https://www.youtube.com/embed/${videoID}`;
          setLesson({ ...data, videoURL: embedURL });
        }
      }
    };

    fetchLesson();
  }, [id]);

  if (!lesson) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-4xl font-bold mb-4">{lesson.title}</h1>
      <div className="mb-6">
        <iframe
          width="100%"
          height="400"
          src={lesson.videoURL}
          title={lesson.title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
      <p className="mb-6">{lesson.content}</p>
      <button className="btn btn-primary btn-lg" disabled>
        Are you ready to practice a little? Exercise
      </button>
    </div>
  );
};

export default LessonPage;
