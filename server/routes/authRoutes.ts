import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Endpoint Login: /api/login
router.post('/login', AuthController.login);

// Endpoint Ubah Password: /api/change-password
router.post('/change-password', AuthController.changePassword);

// Endpoint Profile: /api/me
router.get('/me', authenticateToken as any, AuthController.me as any);

// Roster Helper & Seeder Reset (untuk pengujian)
router.get('/roster', AuthController.getRoster);
router.post('/reset-seeder', AuthController.resetSeeder);

export default router;
