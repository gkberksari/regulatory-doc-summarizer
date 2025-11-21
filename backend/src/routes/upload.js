import { Router } from 'express';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'node:fs';
import uploadMiddleware from '../middleware/multer.js';

const router = Router();
const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:5000';

router.post('/', uploadMiddleware.single('file'), async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Dosya yüklenmedi.' });
  }

  try {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(req.file.path), req.file.originalname);

    const { data } = await axios.post(`${PYTHON_SERVICE_URL}/process`, formData, {
      headers: formData.getHeaders()
    });

    return res.status(201).json(data);
  } catch (error) {
    console.error('Upload route error', error.response?.data || error.message);
    return next(error);
  }
});

export default router;
