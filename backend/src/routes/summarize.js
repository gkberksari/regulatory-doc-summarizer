import { Router } from 'express';
import axios from 'axios';

const router = Router();
const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:5000';

router.post('/', async (req, res, next) => {
  const { doc_id: docId, query, mode = 'query' } = req.body || {};

  if (!docId) {
    return res.status(400).json({ message: 'doc_id gereklidir.' });
  }

  try {
    const endpoint = mode === 'full' ? '/summarize/full' : '/summarize/query';
    const { data } = await axios.post(`${PYTHON_SERVICE_URL}${endpoint}`, { doc_id: docId, query });
    return res.json(data);
  } catch (error) {
    console.error('Summarize route error', error.response?.data || error.message);
    return next(error);
  }
});

export default router;
