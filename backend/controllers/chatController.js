import { chatWithAI, explainConcept } from './aiController.js';
import Document from '../models/Document.js';

// Chat with AI about a document
export const chat = async (req, res) => {
  try {
    const { message, documentId } = req.body;

    if (!message || !documentId) {
      return res.status(400).json({ message: 'Message and documentId are required' });
    }

    // Get the document
    const document = await Document.findOne({ 
      _id: documentId,
      userId: req.user._id 
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Get AI response
    const response = await chatWithAI(message, document.content, document.title);

    res.json({ 
      message: response,
      documentTitle: document.title
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Explain a concept from document
export const explain = async (req, res) => {
  try {
    const { concept, documentId } = req.body;

    if (!concept) {
      return res.status(400).json({ message: 'Concept is required' });
    }

    let context = '';
    
    // If documentId provided, get context from document
    if (documentId) {
      const document = await Document.findOne({ 
        _id: documentId,
        userId: req.user._id 
      });

      if (document) {
        context = document.content;
      }
    }

    // Get AI explanation
    const explanation = await explainConcept(concept, context);

    res.json({ explanation });
  } catch (error) {
    console.error('Explain concept error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
