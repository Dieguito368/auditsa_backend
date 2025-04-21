import express  from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

const users: Record<string, { name: string, locality: string | null }> = {};

const occupiedLocalities = new Set<string>();

io.on("connection", socket => {
    const connectedUsernames = Object.values(users).map(user => user.name);

    socket.emit("currentUsers", connectedUsernames);

    socket.on("getCurrentUsers", () => {
        socket.emit("currentUsers", connectedUsernames);
    });

    socket.on("getUsersWithLocality", () => {
        const userList = Object.values(users);
        io.emit("usersWithLocality", userList);
    });
    
    socket.on("join", (name: string) => {
        users[socket.id] = { name, locality: null };
        console.log(`👤 ${name} se ha unido`);

        socket.broadcast.emit("userJoined", name);
        
        io.emit("currentUsers", Object.values(users).map(user => user.name));

        socket.emit("occupiedLocalities", Array.from(occupiedLocalities));

        io.emit("usersWithLocality", Object.values(users));
    });

    socket.on("selectLocality", (locality: string) => {
        console.log(locality);
        
        const user = users[socket.id];

        if(!user) return;

        users[socket.id].locality = locality;
        occupiedLocalities.add(locality);

        console.log(occupiedLocalities);

        io.emit("occupiedLocalities", Array.from(occupiedLocalities));

        io.emit("usersWithLocality", Object.values(users));
    });

    socket.on("releaseLocality", (locality: string) => {
        occupiedLocalities.delete(locality);
    
        if (users[socket.id]) {
            users[socket.id].locality = null;
        }
    
        io.emit("occupiedLocalities", Array.from(occupiedLocalities));

        io.emit("usersWithLocality", Object.values(users));
    });

    socket.on("disconnect", () => {
        const user = users[socket.id];
        
        if(!user) return;
        
        if(user.locality) {
            occupiedLocalities.delete(user.locality);
        }

        io.emit("userLeft", user.name);

        delete users[socket.id];

        console.log(occupiedLocalities);

        io.emit("occupiedLocalities", Array.from(occupiedLocalities));

        io.emit("usersWithLocality", Object.values(users));
    });
});

const port = 4000;

server.listen(port, () => console.log(`Servidor funcionando en el puerto ${port}`));