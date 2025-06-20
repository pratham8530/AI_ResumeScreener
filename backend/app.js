require('dotenv').config();
const express = require('express');
const mongoose = require('./config/db');
const cors = require('cors');
const apiRoutes = require('./routes/api');

const app = express();

app.use(cors({
  origin: 'https://ai-resumescrenner.onrender.com',
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.options('*', cors()); // Handle preflight

app.use(express.json());

// Log origin for debugging
app.use((req, res, next) => {
  console.log('Request Origin:', req.headers.origin);
  next();
});

app.use('/api', apiRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error('Global Error:', err.stack);
  res.status(500).json({ detail: `Internal server error: ${err.message}` });
});

app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
