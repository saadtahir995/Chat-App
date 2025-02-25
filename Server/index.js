const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');  // Import HTTP module
const { Server } = require('socket.io');  // Import Socket.io

const app = express();
const server = http.createServer(app);  // Create HTTP server
const io = new Server(server, {
    cors: {
        origin: "*",  // Allow all origins (for debugging only, restrict later)
        methods: ["GET", "POST"],
        credentials: true
    }
});



// Middleware
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
const corsOptions = {
    origin: "https://chat-chi-ashen-44.vercel.app",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
};
app.use(cors(corsOptions));



// Routes
const ChatRoute = require('./Routes/chatapi.js');
app.use('/api/route', ChatRoute);

// Use Railway's assigned port or fallback to 5174 locally
const PORT = process.env.PORT || 5174;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

// WebSockets Handling
let rooms = [{ name: '', code: '' }];

io.on('connection', (socket) => {
    let id = socket.id;
    socket.join(0);
    console.log(`Client connected with socket ID: ${socket.id}`);
    io.to(0).emit('response', `${socket.id} joined the chat`, 'Alert');

    socket.on('sending', (msg, name, room) => {
        id = name ? name : socket.id;
        if (!room) {
            io.to(0).emit('response', msg, name || socket.id, socket.id);
        }
        io.to(room).emit('response', msg, name || socket.id, socket.id);
    });

    socket.on('room_create', (roomcode, roomname, name) => {
        socket.leave(0);
        socket.join(roomcode);
        const existingRoomIndex = rooms.findIndex(room => room.code === roomcode);
        if (existingRoomIndex >= 0) {
            rooms[existingRoomIndex] = { name: roomname, code: roomcode };
        } else {
            rooms.push({ name: roomname, code: roomcode });
        }
        io.to(roomcode).emit('response', `${name || socket.id} joins room`, 'Alert', socket.id);
    });

    socket.on('room_join', (roomcode, name) => {
        const room = rooms.find(room => room.code === roomcode);
        if (!room) {
            return socket.emit('err_room', 'Room Not Found');
        }
        socket.leave(0);
        socket.join(roomcode);
        io.to(roomcode).emit('join_response', `${name || socket.id} joins room`, 'Alert', room.name);
    });

    socket.on('room_leave', (roomcode, name) => {
        io.to(roomcode).emit('response', `${name || socket.id} Leaves room`, 'Alert');
        socket.leave(roomcode);
        socket.join(0);
    });

    socket.on('disconnect', () => {
        io.emit('response', `${id} is disconnected`, 'Alert');
    });
});
