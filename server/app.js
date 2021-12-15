const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIO = require("socket.io");
require("events").EventEmitter.defaultMaxListeners = 0;

const port = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);

const io = socketIO(server, {
  cors: true,
  origins: [
    // "http://localhost:3000",
    // "http://localhost:3002",
    // "https://react3d-3e947.web.app/",
    // "https://react3dadmin.web.app/",
    "*"
  ],
  methods: ["GET", "POST"],
  credentials: true,
});

app.use(cors());

let interval;

io.on("connection", (socket) => {
  if (interval) {
    clearInterval(interval);
  }
  setInterval(
    () =>
      socket.on("FromAPI", (data) => {
        console.log(data)
        io.emit("FromAPI", data);
        socket.on("disconnect", () => {
          console.log("Client disconnected");
          clearInterval(interval);
        });
      }),
    2000
  );
});

server.listen(port, () => {
  console.log(`listening on *:${port}`);
});
