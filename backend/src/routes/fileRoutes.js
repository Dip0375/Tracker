import express from 'express';
import { createMaliciousFile, getMaliciousFiles, getMaliciousFile, updateMaliciousFile, deleteMaliciousFile, getFileStats, searchFileByHash } from '../controllers/fileController.js';

const router = express.Router();

router.post('/', createMaliciousFile);
router.get('/', getMaliciousFiles);
router.get('/stats', getFileStats);
router.get('/search', searchFileByHash);
router.get('/:id', getMaliciousFile);
router.put('/:id', updateMaliciousFile);
router.delete('/:id', deleteMaliciousFile);

export default router;
