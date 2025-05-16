
const express = require("express")
const app = express()
const port = 4000
const cors = require("cors")
require("./connection/connection")
const User_Route = require("./routes/UserRoute")
const Post_Route = require("./routes/PostRoute")
const MessageRoute = require("./routes/MessageRoute")
const cookieParser = require('cookie-parser');
const path = require("path")
const http = require('http');
const { Server } = require('socket.io');


const server = http.createServer(app);
const io = new Server(server, {
    cors: {
      origin: 'http://localhost:5173', // React ka frontend URL
      methods: ['GET', 'POST'],
    },
  });


  

app.use(cookieParser());
app.use(cors({origin: "*"}))
app.use("/public", (req, res, next) => {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin"); 
    next();
}, express.static(path.join(__dirname, "public")));

app.use("/api",User_Route)
app.use("/api",Post_Route)
app.use("/api",MessageRoute)
    




app.listen(port,()=>{
    console.log("Server running on port number " + port)
})

