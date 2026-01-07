import { Request, Response } from "express";
import { db } from "src/db/mysql.js";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt'

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_123';

export const register = async (req: Request, res: Response) => {
    const { username, password } = req.body
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword])
        res.status(201).json({ message: "Registered!" })
    } catch ( error ) {
        res.status(500).json({ error: "Error or username is busy" })
    }
}

export const login = async (req: Request, res: Response) => {
    const { username, password } = req.body;
    try {
        const [rows]: any = await db.query('SELECT * FROM users WHERE username = ?', [username]);
        const user = rows[0]

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: "Login or password wrong" })
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ token, role: user.role })
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
}