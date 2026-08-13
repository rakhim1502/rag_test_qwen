import { useState, useEffect } from 'react';
import axios from 'axios';

const Quizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState('');
  const [questionCount, setQuestionCount] = useState(5);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetchDocuments();
    fetchQuizzes();
  }, []);

  const fetchDocuments = async () => {
    try {
      const { data } = await axios.get('/api/documents');
      setDocuments(data);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    }
  };

  const fetchQuizzes = async () => {
    try {
      const { data } = await axios.get('/api/quizzes');
      setQuizzes(data);
    } catch (error) {
      console.error('Failed to fetch quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedDoc) return;

    setGenerating(true);
    try {
      const { data } = await axios.post('/api/quizzes/generate', {
        documentId: selectedDoc,
        questionCount
      });
      setActiveQuiz(data.quiz);
      setAnswers({});
      setSubmitted(false);
      setResult(null);
    } catch (error) {
      alert('Failed to generate quiz');
    } finally {
      setGenerating(false);
    }
  };

  const handleAnswerSelect = (questionIdx, optionIdx) => {
    setAnswers(prev => ({ ...prev, [questionIdx]: optionIdx }));
  };

  const handleSubmit = async () => {
    const answerArray = Object.keys(answers).map(key => answers[key]);
    if (answerArray.length !== activeQuiz.totalQuestions) {
      if (!window.confirm('You haven\'t answered all questions. Submit anyway?')) return;
    }

    try {
      const { data } = await axios.post(`/api/quizzes/${activeQuiz._id}/submit`, {
        answers: answerArray
      });
      setResult(data);
      setSubmitted(true);
      fetchQuizzes();
    } catch (error) {
      alert('Failed to submit quiz');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Quiz Taking View
  if (activeQuiz && !submitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">{activeQuiz.title}</h1>
            <button
              onClick={() => setActiveQuiz(null)}
              className="text-gray-600 hover:text-gray-800"
            >
              Exit Quiz
            </button>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            {activeQuiz.questions.map((q, qIdx) => (
              <div key={qIdx} className="bg-white rounded-xl shadow-md p-6">
                <h3 className="font-semibold text-lg mb-4">
                  Question {qIdx + 1}: {q.question}
                </h3>
                <div className="space-y-3">
                  {q.options.map((option, oIdx) => (
                    <label
                      key={oIdx}
                      className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
                        answers[qIdx] === oIdx
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`q${qIdx}`}
                        checked={answers[qIdx] === oIdx}
                        onChange={() => handleAnswerSelect(qIdx, oIdx)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="ml-3 text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex justify-between items-center">
              <p className="text-gray-600">
                {Object.keys(answers).length} of {activeQuiz.totalQuestions} answered
              </p>
              <button
                onClick={handleSubmit}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Submit Quiz
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Results View
  if (result && submitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="text-2xl font-bold text-gray-900">Quiz Results</h1>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-md p-8 mb-8 text-center">
            <div className="text-6xl font-bold text-blue-600 mb-2">{result.percentage}%</div>
            <p className="text-xl text-gray-700">
              You scored {result.score} out of {result.totalQuestions}
            </p>
            <button
              onClick={() => {
                setActiveQuiz(null);
                setResult(null);
                setSubmitted(false);
              }}
              className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Back to Quizzes
            </button>
          </div>

          <div className="space-y-4">
            {activeQuiz.questions.map((q, qIdx) => {
              const isCorrect = answers[qIdx] === q.correctAnswer;
              return (
                <div
                  key={qIdx}
                  className={`bg-white rounded-xl shadow-md p-6 border-l-4 ${
                    isCorrect ? 'border-green-500' : 'border-red-500'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-lg">
                      Question {qIdx + 1}: {q.question}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-2">
                    Your answer: <strong>{q.options[answers[qIdx]] || 'Not answered'}</strong>
                  </p>
                  {!isCorrect && (
                    <p className="text-green-700 mb-2">
                      Correct answer: <strong>{q.options[q.correctAnswer]}</strong>
                    </p>
                  )}
                  {q.explanation && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">
                        <strong>Explanation:</strong> {q.explanation}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </main>
      </div>
    );
  }

  // Quiz List View
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Quizzes</h1>
          <a href="/dashboard" className="text-blue-600 hover:text-blue-700 font-medium">
            ← Back to Dashboard
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Generate Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Generate New Quiz</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={selectedDoc}
              onChange={(e) => setSelectedDoc(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a document...</option>
              {documents.map((doc) => (
                <option key={doc._id} value={doc._id}>{doc.title}</option>
              ))}
            </select>
            <select
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value={5}>5 Questions</option>
              <option value={10}>10 Questions</option>
              <option value={15}>15 Questions</option>
            </select>
            <button
              onClick={handleGenerate}
              disabled={!selectedDoc || generating}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {generating ? 'Generating...' : 'Generate Quiz'}
            </button>
          </div>
        </div>

        {/* Quiz History */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quiz History</h2>
          {quizzes.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No quizzes taken yet</p>
          ) : (
            <div className="space-y-3">
              {quizzes.map((quiz) => (
                <div
                  key={quiz._id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  <div>
                    <h3 className="font-semibold text-gray-900">{quiz.title}</h3>
                    <p className="text-sm text-gray-500">
                      {quiz.documentId?.title || 'Unknown Document'}
                    </p>
                  </div>
                  <div className="text-right">
                    {quiz.completedAt ? (
                      <>
                        <p className="font-bold text-gray-900">
                          {quiz.score}/{quiz.totalQuestions}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(quiz.completedAt).toLocaleDateString()}
                        </p>
                      </>
                    ) : (
                      <button
                        onClick={() => setActiveQuiz(quiz)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                      >
                        Take Quiz
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Quizzes;
