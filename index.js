const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const File = require('./models/File');

const app = express();
const PORT = 3000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/fileUploader', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected'))
  .catch(err => console.error(err));

// Middleware
app.use(express.json());

// Setup multer
const upload = multer({
  dest: 'uploads/' // stores file temporarily
});

// Upload file
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;

    const savedFile = await File.create({
      originalName: file.originalname,
      filename: file.filename,
      path: file.path,
      mimetype: file.mimetype,
      size: file.size
    });

    res.status(201).json({ message: 'File uploaded successfully', fileId: savedFile._id });
  } catch (err) {
    res.status(500).json({ error: 'File upload failed', details: err });
  }
});

// Retrieve file
app.get('/file/:id', async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).json({ error: 'File not found' });

    res.download(path.resolve(file.path), file.originalName);
  } catch (err) {
    res.status(500).json({ error: 'Error retrieving file', details: err });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
