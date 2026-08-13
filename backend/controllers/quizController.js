import Quiz from '../models/Quiz.js';
import { generateQuiz } from './aiController.js';

// Generate Quiz for Document
export const createQuiz = async (req, res) => {
  try {
    const { documentId, questionCount = 5 } = req.body;

    // Get the document
    const Document = (await import('../models/Document.js')).default;
    const doc = await Document.findOne({ 
      _id: documentId,
      userId: req.user._id 
    });

    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Generate quiz using AI
    const quizData = await generateQuiz(doc.content, doc.title, questionCount);

    // Save quiz to database
    const quiz = await Quiz.create({
      userId: req.user._id,
      documentId,
      title: quizData.title || `Quiz: ${doc.title}`,
      questions: quizData.questions,
      totalQuestions: quizData.questions.length
    });

    res.status(201).json({
      message: 'Quiz generated successfully',
      quiz
    });
  } catch (error) {
    console.error('Create quiz error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Submit Quiz Answers
export const submitQuiz = async (req, res) => {
  try {
    const { answers } = req.body; // Array of selected option indices
    const quizId = req.params.id;

    const quiz = await Quiz.findOne({
      _id: quizId,
      userId: req.user._id
    });

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Calculate score
    let score = 0;
    quiz.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        score++;
      }
    });

    // Update quiz with results
    quiz.score = score;
    quiz.completedAt = new Date();
    await quiz.save();

    res.json({
      score,
      totalQuestions: quiz.totalQuestions,
      percentage: Math.round((score / quiz.totalQuestions) * 100),
      quiz
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get Quiz by ID
export const getQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate('documentId', 'title');

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    res.json(quiz);
  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get All Quizzes for User
export const getAllQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ userId: req.user._id })
      .populate('documentId', 'title')
      .sort({ createdAt: -1 });

    res.json(quizzes);
  } catch (error) {
    console.error('Get all quizzes error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get Quizzes for Document
export const getQuizzesByDocument = async (req, res) => {
  try {
    const { documentId } = req.params;

    const quizzes = await Quiz.find({ 
      documentId,
      userId: req.user._id 
    }).sort({ createdAt: -1 });

    res.json(quizzes);
  } catch (error) {
    console.error('Get quizzes by document error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete Quiz
export const deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    await quiz.deleteOne();

    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error('Delete quiz error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
