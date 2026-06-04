import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import chatRoutes from './routes/chat.routes.js';
import documentRoutes from './routes/document.routes.js';

const app=express();

app.use(cors());
app.use(express.json());

app.get('/',(req,res)=> {
    res.send('welcome to the server');
});

app.use("/api/auth", authRoutes);
app.use("/api/documents",documentRoutes)
app.use("/api/chat", chatRoutes);

export default app;

