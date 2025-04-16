import express  from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);

const io = new Server(server, { cors: { origin: "*" } });

const users: Record<string, { username: string, locality: string | null }> = {};

const occupiedLocalities = new Set<string>();

io.on("connection", socket => {
    console.log(`🔌 Nuevo usuario conectado: ${socket.id}`);
    
});

const port = 4000;

app.listen(port, () => console.log(`Servidor funcionando en el puerto ${port}`));