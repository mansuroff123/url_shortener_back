import { Router } from "express"
import { 
    createShortUrl, 
    getLinkStats, 
    getMyUrls, 
    handleRedirect, 
} from "../controllers/url.controller.js"
import { authenticate } from '../middleware/auth.middleware.js'
import { getAdminStats } from "src/controllers/admin.controller.js";
const router = Router()


router.post('/shorten', authenticate, createShortUrl);

router.get('/my-urls', authenticate, getMyUrls);

router.get('/all', getAdminStats);

router.get('/stats/:code', authenticate, getLinkStats)

router.get('/:code', handleRedirect);

export default router