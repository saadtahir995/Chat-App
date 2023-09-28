const io= require('socket.io')(3000,{
    cors:{
    origin:['http://localhost:5173'],
    },
})
io.on('connection', (socket)=>{
    const id=socket.id;
console.log(`client connected with socketid: ${socket.id}`)
socket.broadcast.emit('response','joined the chat',socket.id);

socket.on('sending',(msg)=>{
    socket.broadcast.emit('response',msg,socket.id);
})
socket.on('disconnect',()=>{
    io.emit('leave','Client disconnected',id)
})
})


