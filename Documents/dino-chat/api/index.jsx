const express = require('express');
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const ws = require("ws");
const Message = require("./models/Message");
const fs = require("fs");


dotenv.config();
mongoose.connect(process.env.MONGO_URL).then(() =>{
    console.log("Connected to MongoDB");
}).catch((err) => {
    console.log("Error connecting to MongoDB",err);
});
const jwtSecret = process.env.JWT_SECRET;
const bcryptSalt = bcrypt.genSaltSync(10);

const app = express();
app.use('/uploads', express.static(__dirname + '/uploads'));
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    credentials: true,
    origin: process.env.CLIENT_URL,
}));

//endpoint for testing
app.get("/test", (req, res) => {
  res.json("test ok");
});

function getUserDataFromRequest(req) {
  return new Promise((resolve, reject) => {
    const token = req.cookies?.token;
    if (token){
        jwt.verify(token, jwtSecret, {}, (err, userData) => {
          if (err) throw err;
          resolve(userData);
        });
      }else{
        reject("no token");
      }
  });
}

//endpoint for getting all messages
app.get("/messages/:userId", async (req, res) => {
  const {userId} = req.params;
  const userData = await getUserDataFromRequest(req);
  const ourUserId = userData.userId;
  const messages = await Message.find({
    sender:{$in:[userId, ourUserId]},
    recipient:{$in:[userId, ourUserId]},
  })
  .sort({createdAt:1});
  res.json(messages);
});

//endpoint for getting all users
app.get("/people", async (req, res) => {
const users = await User.find({},{'_id':1, 'username':1});
res.json(users);
});

//endpoint for getting all users
app.get("/profile", (req, res) => {
    const token = req.cookies?.token;
    if (token){
        jwt.verify(token, jwtSecret, {}, (err, userData) => {
          if (err) throw err;
          res.json(userData);
        });

    }else {
        res.status(401).json({message: "no token"});
    }
    
});

//endpoint for logging in
app.post("/login", async (req, res) => {
    const {username, password} = req.body;
    const foundUser = await User.findOne({username});
    if (foundUser) {
        const passOk = bcrypt.compareSync(password, foundUser.password);
        if (passOk) {
            jwt.sign({userId: foundUser._id,username},jwtSecret,{},(err,token) => {
          
            res
              .cookie("token", token, { sameSite: "none", secure: true })
              .json({
                id: foundUser._id,

              });
            });
        }
    }

});

//endpioint for registering a new user
app.post("/register", async (req, res) => {
    const {username, password} = req.body;
    try {
    const hashedPassword = await bcrypt.hashSync(password, bcryptSalt);
    const createdUser = await User.create({
        username:username, 
        password:hashedPassword
    });
    
    jwt.sign(
      { userId: createdUser._id, username},
      jwtSecret,
      {},
      (err, token) => {
        if (err) throw err;
        res
          .cookie("token", token, { sameSite: "none", secure: true })
          .status(201)
          .json({
            id: createdUser._id,
          });
      }
    );
    }catch(err){
        if (err) throw err;
    }
  
});

//endpoint for logging out
app.post("/logout", (req, res) => {
  res.cookie("token", "", { sameSite: "none", secure: true }).json("ok");
});


const server = app.listen(4000);
console.log("Server listening on port 4000");
const wss = new ws.WebSocketServer({ server });
wss.on("connection", (connection,req) => {
  // console.log("New Cilent Connected");


  function notifyOnlinePeople() {
    [...wss.clients].forEach((client) => {
      //websocket as array, get online users
      client.send(
        JSON.stringify({
          online: [...wss.clients].map((c) => ({
            userId: c.userId,
            username: c.username,
          })),
        })
      );
    });
  }

  connection.isLive = true;
  connection.timer = setInterval(() => {
    connection.ping();
    connection.deathTimer = setTimeout(() => {
      connection.isLive = false;
      clearInterval(connection.timer);
      connection.terminate();
      notifyOnlinePeople();
    },1000);
  },5000);

  connection.on("pong", () => {
    clearTimeout(connection.deathTimer);
  });

  //read cookies from headers
  const cookies = req.headers.cookie;
  //check if has many cookies
  if (cookies) {
    //decode cookies from headers
    const tokenCookiesString = cookies
      .split(";")
      .find(str => str.startsWith("token="));
    if (tokenCookiesString) {
        const token = tokenCookiesString.split("=")[1];
        if (token) {
        
            jwt.verify(token, jwtSecret, {}, (err, userData) => {
                if (err) throw err;
                const {userId, username} = userData;
                // console.log(userData);
                connection.userId = userId;
                connection.username = username;
                // console.log("user connected", username);
                
            });
           
        }
    }
  }

//notify all clients that a new user has connected
connection.on("message", async (message) => {
  const messageData = JSON.parse(message.toString());
  const { recipient, text, file } = messageData;
  let filename = null;
  if (file) {
    //split filename into parts by .
   const parts = file.name.split(".");
    const extension = parts[parts.length - 1];
    filename = Date.now() + "." + extension;
    const path = __dirname + "/uploads/" + filename;
    const bufferData = new Buffer.from(file.data.split(',')[1], "base64");
    fs.writeFile(path, bufferData, () => {
      console.log("file saved");
    });
    
  }
    if (recipient && (text || file)) {
      const messageDoc = await Message.create({
        sender: connection.userId,
        recipient,
        text,
        file: file? filename : null,
      });
      console.log("created message");

      [...wss.clients]
        .filter((c) => c.userId === recipient)
        .forEach((c) =>
          c.send(
            JSON.stringify({
              text,
              sender: connection.userId,
              _id: messageDoc._id,
              recipient,
              file: file? filename : null,
            })
          )
        );
    }
  });

  notifyOnlinePeople();
  

});
