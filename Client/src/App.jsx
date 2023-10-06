import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import "./style.css";

const socket = io("http://localhost:3000");

export default function App() {
  const [msg, setMsg] = useState("");
  const [msgs, setMsgs] = useState([{}]);
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [err, setErr] = useState("");
  const [isjoined, setIsjoined] = useState(false);
  const [showstatus, setShowstatus] = useState(false);
  const [roomname, setRoomname] = useState("");

  const sendMsg = () => {
    socket.emit("sending", msg, name, room);
    setMsg("");
  };
  useEffect(() => {
    if (
      name.toLowerCase().includes("alert") ||
      name.toLowerCase().includes("admin")
    ) {
      setErr(`Word ${name} is forbidden`);
    } else {
      setErr("");
    }
  }, [name]);

  useEffect(() => {
    socket.on("response", (msg, id, mainid) => {
      id === socket.id && (id = name ? name : "Me");
      setMsgs((prevmsgs) => [
        ...prevmsgs,
        { message: msg, socketId: id, main: mainid },
      ]);
    });
    socket.on("join_response", (msg, id, roomname) => {
      setIsjoined(true);
    setMsgs([{}]);
      setRoomname(roomname);
      setMsgs((prevmsgs) => [
        ...prevmsgs,
        { message: msg, socketId: id, main: id },
      ]);
    });
    socket.on("err_room", (msg) => {
      setIsjoined(false);
      setRoom('')
      setErr(msg);
      setTimeout(() => setErr(""), 3000);
    });
  }, []);
  const Handleroom = () => {
    socket.emit("room_join", room, name);
    
  };
  const HandleLeave = () => {
    setIsjoined(false);
    socket.emit("room_leave", room, name);
    setMsgs([{}]);
    setRoom("");
  };
  const HandleCreate = () => {
    setIsjoined(true);
    socket.emit("room_create", room, roomname, name);
    setMsgs([{}]);
  };
  return (
    <div className="container">
      <h3>Chat App</h3>
      <div className="name">
        <input
          type="text"
          name="nam"
          id="name"
          onChange={(e) => setName(e.target.value)}
          value={name}
          placeholder="Enter your name....."
        />
      </div>
      <div className={err && "err-box"}>{err}</div>
      <div className="name">
        {!showstatus && (
          <>
            <input
              type="text"
              name="room"
              id="room"
              onChange={(e) => setRoom(e.target.value)}
              value={room}
              placeholder="Join a room....."
            />
            <b> OR </b>
          </>
        )}
        {room && (
          <>
            {" "}
            {!showstatus && !isjoined ? (
              <button
                onClick={Handleroom}
                style={{ backgroundColor: "#baffba" }}
              >
                Join
              </button>
            ) : null}
          </>
        )}
        {isjoined && (
          <>
            <button
              onClick={HandleLeave}
              style={{ backgroundColor: "#ff7e7e" }}
            >
              Leave
            </button>
          </>
        )}
        <button onClick={() => setShowstatus(!showstatus)}>
          Create a Room
        </button>
        <br /> <br />
        {showstatus && (
          <>
            <input
              type="text"
              name="name"
              className="name"
              placeholder="Enter Group name"
              value={roomname}
              onChange={(e) => setRoomname(e.target.value)}
            />
            <br />
            <input
              type="text"
              className="name"
              placeholder="Enter code of your Room"
              s
              value={room}
              onChange={(e) => setRoom(e.target.value)}
            />
            {room && roomname ? (
              <button onClick={HandleCreate}>Create</button>
            ) : null}
          </>
        )}
      </div>

      <div className="chat-box">
        {isjoined ? (
          <>
            <h3>{roomname}</h3>
          </>
        ) : (
          <>
            <h3>Public Chat</h3>
          </>
        )}
        {msgs.map((msg, index) => (
          <>
            {msg.socketId && (
              <div
                key={index}
                className="chat-message"
                style={{
                  textAlign:
                    (msg.socketId === name && msg.main === socket.id) ||
                    msg.socketId === "Me"
                      ? "right"
                      : msg.socketId === "Alert"
                      ? "center"
                      : "left",
                }}
              >
                <div
                  className="message-content"
                  style={{
                    backgroundColor:
                      (msg.socketId === name && msg.main === socket.id) ||
                      msg.socketId === "Me"
                        ? "#e9e5e5"
                        : msg.socketId === "Alert"
                        ? "yellow"
                        : "#baffba",
                    borderRadius: "50px",
                    padding: "3.7px",
                    display: "inline-block",
                  }}
                >
                  <span>{msg.socketId}:</span> {msg.message}
                </div>
              </div>
            )}
          </>
        ))}
      </div>
      <div className="input-container">
        <input
          type="text"
          name="msg"
          id="msg"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
        />
        {!err && (
          <>
            <button onClick={sendMsg}>Send</button>
          </>
        )}
      </div>
    </div>
  );
}
