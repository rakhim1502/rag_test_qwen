import express from 'express';
import { 
  createFlashcards, 
  getFlashcards, 
  getAllFlashcards,
  toggleFavorite, 
  deleteFlashcard 
} from '../controllers/flashcardController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getAllFlashcards);
router.post('/generate', protect, createFlashcards);
router.get('/document/:documentId', protect, getFlashcards);
router.put('/:id/favorite', protect, toggleFavorite);
router.delete('/:id', protect, deleteFlashcard);

export default router;
