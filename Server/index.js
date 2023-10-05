const io= require('socket.io')(3000,{
    cors:{
    origin:['http://localhost:5173'],
    },
})
io.on('connection', (socket)=>{
    let id=socket.id;
    socket.join(0);
console.log(`client connected with socketid: ${socket.id}`)
io.to(0).emit('response',socket.id+' joined the chat','Alert');

socket.on('sending',(msg,name,room)=>{
    id=name?name:socket.id
    if(!room){io.to(0).emit('response',msg,name?name:socket.id,socket.id)
}
    io.to(room).emit('response',msg,name?name:socket.id,socket.id)
    
})
socket.on('room_join',(room,name)=>{
    socket.leave(0);
    socket.join(room)
    io.to(room).emit('response',name?name+' joins room':socket.id +' joins room','Alert')
    
})
socket.on('room_leave',(room,name)=>{
    io.to(room).emit('response',name?name+' Leaves room':socket.id +' Leaves room','Alert')
    socket.leave(room)
    socket.join(0)

})
socket.on('disconnect',()=>{
    io.emit('response',id+' is disconnected','Alert')
})
})


