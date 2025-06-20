require('dotenv').config();
const express = require('express');
const mongoose = require('./config/db');
const cors = require('cors');
const apiRoutes = require('./routes/api');

const app = express();

app.use(cors({
  origin: 'https://ai-resumescrenner.onrender.com',
  methods: ['GET', 'POST'],
  credentials: true,
}));

app.use(express.json());
app.use('/api', apiRoutes);

// Global error handling middleware
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