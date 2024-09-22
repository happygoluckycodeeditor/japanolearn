import { useState } from "react";

// Define the interfaces locally within the file
interface Question {
  question: string;
  options: string[];
  answer: string;
}

interface Quiz {
  questions: Question[];
}

interface QuizProps {
  quiz: Quiz;
  onQuizComplete: (score: number) => void;
}

const QuizComponent: React.FC<QuizProps> = ({ quiz, onQuizComplete }) => {
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string }>({});
  const [testCompleted, setTestCompleted] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  const handleAnswerSelection = (questionIndex: number, selectedOption: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: selectedOption,
    }));
  };

  const handleTestCompletion = () => {
    let correctCount = 0;
    quiz.questions.forEach((q, index) => {
      if (selectedAnswers[index] === q.answer) {
        correctCount++;
      }
    });

    setScore(correctCount);  // Set score, even if 0
    setTestCompleted(true);
    onQuizComplete((correctCount / quiz.questions.length) * 100);
  };

  const handleRetry = () => {
    setSelectedAnswers({});
    setTestCompleted(false);
    setScore(null);
  };

  return (
    <div className="card bg-cream p-6">
      {quiz.questions.map((q, index) => (
        <div key={index} className="mb-4">
          <h4 className="font-semibold">{q.question}</h4>
          <div className="flex flex-col">
            {q.options.map((option, i) => (
              <label key={i} className={`flex items-center space-x-2 mb-2`}>
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
        <p className="mt-4 text-lg font-semibold">You scored {score} out of {quiz.questions.length}</p>
      )}
    </div>
  );
};

export default QuizComponent;
