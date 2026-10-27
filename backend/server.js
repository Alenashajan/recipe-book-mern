require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const recipeRoutes = require('./routes/recipeRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: (origin, callback) => {
    const allowed = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
      .split(',').map((item) => item.trim());
    if (!origin || allowed.includes('*') || allowed.includes(origin)) return callback(null, true);
    return callback(new Error('CORS blocked this origin. Check CLIENT_ORIGIN in backend environment variables.'));
  }
}));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'Recipe Book API is running.' }));
app.use('/api/recipes', recipeRoutes);

app.use((req, res) => res.status(404).json({ message: 'API route not found.' }));

app.use((error, req, res, next) => {
  console.error(error);
  if (error.name === 'ValidationError') {
    return res.status(400).json({ message: Object.values(error.errors).map((item) => item.message).join(' ') });
  }
  if (error.name === 'MongoServerSelectionError' || error.name === 'MongooseServerSelectionError') {
    return res.status(503).json({ message: 'Database unavailable. Check your MongoDB Atlas connection and network access.' });
  }
  res.status(500).json({ message: error.message || 'Internal server error.' });
});

async function start() {
  if (!process.env.MONGODB_URI) {
    console.error('Missing MONGODB_URI. Create backend/.env using backend/.env.example.');
    process.exit(1);
  }
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB Atlas.');
    app.listen(PORT, () => console.log(`Recipe Book API running on port ${PORT}`));
  } catch (error) {
    console.error('Could not connect to MongoDB:', error.message);
    process.exit(1);
  }
}
start();
