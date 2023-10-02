const io= require('socket.io')(3000,{
    cors:{
    origin:['http://localhost:5173'],
    },
})
io.on('connection', (socket)=>{
    let id=socket.id;
console.log(`client connected with socketid: ${socket.id}`)
socket.broadcast.emit('response','joined the chat',socket.id);

socket.on('sending',(msg,name)=>{
    id=name?name:socket.id
    socket.broadcast.emit('response',msg,name?name:socket.id);
})
socket.on('disconnect',()=>{
    io.emit('leave','is disconnected',id)
})
})


