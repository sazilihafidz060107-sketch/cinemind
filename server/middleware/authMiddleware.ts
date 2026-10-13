import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AllowedRole, ALLOWED_ROLES, db } from '../db';

export const JWT_SECRET = process.env.JWT_SECRET || 'cinemind_secure_jwt_secret_key_2026';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    nim: string;
    role: AllowedRole;
    name: string;
    is_first_login: boolean;
  };
}

/**
 * Middleware untuk verifikasi JWT Dashboard Token
 */
export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({ error: 'Akses ditolak: Token autentikasi tidak ditemukan.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Pastikan bukan temporary token
    if (decoded.purpose === 'first_login_change') {
      return res.status(428).json({ 
        error: 'Token sementara hanya berlaku untuk ubah kata sandi awal.',
        require_password_change: true 
      });
    }

    const user = db.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'Pengguna tidak ditemukan dalam sistem.' });
    }

    req.user = {
      id: user.id,
      nim: user.nim,
      role: user.role,
      name: user.name,
      is_first_login: user.is_first_login,
    };

    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token sesi kedaluwarsa atau tidak valid.' });
  }
}

/**
 * Middleware Role-Based Access Control (RBAC)
 */
export function requireRoles(allowedRoles: AllowedRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Autentikasi diperlukan.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Akses ditolak (403 Forbidden): Role '${req.user.role}' tidak memiliki izin untuk rute ini.` 
      });
    }

    next();
  };
}
