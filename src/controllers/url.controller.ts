import { Request, Response } from 'express';
import { db } from '../db/mysql.js';
import { nanoid } from 'nanoid';
import { UAParser } from 'ua-parser-js';

export const createShortUrl = async (req: Request, res: Response) => {
    const { original_url, description } = req.body;
    const userId = (req as any).user?.id || null; 
    
    try {
        let code = nanoid(4);

        const [existing]: any = await db.query('SELECT id FROM url WHERE code = ?', [code]);

        // Agar generatsiya qilingan kodga teng kod generatsiya qilinsa 5 talik kod generatsiya qilinadi
        if (Array.isArray(existing) && existing.length > 0) {
            code = nanoid(5);
        }

        await db.query(
            'INSERT INTO url (code, original_url, description, user_id, status) VALUES (?, ?, ?, ?, ?)',
            [code, original_url, description || '', userId, 1]
        );

        res.status(201).json({ code, original_url });
    } catch (error) {
        console.error('Url Creation Error:', error);
        res.status(500).json({ error: 'Server Error' });
    }
};

export const getMyUrls = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;

    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        const [rows] = await db.query(`
            SELECT u.*, COUNT(v.id) as total_clicks 
            FROM url u 
            LEFT JOIN visitor v ON u.id = v.url_id 
            WHERE u.user_id = ?
            GROUP BY u.id 
            ORDER BY u.created_at DESC
        `, [userId]);
        
        res.json(rows);
    } catch (error) {
        console.error('Get User Urls Error:', error);
        res.status(500).json({ error: 'Data retrieval error' });
    }
};

export const handleRedirect = async (req: Request, res: Response) => {
    const { code } = req.params;
    const cookieName = `v_${code}`;
    const visitorCookie = req.cookies[cookieName];

    try {
        const [rows]: any = await db.query('SELECT * FROM url WHERE code = ?', [code]);
        if (rows.length === 0) return res.status(404).send('Link not found');

        const urlData = rows[0];
        const referrer = req.headers['referer'] || req.headers['referrer'] || 'Direct';

        if (!visitorCookie) {
            const uuid = nanoid(12);
            const userAgent = req.headers['user-agent'] || 'unknown';
            const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '0.0.0.0';

            const parser = new UAParser(userAgent);
            const browserName = parser.getBrowser().name || 'Unknown Browser';
            const deviceType = parser.getDevice().type || 'desktop';

            await db.query(
                'INSERT INTO visitor (url_id, ip, user_agent, device, browser, uuid, referrer) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [urlData.id, ip, userAgent, deviceType, browserName, uuid, referrer]
            );

            res.cookie(cookieName, uuid, { 
                maxAge: 1000 * 60 * 60 * 24 * 30, 
                httpOnly: true,
                sameSite: 'lax'
            });
        }

        return res.redirect(urlData.original_url);
    } catch (error) {
        console.error('Redirect error:', error);
        res.status(500).send('Server error');
    }
};

export const getLinkStats = async (req: Request, res: Response) => {
    const { code } = req.params;
    const userId = (req as any).user?.id;

    try {
        const [urlRows]: any = await db.query(
            'SELECT id, original_url FROM url WHERE code = ? AND user_id = ?',
            [code, userId]
        );

        if (urlRows.length === 0) {
            return res.status(404).json({ error: "Link not found or link is not your" });
        }

        const urlId = urlRows[0].id;

        const [visitors]: any = await db.query(
            `SELECT ip, referrer, device, browser, created_at 
             FROM visitor 
             WHERE url_id = ? 
             ORDER BY created_at DESC`,
            [urlId]
        );

        res.json({
            original_url: urlRows[0].original_url,
            total_clicks: visitors.length,
            visitors: visitors
        });
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ error: 'Serverda xatolik' });
    }
};