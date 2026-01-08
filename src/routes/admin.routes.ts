import express from 'express';
import { getAdminStats } from '../controllers/admin.controller.js';
import { authenticate, isAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/all-stats', authenticate, isAdmin, getAdminStats);

export default router;