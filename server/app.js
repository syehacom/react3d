const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIO = require("socket.io");

const port = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);

const io = socketIO(server, {
  cors: true,
  origins: [
    "http://localhost:3000",
    "http://localhost:3002",
    "https://react3d-3e947.web.app/",
    "https://react3dadmin.web.app/",
  ],
  methods: ["GET", "POST"],
  credentials: true,
});

app.use(cors());

io.on("connection", (socket) => {
  let interval;
  socket.on("FromAPI", (data) => {
    io.emit("FromAPI", data);
  });
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

server.listen(port, () => {
  console.log(`listening on *:${port}`);
});
