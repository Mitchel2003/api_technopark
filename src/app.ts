import cookieParser from "cookie-parser"
import config from "@/utils/config"
import express from "express"
import cors from "cors"

import authRoutes from "./routes/auth/auth.routes";
import verifyRoutes from "./routes/auth/verify.routes";

//config express
const app = express();
app.use(cors({ origin: config.frontendUrl, credentials: true }));
app.use(express.json());
app.use(cookieParser());

//auth routes
app.use('/api/auth', authRoutes);
app.use('/api/auth', verifyRoutes);

export default app;