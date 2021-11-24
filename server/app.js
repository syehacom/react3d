const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIO = require("socket.io");

const PORT = 3001;

const app = express();
const server = http.createServer(app);

const io = socketIO(server, {
  cors: true,
  origins: "*",
});

app.use(cors());

io.on("connection", (socket) => {
  socket.on("FromAPI", (data) => {
    io.emit("FromAPI", data);
  });
});

server.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});
