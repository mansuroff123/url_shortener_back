import { Router } from "express"
import { 
    createShortUrl, 
    getMyUrls, 
    handleRedirect, 
    getAllUrls 
} from "../controllers/url.controller.js"
import { authenticate } from '../middleware/auth.middleware.js'

const router = Router()


router.post('/shorten', authenticate, createShortUrl);

router.get('/my-urls', authenticate, getMyUrls);

router.get('/all', getAllUrls);


router.get('/:code', handleRedirect);

export default router