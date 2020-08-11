var router=require('express').Router();
var path= require('path');
var bodyParser=require('body-parser');
const express = require('express');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
app=express();
app.set('view engine','ejs');
app.set('views',path.join("views"));
let usersch=require('../models/user.model');
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
router.route('/').get((req,res)=> {
    res.render('index');
 
});

router.route('/login').get((req,res)=>{
    res.render('login');
})

router.route('/register').post((req,res)=> {
    const somem=new usersch()
    somem.name=req.body.name;
    somem.email=req.body.email;
    somem.pass=req.body.pass;
    somem.save((err,doc)=>{
    if(!err){
        res.redirect('/user/login');
    }
    else{
        res.send("user exists");
    }
});

});

router.route('/signin').post((req,res)=>{
    usersch.findOne({name:req.body.name,pass:req.body.pass,email:req.body.email},function(err,docs) {
        if(err){
            res.send("unauth")
        }
        if(!docs){
            res.send('Wrong credentials<br>Please register-<a href="/user">Register</a>')
           
        }
        else {
            req.session.user=docs;
            res.render('dashboard',{
            title:req.body.name,
            email:req.body.email,
            pass:req.body.pass
        });}
        
            });

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
