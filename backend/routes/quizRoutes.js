import express from 'express';
import { 
  createQuiz, 
  submitQuiz, 
  getQuiz, 
  getAllQuizzes, 
  getQuizzesByDocument,
  deleteQuiz 
} from '../controllers/quizController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getAllQuizzes);
router.post('/generate', protect, createQuiz);
router.get('/document/:documentId', protect, getQuizzesByDocument);
router.get('/:id', protect, getQuiz);
router.post('/:id/submit', protect, submitQuiz);
router.delete('/:id', protect, deleteQuiz);

export default router;
