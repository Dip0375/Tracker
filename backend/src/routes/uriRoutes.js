import express from 'express';
import { createURILog, getURILogs, getURILog, updateURILog, deleteURILog, getURIStats } from '../controllers/uriController.js';

const router = express.Router();

router.post('/', createURILog);
router.get('/', getURILogs);
router.get('/stats', getURIStats);
router.get('/:id', getURILog);
router.put('/:id', updateURILog);
router.delete('/:id', deleteURILog);

export default router;
