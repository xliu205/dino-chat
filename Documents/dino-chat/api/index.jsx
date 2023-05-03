const express = require('express');
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const ws = require("ws");



dotenv.config();
mongoose.connect(process.env.MONGO_URL).then(() =>{
    console.log("Connected to MongoDB");
}).catch((err) => {
    console.log("Error connecting to MongoDB",error);
});
const jwtSecret = process.env.JWT_SECRET;
const bcryptSalt = bcrypt.genSaltSync(10);

// console.log(process.env.MONGO_URL);

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    credentials: true,
    origin: process.env.CLIENT_URL,
}));

app.get("/test", (req, res) => {
  res.json("test ok");
});

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
const server = app.listen(4000);
console.log("Server listening on port 4000");

const wss = new ws.WebSocketServer({ server });
wss.on("connection", (connection,req) => {
  // console.log("New Cilent Connected");
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


  [...wss.clients].forEach(client => {
    //websocket as array, get online users
    client.send(JSON.stringify({
        online:[...wss.clients].map(c => ({userId:c.userId, username:c.username})),
       }));
  });







});
