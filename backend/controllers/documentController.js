import Document from '../models/Document.js';
import Flashcard from '../models/Flashcard.js';
import Quiz from '../models/Quiz.js';
import { extractTextFromPDF, generateSummary } from './aiController.js';

// Upload Document
export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { title } = req.body;
    const docTitle = title || req.file.originalname.replace('.pdf', '');

    // Extract text from PDF
    const content = await extractTextFromPDF(req.file.path);

    // Create document record
    const document = await Document.create({
      userId: req.user._id,
      title: docTitle,
      originalName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      content
    });

    res.status(201).json({
      message: 'Document uploaded successfully',
      document
    });
  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get All Documents for User
export const getDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ userId: req.user._id })
      .sort({ uploadedAt: -1 });
    
    res.json(documents);
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get Single Document
export const getDocument = async (req, res) => {
  try {
    const document = await Document.findOne({ 
      _id: req.params.id,
      userId: req.user._id 
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json(document);
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete Document
export const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findOne({ 
      _id: req.params.id,
      userId: req.user._id 
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Delete associated flashcards and quizzes
    await Flashcard.deleteMany({ documentId: document._id });
    await Quiz.deleteMany({ documentId: document._id });

    // Delete the document
    await document.deleteOne();

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Generate Summary for Document
export const summarizeDocument = async (req, res) => {
  try {
    const document = await Document.findOne({ 
      _id: req.params.id,
      userId: req.user._id 
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    if (document.summary) {
      return res.json({ summary: document.summary });
    }

    // Generate summary using AI
    const summary = await generateSummary(document.content, document.title);
    
    document.summary = summary;
    await document.save();

    res.json({ summary });
  } catch (error) {
    console.error('Summarize document error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
