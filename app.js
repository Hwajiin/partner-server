const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");

const port = process.env.PORT || 8080;

const app = express();

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    credentials: true,
    methods: ["GET", "POST"],
  },
});

let rooms = [];

io.on("connection", (socket) => {
  socket.on("request_message", (msg) => {
    // response_message로 접속중인 모든 사용자에게 msg 를 담은 정보를 방출한다.
    io.emit("response_message", msg);
  });

  // 방참여 요청
  socket.on("req_join_room", async (msg) => {
    let roomName = "Room_" + msg;

    if (!rooms.includes(roomName)) {
      rooms.push(roomName);
    }

    socket.join(roomName);

    io.to(roomName).emit("noti_join_room", "방에 입장하였습니다.");
  });

  // 채팅방에 채팅 요청
  // socket.on("req_room_message", async (msg) => {
  //   let userCurrentRoom = getUserCurrentRoom(socket);

  //   io.to(userCurrentRoom).emit("noti_room_message", msg);
  // });

  socket.on("message", ({ name, message, time }) => {
    console.log(message);

    console.log(socket.id);

    io.emit("send_msg", { name, message, time }, socket.id);
  });

  socket.on("disconnect", async () => {
    console.log("user disconnected");
  });
});

// io.on("connection", (socket) => {
//   console.log("New client connected");

//   const {
//     headers: { referer },
//   } = socket.request;

//   console.log(referer);

//   socket.on("message", ({ name, message, time }) => {
//     console.log(message);

//     io.emit("message", { name, message, time }, socket.id);
//   });

//   socket.emit("hello", socket.id);

//   socket.on("disconnect", () => {
//     console.log("Client disconnected");
//   });
// });

httpServer.listen(port, () => {
  console.log("Socket IO server listening on port 8080");
});
