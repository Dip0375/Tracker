import express from 'express';
import { createIPLog, getIPLogs, getIPLog, updateIPLog, deleteIPLog, getIPStats, searchIP } from '../controllers/ipController.js';

const router = express.Router();

router.post('/', createIPLog);
router.get('/', getIPLogs);
router.get('/stats', getIPStats);
router.get('/search', searchIP);
router.get('/:id', getIPLog);
router.put('/:id', updateIPLog);
router.delete('/:id', deleteIPLog);

export default router;
