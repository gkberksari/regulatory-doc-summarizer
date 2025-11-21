import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import uploadRouter from './routes/upload.js';
import summarizeRouter from './routes/summarize.js';
import queryRouter from './routes/query.js';
import documentRouter from './routes/document.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*'
  })
);
app.use(helmet());
app.use(express.json({ limit: '5mb' }));
app.use(morgan('dev'));

const uploadsPath = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use('/uploads', express.static(uploadsPath));

app.use('/api/upload', uploadRouter);
app.use('/api/summarize', summarizeRouter);
app.use('/api/query', queryRouter);
app.use('/api/document', documentRouter);

app.get('/api/health', (_, res) =>
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  })
);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || 'Beklenmeyen bir hata oluştu.'
  });
});

app.listen(PORT, () => {
  console.log(`Backend API ${PORT} portunda çalışıyor`);
});
