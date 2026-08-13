import Document from '../models/Document.js';
import Flashcard from '../models/Flashcard.js';
import Quiz from '../models/Quiz.js';

// Get Dashboard Statistics
export const getDashboardStats = async (req, res) => {
  try {
    // Count documents
    const totalDocuments = await Document.countDocuments({ userId: req.user._id });

    // Count flashcards
    const totalFlashcards = await Flashcard.countDocuments({ userId: req.user._id });
    const favoriteFlashcards = await Flashcard.countDocuments({ 
      userId: req.user._id, 
      isFavorite: true 
    });

    // Count quizzes
    const totalQuizzes = await Quiz.countDocuments({ userId: req.user._id });
    const completedQuizzes = await Quiz.countDocuments({ 
      userId: req.user._id, 
      completedAt: { $ne: null } 
    });

    // Calculate average quiz score
    const completedQuizData = await Quiz.find({ 
      userId: req.user._id, 
      completedAt: { $ne: null } 
    }).select('score totalQuestions');

    let averageScore = 0;
    if (completedQuizData.length > 0) {
      const totalPercentage = completedQuizData.reduce((acc, quiz) => {
        return acc + ((quiz.score / quiz.totalQuestions) * 100);
      }, 0);
      averageScore = Math.round(totalPercentage / completedQuizData.length);
    }

    // Get recent activity
    const recentDocuments = await Document.find({ userId: req.user._id })
      .sort({ uploadedAt: -1 })
      .limit(5)
      .select('title uploadedAt');

    const recentQuizzes = await Quiz.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('documentId', 'title')
      .select('title score totalQuestions completedAt createdAt');

    res.json({
      stats: {
        totalDocuments,
        totalFlashcards,
        favoriteFlashcards,
        totalQuizzes,
        completedQuizzes,
        averageScore
      },
      recentActivity: {
        documents: recentDocuments,
        quizzes: recentQuizzes
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
