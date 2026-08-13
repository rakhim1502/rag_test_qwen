import express from 'express';
import { 
  uploadDocument, 
  getDocuments, 
  getDocument, 
  deleteDocument, 
  summarizeDocument 
} from '../controllers/documentController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.post('/upload', protect, upload.single('pdf'), uploadDocument);
router.get('/', protect, getDocuments);
router.get('/:id', protect, getDocument);
router.delete('/:id', protect, deleteDocument);
router.post('/:id/summarize', protect, summarizeDocument);

export default router;
