//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser=require("cookie-parser");
const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://chavi_new:chavi123456@cluster0.pt5tr.mongodb.net/labDB', {useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("Connected to MongoDB");
});
const app = express();
const _=require("lodash");

const {User} = require('./database/user')
const {checkAuth, generateAccessToken} = require('./Util/checkAuth')
app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static("public"));

const item1= {
  name:"Welcome to your own day planner"
}
const item2= {
  name:"Hit the + button to add a new item"
}
const item3={
  name:"<-- to delete an item"
}
const defaultItems=[item1.name,item2.name,item3.name];
const listSchema=new mongoose.Schema({
  name:String,
  items:[{
    type:String
  }],
  author:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User'
  }
});

const List=new mongoose.model("List",listSchema);
app.use(checkAuth)
const authProtect= (req,res,next)=>{

  if(req.user)
  {
    next()
  }
  else{
    res.render('login',{message:"Please login to continue"})
  }
}

app.get("/",function(req,res){
  res.render("index");
})

app.post("/",function(req,res){
  res.render("index");
})

app.get("/login",function(req,res){
  res.render("login");
})

app.get("/register",function(req,res){
  res.render("register");
})

app.get("/logout",function(req,res){
  res.clearCookie('token');
  res.render("logout")
})

app.get("/dashboard", authProtect,function(req, res) {
  List.findOne({author:req.user.id},function(err,data)
  {
    if(err)
      console.log(err);
    else{
      res.render("dash");
}
});

});




app.post('/register', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  User.findOne({username:req.body.username},function(err,docs){
    if(docs)
      {
        console.log("the username already exists");
        //alert("This username already exists :(,click OK to go home page and try again")
        res.redirect("/");
      }
    else
    {
      User.createUser(username, password)
      .then(user => {
        const newList= new List({
          name:username,
          items:defaultItems,
          author:user._id
        })
        newList.save()
        .catch(err=>{console.log(err);})
        res.render('login',{message: 'user created now login'})
      })
      .catch(err => {
        res.render('signup',{message:err})
      })
    }

  })

})

app.post('/login', (req, res) =>{
  User.findOne({username:req.body.username})
  .then(user => {
    if(!user)
    {
      res.status(401).send("No user found")
    }
    user.comparePassword(req.body.password)
    .then(same=>{
      if(!same)
      {
        console.log("Passwords dont match");
        res.status(401).send("Passwords dont match");
      }
      const userData={
        id: user._id,
        username: user.username
      }

      const accessToken = generateAccessToken(userData)
      res.cookie('token',accessToken)
      res.redirect('/dashboard');
    })
    .catch(err => {
      console.log(err);
    })
  })
  .catch(err=>{
    console.log(err);
  })

})
app.listen(3000, function() {
  console.log("Server started on port 3000");
});
