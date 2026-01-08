import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'secret_key_123';

export const authenticate = (req: any, res: Response, next: NextFunction) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) return res.status(401).json({ error: "Token not found" });

    jwt.verify(token, SECRET, (err: any, decoded: any) => {
        if (err) return res.status(403).json({ error: "Token wrong or expired" });
        req.user = decoded;
        next();
    });
};

export const isAdmin = (req: any, res: Response, next: NextFunction) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ error: "No entry! You are not admin." });
    }
};

