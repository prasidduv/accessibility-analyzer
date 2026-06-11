require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const analysesRoutes = require('./routes/analyses');

const app = express();
const PORT = process.env.PORT || 5000;

if (!process.env.MONGO_URI) {
  console.error('MONGO_URI is missing from your .env file.');
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is missing from your .env file.');
  process.exit(1);
}

app.use(
  cors({
    origin: true,
    credentials: true
  })
);
app.use(express.json({ limit: '10mb' }));

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Accessibility Analyzer API is running.'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/analyses', analysesRoutes);

const frontendPath = path.join(__dirname, '..');
app.use(express.static(frontendPath));

app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'The requested API route was not found.'
  });
});

app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    success: false,
    message: 'Something went wrong on the server. Please try again.'
  });
});

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.');

    app.listen(PORT, () => {
      console.log(`Accessibility Analyzer API listening on port ${PORT}`);
      console.log(`Open the app at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();
