const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let users = [];

// Serve static files from the "html" folder
app.use(express.static(path.join(__dirname, "../")));

// Route to serve the main HTML file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../html", "index.html"));
});

// Socket.IO connection handler
io.on("connection", (socket) => {
  console.log("A user connected");
  io.emit("server message", "001 Welcome to the server!");

  // Handle client test event
  socket.on("client test", (msg) => {
    const code = msg.slice(msg.indexOf("I")+1);
    conse
    const user = findUser(code);
    msg.replace(":",": ");
    msg += " | IP address: "+ user.ipClient + " | userName: "+user.userName;
    console.log("Client test message received:", msg);

    // Optionally, broadcast the message to all clients
    io.emit("server response", `Server received: ${msg}`);
  });

  socket.on("client message", (msg) => {
    console.log("Message from client: " + msg);
    let msgName = "server message";
    msgCode = msg.slice(0, 3);
    msg = msg.slice(4);
    switch (msgCode) {
      case "101":
        addUser(msg, socket);
        break;
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// ===========================================================================================
// |                                                                                         |
// |                                                                                         |
// ===========================================================================================

function addUser(msg, socket) {
  let ipClient = msg.slice(msg.indexOf(":") + 1, msg.indexOf("|")).trim();
  let userCode = msg.slice(msg.indexOf(";") + 1).trim();
  let user = {
    ipClient: ipClient,
    userCode: userCode,
  };
  console.log("Registered new user:", user);
  users.push(user);
  io.emit("server message|" + userCode, "002 is your IP:" + user.ipClient);

  socket.on("client message|" + userCode, (msg) => {
    const UserCode = userCode;
    console.log("Message from client " + UserCode + ": " + msg);
    let msgName = "server message|" + UserCode;
    msgCode = msg.slice(0, 3);
    msg = msg.slice(4);
    const target = users.find((u) => u.userCode == UserCode);

    switch (msgCode) {
      case "102":
        let userName = msg.slice(msg.indexOf(":") + 1).trim();

        if (!target) {
          console.log(`User with code ${UserCode} not found`);
          socket.emit(msgName, "201 user not found");
          return;
        }
        target.userName = userName;
        socket.emit(msgName, "003 userName saved:" + userName);
        break;
      case "301":
        let ipClient = msg.slice(msg.indexOf(":") + 1).trim();
        target.ipClient = ipClient;
        io.emit(msgName, "002 is your IP:" + ipClient);
        break;
    }
  });
}

function findUser(userCode) {
  const target = users.find((u) => u.userCode == userCode);
  if (!target)
     {
      console.log("user with "+userCode+"not found ");
      return {
        userCode: "notfound",
        ipClient: "notfound",
        userName: "notfound"
      };
     }

     return target;
}