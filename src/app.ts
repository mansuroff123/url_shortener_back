import express from "express"
import cors from "cors"
import urlRoutes from "./routes/url.routes.js"
import cookieParser from "cookie-parser"
import authRoutes from './routes/auth.routes.js'
import adminRoutes from './routes/admin.routes.js'

const app = express()

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))
app.use(express.json())
app.use(cookieParser())

app.use("/", urlRoutes)
app.use("/api/auth", authRoutes)
app.use("/api/admin", adminRoutes)

export default app
