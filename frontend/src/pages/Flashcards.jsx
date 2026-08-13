import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Flashcards = () => {
  const [flashcards, setFlashcards] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [flippedCards, setFlippedCards] = useState({});

  useEffect(() => {
    fetchDocuments();
    fetchAllFlashcards();
  }, []);

  const fetchDocuments = async () => {
    try {
      const { data } = await axios.get('/api/documents');
      setDocuments(data);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    }
  };

  const fetchAllFlashcards = async () => {
    try {
      const { data } = await axios.get('/api/flashcards');
      setFlashcards(data);
    } catch (error) {
      console.error('Failed to fetch flashcards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedDoc) return;

    setGenerating(true);
    try {
      await axios.post('/api/flashcards/generate', { documentId: selectedDoc, count: 10 });
      fetchAllFlashcards();
    } catch (error) {
      alert('Failed to generate flashcards');
    } finally {
      setGenerating(false);
    }
  };

  const toggleFlip = (id) => {
    setFlippedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleFavorite = async (id) => {
    try {
      await axios.put(`/api/flashcards/${id}/favorite`);
      fetchAllFlashcards();
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const deleteFlashcard = async (id) => {
    if (!window.confirm('Delete this flashcard?')) return;
    try {
      await axios.delete(`/api/flashcards/${id}`);
      fetchAllFlashcards();
    } catch (error) {
      console.error('Failed to delete flashcard:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Flashcards</h1>
          <a href="/dashboard" className="text-blue-600 hover:text-blue-700 font-medium">
            ← Back to Dashboard
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Generate Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Generate New Flashcards</h2>
          <div className="flex flex-col md:flex-row gap-4">
            <select
              value={selectedDoc}
              onChange={(e) => setSelectedDoc(e.target.value)}
              className="flex-1 border border-gray-300 w-[250px] px-4 py-3 rounded-lg"
            >
              <option value="">Select a document...</option>
              {documents.map((doc) => (
                <option key={doc._id} value={doc._id}>{doc.title}</option>
              ))}
            </select>
            <button
              onClick={handleGenerate}
              disabled={!selectedDoc || generating}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {generating ? 'Generating...' : 'Generate Flashcards'}
            </button>
          </div>
        </div>

        {/* Flashcards Grid */}
        {flashcards.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-md">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="text-gray-600">No flashcards yet. Generate some from your documents!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {flashcards.map((card, idx) => (
              <div
                key={card._id}
                className={`flip-card ${flippedCards[card._id] ? 'flipped' : ''} h-64 cursor-pointer`}
                onClick={() => toggleFlip(card._id)}
              >
                <div className="flip-card-inner">
                  {/* Front */}
                  <div className="flip-card-front bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-xs bg-white/20 px-2 py-1 rounded">Card {idx + 1}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(card._id);
                          }}
                          className="text-white hover:text-yellow-300"
                        >
                          <svg className="w-6 h-6" fill={card.isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        </button>
                      </div>
                      <h3 className="font-semibold text-lg">{card.question}</h3>
                    </div>
                    <p className="text-sm text-blue-100">Click to reveal answer</p>
                  </div>

                  {/* Back */}
                  <div className="flip-card-back bg-white border-2 border-blue-500 p-6 flex flex-col justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Answer:</h3>
                      <p className="text-gray-700">{card.answer}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(card._id);
                        }}
                        className={`text-sm ${card.isFavorite ? 'text-yellow-500' : 'text-gray-400'} hover:text-yellow-600`}
                      >
                        ★ {card.isFavorite ? 'Favorited' : 'Add to Favorites'}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteFlashcard(card._id);
                        }}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Flashcards;
