const express = require('express');
const app = express();
const port = process.env.PORT || 4000;

const server =require("http").createServer(app);
const {Server} = require("socket.io");

const io = new Server(server);

app.get('/', (req, res) => {
  res.send("This is my server !");
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

io.on("connection",(socket)=>{
    console.log("User Connected !");
});