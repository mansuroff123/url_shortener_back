import express from 'express'
import { verifyToken, isAdmin } from 'src/middleware/auth.middleware.js';
import { db } from 'src/db/mysql.js';



const router = express.Router();

router.get('/all-stats', verifyToken, isAdmin, async (req, res) => {
    try {
        const [stats]: any = await db.query(`
            SELECT
                u.id, u.code, u.original_url, u.description, u.created_at,
                usr.username as owner,
                (SELECT COUNT(*) FROM visitor WHERE  url_id = u.id) as clicks
            FROM url u 
            LEFT JOIN users usr ON u.user_id = usr.id
            ORDER BY u.created_at DESC
            `);
            res.json(stats);
    } catch (error) {
        res.status(500).json({ error: 'Not get stats' })
    }
});

export default router