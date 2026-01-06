import { Router } from "express"
import { createShortUrl, getAllUrls, handleRedirect } from "../controllers/url.controller.js"

const router = Router()

router.post("/shorten", createShortUrl);
router.get('/urls', getAllUrls);
router.get('/:code', handleRedirect)

export default router
