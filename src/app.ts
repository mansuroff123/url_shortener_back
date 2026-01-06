import express from "express"
import cors from "cors"
import urlRoutes from "./routes/url.routes.js"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))
app.use(express.json())
app.use(cookieParser())

app.use("/", urlRoutes)

export default app
