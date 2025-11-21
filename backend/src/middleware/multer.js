import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';

const uploadDir = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.resolve('uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

const fileFilter = (_, file, cb) => {
  if (file.mimetype !== 'application/pdf') {
    return cb(new Error('Yalnızca PDF dosyaları kabul edilir.'));
  }
  cb(null, true);
};

export default multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter
});
