import { GoogleGenerativeAI } from '@google/generative-ai';
import { PdfReader } from 'pdfreader';
import Document from '../models/Document.js';
import Flashcard from '../models/Flashcard.js';
import Quiz from '../models/Quiz.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Extract text from PDF - Zamonaviy va Node.js 24 ga moslashtirilgan usul
export const extractTextFromPDF = async (filePath) => {
  return new Promise((resolve, reject) => {
    let fullText = "";

    new PdfReader().parseFileItems(filePath, (err, item) => {
      if (err) {
        console.error('PDF o\'qishda xato:', err);
        reject(err);
      } else if (!item) {
        // Hujjat oxiriga yetganda barcha yig'ilgan matnni qaytaramiz
        resolve(fullText);
      } else if (item.text) {
        // Har bir qator matnni qo'shib boramiz
        fullText += item.text + " ";
      }
    });
  });
};

// Generate AI Summary
export const generateSummary = async (content, title) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });

    const prompt = `Provide a concise and comprehensive summary of the following document titled "${title}". 
    Highlight key concepts, main points, and important takeaways. Keep it structured and easy to understand.
    
    Content:
    ${content.substring(0, 15000)}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Summary generation error:', error);
    throw error;
  }
};

// Generate AI Explanation for a concept
export const explainConcept = async (concept, context = '') => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });

    const prompt = `Explain the following concept in detail: "${concept}"
    ${context ? `Use this context from the document: ${context.substring(0, 2000)}` : ''}
    
    Provide a clear, educational explanation with examples if applicable.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Concept explanation error:', error);
    throw error;
  }
};

// Chat with AI about document
export const chatWithAI = async (message, documentContent, documentTitle) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });

    const prompt = `You are an AI learning assistant helping students understand their study documents.
    Document Title: ${documentTitle}
    
    Document Content (excerpt):
    ${documentContent.substring(0, 10000)}
    
    Student Question: ${message}
    
    Provide a helpful, accurate answer based on the document content. If the answer isn't in the document, 
    let the student know and provide general knowledge if helpful.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Chat error:', error);
    throw error;
  }
};

// Generate Flashcards from document
export const generateFlashcards = async (content, title, count = 10) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });

    const prompt = `Generate ${count} flashcards from the following document titled "${title}".
    Each flashcard should have a question and answer format focusing on key concepts.
    
    Return ONLY a JSON array in this exact format:
    [
      {"question": "Question text here", "answer": "Answer text here"},
      {"question": "...", "answer": "..."}
    ]
    
    Document Content:
    ${content.substring(0, 15000)}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Invalid JSON response from AI');
  } catch (error) {
    console.error('Flashcard generation error:', error);
    throw error;
  }
};

// Generate Quiz from document
export const generateQuiz = async (content, title, questionCount = 5) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });

    const prompt = `Generate a multiple-choice quiz with ${questionCount} questions from the following document titled "${title}".
    
    Return ONLY a JSON object in this exact format:
    {
      "title": "Quiz Title",
      "questions": [
        {
          "question": "Question text here",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswer": 0,
          "explanation": "Explanation of why this is correct"
        }
      ]
    }
    
    Document Content:
    ${content.substring(0, 15000)}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Invalid JSON response from AI');
  } catch (error) {
    console.error('Quiz generation error:', error);
    throw error;
  }
};
