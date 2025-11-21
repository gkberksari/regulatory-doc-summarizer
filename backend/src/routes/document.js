import { Router } from 'express';
import axios from 'axios';

const router = Router();
const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:5000';

router.get('/:docId', async (req, res, next) => {
  try {
    const { data } = await axios.get(`${PYTHON_SERVICE_URL}/document/${req.params.docId}`);
    return res.json(data);
  } catch (error) {
    console.error('Document route error', error.response?.data || error.message);
    return next(error);
  }
});

export default router;

