const express = require('express');
const File = require('../models/File');
const fs = require('fs-extra');
const path = require('path');

const router = express.Router();

// Simple text summarization
router.post('/summarize/:fileId', async (req, res) => {
  try {
    const file = await File.findById(req.params.fileId);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    // Check if it's a text file
    const textExtensions = ['.txt', '.md', '.js', '.jsx', '.ts', '.tsx', '.json', '.css', '.html', '.xml', '.csv'];
    const isTextFile = textExtensions.includes(file.extension);
    
    if (!isTextFile) {
      return res.status(400).json({ error: 'Summarization only available for text files' });
    }
    
    // Read file content
    const content = await fs.readFile(file.path, 'utf8');
    
    // Generate summary
    let summary = '';
    let wordCount = content.split(/\s+/).length;
    let charCount = content.length;
    
    if (content.length > 1000) {
      // Get first 500 chars and last 500 chars
      const firstPart = content.substring(0, 500);
      const lastPart = content.substring(content.length - 500);
      summary = firstPart + '\n\n... [Content Middle] ...\n\n' + lastPart;
    } else {
      summary = content;
    }
    
    // Extract title or first line
    const lines = content.split('\n');
    const title = lines[0].substring(0, 100);
    
    res.json({
      fileName: file.originalName,
      summary: summary,
      title: title,
      wordCount: wordCount,
      charCount: charCount,
      lineCount: lines.length,
      fileSize: file.size
    });
    
  } catch (error) {
    console.error('Summarization error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get file preview for summarization
router.get('/preview/:fileId', async (req, res) => {
  try {
    const file = await File.findById(req.params.fileId);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    const content = await fs.readFile(file.path, 'utf8');
    const preview = content.substring(0, 1000);
    
    res.json({
      fileName: file.originalName,
      preview: preview,
      fullLength: content.length
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;