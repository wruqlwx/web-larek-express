import fs from 'fs';
import path from 'path';
import { uploadDir, uploadTempDir } from '../config';

const ensureDir = (dir: string) => {
  fs.mkdirSync(dir, { recursive: true });
};

export const prepareUploadDirs = () => {
  ensureDir(uploadDir);
  ensureDir(uploadTempDir);
};

const isBaseName = (fileName: string) => path.basename(fileName) === fileName;

export const moveUploadedFile = (fileName?: string | null) => {
  if (!fileName) return;

  const baseName = path.basename(fileName);
  if (!baseName || !isBaseName(baseName)) return;

  const source = path.join(uploadTempDir, baseName);
  if (!fs.existsSync(source)) return;
  if (source === path.join(uploadDir, baseName)) return;

  ensureDir(uploadDir);
  fs.renameSync(source, path.join(uploadDir, baseName));
};

export const deleteImageFile = (fileName?: string | null) => {
  if (!fileName) return;

  const baseName = path.basename(fileName);
  if (!baseName || !isBaseName(baseName)) return;

  const target = path.join(uploadDir, baseName);
  if (fs.existsSync(target)) {
    fs.unlinkSync(target);
  }
};

export const clearUploadTempDir = () => {
  if (!fs.existsSync(uploadTempDir)) return;

  const lifetime = 24 * 60 * 60 * 1000;
  const now = Date.now();

  fs.readdirSync(uploadTempDir).forEach((entry) => {
    const target = path.join(uploadTempDir, entry);
    try {
      const stats = fs.statSync(target);
      if (!stats.isFile() || now - stats.mtimeMs > lifetime) {
        fs.rmSync(target, { recursive: true, force: true });
      }
    } catch (error) {
      console.error(`Не удалось удалить файл из временной директории: ${entry}`, error);
    }
  });
};
