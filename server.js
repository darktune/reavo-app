import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import chatHandler from './api/chat.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/chat', async (req, res) => {
  try {
    await chatHandler(req, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const PORT = 3001;
app.listen(PORT, () => console.log(`API Server running on port ${PORT}`));
