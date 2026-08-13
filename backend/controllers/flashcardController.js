import Flashcard from '../models/Flashcard.js';
import { generateFlashcards } from './aiController.js';

// Generate Flashcards for Document
export const createFlashcards = async (req, res) => {
  try {
    const { documentId, count = 10 } = req.body;

    // Find document
    const document = await Flashcard.findOne({ documentId }).populate('documentId');
    
    // Get the actual document
    const Document = (await import('../models/Document.js')).default;
    const doc = await Document.findOne({ 
      _id: documentId,
      userId: req.user._id 
    });

    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check if flashcards already exist
    const existingFlashcards = await Flashcard.find({ 
      documentId,
      userId: req.user._id 
    });

    if (existingFlashcards.length > 0) {
      return res.json({ 
        message: 'Flashcards already exist for this document',
        flashcards: existingFlashcards 
      });
    }

    // Generate flashcards using AI
    const generatedCards = await generateFlashcards(doc.content, doc.title, count);

    // Save flashcards to database
    const flashcards = await Flashcard.insertMany(
      generatedCards.map(card => ({
        userId: req.user._id,
        documentId,
        question: card.question,
        answer: card.answer
      }))
    );

    res.status(201).json({
      message: 'Flashcards generated successfully',
      flashcards
    });
  } catch (error) {
    console.error('Create flashcards error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get Flashcards for Document
export const getFlashcards = async (req, res) => {
  try {
    const { documentId } = req.params;

    const flashcards = await Flashcard.find({ 
      documentId,
      userId: req.user._id 
    }).sort({ createdAt: -1 });

    res.json(flashcards);
  } catch (error) {
    console.error('Get flashcards error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get All User Flashcards
export const getAllFlashcards = async (req, res) => {
  try {
    const flashcards = await Flashcard.find({ userId: req.user._id })
      .populate('documentId', 'title')
      .sort({ createdAt: -1 });

    res.json(flashcards);
  } catch (error) {
    console.error('Get all flashcards error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Toggle Favorite Status
export const toggleFavorite = async (req, res) => {
  try {
    const flashcard = await Flashcard.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!flashcard) {
      return res.status(404).json({ message: 'Flashcard not found' });
    }

    flashcard.isFavorite = !flashcard.isFavorite;
    await flashcard.save();

    res.json(flashcard);
  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete Flashcard
export const deleteFlashcard = async (req, res) => {
  try {
    const flashcard = await Flashcard.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!flashcard) {
      return res.status(404).json({ message: 'Flashcard not found' });
    }

    await flashcard.deleteOne();

    res.json({ message: 'Flashcard deleted successfully' });
  } catch (error) {
    console.error('Delete flashcard error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
