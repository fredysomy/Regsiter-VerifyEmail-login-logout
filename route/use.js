var router=require('express').Router();
var path= require('path');
var bcy=require('bcrypt');
var nm=require('nodemailer');
var randtoken=require('rand-token')
const saltRounds = 10;

require('dotenv').config()
var bodyParser=require('body-parser');
const express = require('express');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
app=express();
app.set('view engine','ejs');
app.set('views',path.join("views"));
let usersch=require('../models/user.model');
let tksc=require('../models/token.model');
const { getMaxListeners } = require('../models/user.model');
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
const store = new MongoDBStore({
    uri: process.env.ATLAS_URI,
    collection: 'sessions'
}); 
app.use(session({
    secret: process.env.SESSION_ID,
    resave: true,
    saveUninitialized: true,
    unset: 'destroy',
    store: store
}));
req.session.cookie.expires=new Date(Date.now()+1000*3600*24;
req.session.cookie.secure=true;
router.route('/').get((req,res)=> {
    res.render('index',{err: ""});
    console.log(req.get('host'))
 });
router.route('/login').get((req,res)=>{
    res.render('login',{err:""});
})
router.route('/register').post((req,res)=> {
    
    bcy.hash(req.body.pass, 10, function(err, hash) {
        const somem=new usersch()
        somem.realname=req.body.realname,
        somem.name=req.body.name;
        somem.email=req.body.email;
        somem.pass=hash;
        
       
        somem.save((err,doc)=>{
        if(!err){
            var tk=new tksc({ _userId: somem._id, token: randtoken.generate(16)});
            tk.save();
            const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
url=req.get('host')+"/user/verify/"+tk.token;
const msg = {
  to: somem.email,
  from: 'fredysomy@gmail.com',
  subject: 'Sending with Twilio SendGrid is Fun',
  text: "hi.."+tk.token ,
  html: `<a href="${url}">${url}</a>`,
       };
            sgMail.send(msg);
            res.send("email has been sent")
              
             }
    else{
        
        res.render('index',{err:'<p style="color:red;">User exists <br> Change username</p>'})
    }
    });
   });
});
router.get('/user/signin',(req,res)=>{
    if(req.session.user){
        res.render('dashboard',{
            title:req.session.user.realname,
            title2:req.session.user.name,
            email:req.session.user.email});
        }
    else{
        res.redirect('/user/login')
    }
});

router.route('/verify/:id').get((req,res)=>{
    tksc.findOne({token:req.params.id},(err,doc)=>{
        usersch.update({_id:doc._userId},{"$set":{"verify":true}})
        .then(res.redirect('/user/login'));
    });
    
});
router.route('/signin').post((req,res)=>{
    usersch.findOne({name:req.body.name,email:req.body.email})
    .then((user)=>{
        if(!user){
            res.render('login',{err:'<h6 style="color:red;"></h6>User does not exist</h6><br><a href="/user/login">Try again</a><br>'});
        }
        else{
            bcy.compare(req.body.pass,user.pass,(err,result)=>{
                if(result==true){
                    if(user.verify==true)
                    {req.session.user=user;
                    res.redirect('/user/u');}
                    else{
                        res.render('login',{err:'<h6 style="color:red;"></h6>User not verified</h6><br><a href="/user/login">Try again</a><br>'});
                    }
                }
                if (err) {
                    res.render('login',{err:'<h6 style="color:red;"></h6>Username or password does not match</h6><br><a href="/user/login">Try again</a><br>'});
                    } 
                if(result==false){
                    res.render('login',{err:'<h6 style="color:red;"></h6>Wrong credentials<br>Please register-</h6><br><a href="/user/login">Try again</a><br>'});
                    }
                });
        }
    })
 
});


router.route('/u').get((req,res)=>{
    if(req.session.user){
       res.render('dashboard',{
            title:req.session.user.realname,
            title2:req.session.user.name,
            email:req.session.user.email
            });
    }
    else{
        res.send("session timeout");
    }
});
router.route('/logout').get((req,res)=>{
    if(req.session.user) {
        delete req.session.user;
        
        res.redirect('/user/login');
    } else {
        res.redirect('/user/login');
    }        
});




module.exports=router;
