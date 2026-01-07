import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const verifyToken = (req: any, res: Response, next: NextFunction) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) return res.status(403).json({ error: "Token not found" });

    jwt.verify(token, process.env.JWT_SECRET || 'secret_key_123', (err: any, decoded: any) => {
        if (err) return res.status(401).json({ error: "Token wrong" });
        req.user = decoded;
        next();
    });
};

export const isAdmin = (req: any, res: Response, next: NextFunction) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: "You are not admin!" });
    }
    next();
};