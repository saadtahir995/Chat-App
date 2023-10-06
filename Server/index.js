const io= require('socket.io')(3000,{
    cors:{
    origin:['http://localhost:5173'],
    },
})
let rooms=[
    {name:'',code:''}
]
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
socket.on('room_create',(roomcode,roomname,name)=>{
    socket.leave(0);
    socket.join(roomcode);
    rooms.push({name:roomname,code:roomcode})
    io.to(roomcode).emit('response',name?name+' joins room':socket.id +' joins room','Alert',socket.id)
    

})
socket.on('room_join',(roomcode,name)=>{
    const room= rooms.filter((room)=>room.code===roomcode)
    if(room.length===0){return socket.emit('err_room','Room Not found')}
    else{
    socket.leave(0);
    socket.join(roomcode)
    io.to(roomcode).emit('join_response',name?name+' joins room':socket.id +' joins room','Alert',room[0].name)
    }
    
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


