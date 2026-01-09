import { Request, Response } from 'express';
import { db } from '../db/mysql.js';

export const getAdminStats = async (req: Request, res: Response) => {
    try {
        const [userRows]: any = await db.query('SELECT COUNT(*) as count FROM users');
        const totalUsers = userRows[0].count;

        const [links]: any = await db.query(`
            SELECT
                u.id, u.code, u.original_url, u.description, u.created_at,
                usr.username as owner,
                (SELECT COUNT(*) FROM visitor WHERE url_id = u.id) as clicks
            FROM url u 
            LEFT JOIN users usr ON u.user_id = usr.id
            ORDER BY u.created_at DESC
        `);

        res.json({
            totalUsers: totalUsers,
            links: links
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
};