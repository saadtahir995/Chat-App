const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
    cors: {
        origin: ['https://chat-chi-ashen-44.vercel.app', 'https://chat-app-ivory-omega.vercel.app'],
        methods: ['GET', 'POST'],
        credentials: true
    },
    maxHttpBufferSize: 1e8,
    pingTimeout: 60000,
    transports: ['polling', 'websocket']
});

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors({
    origin: [
        'https://chat-chi-ashen-44.vercel.app',
        'https://chat-app-ivory-omega.vercel.app'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

const ChatRoute = require('./Routes/chatapi.js')
app.use('/api/route', ChatRoute)

let rooms = [{ name: '', code: '' }]

io.on('connection', (socket) => {
    let id = socket.id;
    socket.join(0);
    console.log(`client connected with socketid: ${socket.id}`)
    io.to(0).emit('response', socket.id + ' joined the chat', 'Alert');

    socket.on('sending', (msg, name, room) => {
        id = name ? name : socket.id
        if (!room) { io.to(0).emit('response', msg, name ? name : socket.id, socket.id) }
        io.to(room).emit('response', msg, name ? name : socket.id, socket.id)
    })

    socket.on('room_create', (roomcode, roomname, name) => {
        socket.leave(0);
        socket.join(roomcode);
        const existingRoomIndex = rooms.findIndex(room => room.code === roomcode);
        if (existingRoomIndex >= 0) {
            rooms[existingRoomIndex] = { name: roomname, code: roomcode };
        } else {
            rooms.push({ name: roomname, code: roomcode });
        }
        io.to(roomcode).emit('response', name ? name + ' joins room' : socket.id + ' joins room', 'Alert', socket.id)
    })

    socket.on('room_join', (roomcode, name) => {
        const room = rooms.find((room) => room.code === roomcode);
        if (!room) {
            return socket.emit('err_room', 'Room Not found');
        }
        socket.leave(0);
        socket.join(roomcode);
        io.to(roomcode).emit('join_response',
            name ? name + ' joins room' : socket.id + ' joins room',
            'Alert',
            room.name
        );
    })

    socket.on('room_leave', (roomcode, name) => {
        io.to(roomcode).emit('response', name ? name + ' Leaves room' : socket.id + ' Leaves room', 'Alert');
        socket.leave(roomcode);
        socket.join(0);
    })

    socket.on('disconnect', () => {
        io.emit('response', id + ' is disconnected', 'Alert')
    })
})

app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production') {
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = server;


