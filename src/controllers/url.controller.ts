import { Request, Response } from 'express';
import { db } from '../db/mysql.js';
import { nanoid } from 'nanoid';
import { UAParser } from 'ua-parser-js';


export const createShortUrl = async (req: Request, res: Response) => {
    const { original_url, description } = req.body;
    const code = nanoid(4);

    try {
        await db.query(
            'INSERT INTO url (code, original_url, description, status) VALUES (?, ?, ?, ?)',
            [code, original_url, description || '', 1]
        );
        res.status(201).json({ code, original_url });
    } catch (error) {
        console.error('Url Creation Error:', error);
        res.status(500).json({ error: 'Server Error' });
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
            
            console.log(`New click! Resurce: ${referrer}, Browser: ${browserName}`);
        }

        return res.redirect(urlData.original_url);
        
    } catch (error) {
        console.error('Redirect error:', error);
        res.status(500).send('Server error');
    }
};


export const getAllUrls = async (_req: Request, res: Response) => {
    try {
        const [rows] = await db.query(`
            SELECT u.*, COUNT(v.id) as total_clicks 
            FROM url u 
            LEFT JOIN visitor v ON u.id = v.url_id 
            GROUP BY u.id 
            ORDER BY u.created_at DESC
        `);
        res.json(rows);
    } catch (error) {
        console.error('Get All Urls Error:', error);
        res.status(500).json({ error: 'Data retrieval error' });
    }
};