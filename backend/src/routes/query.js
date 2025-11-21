import { Router } from 'express';
import axios from 'axios';

const router = Router();
const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:5000';

router.post('/', async (req, res, next) => {
  if (!req.body?.query) {
    return res.status(400).json({ message: 'query parametresi zorunludur.' });
  }

  try {
    const { data } = await axios.post(`${PYTHON_SERVICE_URL}/query`, req.body);
    return res.json(data);
  } catch (error) {
    console.error('Query route error', error.response?.data || error.message);
    return next(error);
  }
});

export default router;
