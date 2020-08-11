var router=require('express').Router();
var path= require('path');
var bcy=require('bcrypt');
const saltRounds = 10;
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
    
    bcy.hash(req.body.pass, 10, function(err, hash) {
        const somem=new usersch()
        somem.realname=req.body.realname,
        somem.name=req.body.name;
        somem.email=req.body.email;
        somem.pass=hash;
        somem.save((err,doc)=>{
        if(!err){
            res.redirect('/user/login');
        }
        else{
            res.send("user exists");
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

router.route('/signin').post((req,res)=>{
    usersch.findOne({email:req.body.email})
    .then((user)=>{
        if(!user){
            res.send("no")
        }
        else{
            bcy.compare(req.body.pass,user.pass,(err,result)=>{
                if(result==true){
                    req.session.user=user;
                    res.redirect('/user/u');
                }
                if (err) {
                    res.send("unauth")
                    
                } 
                if(result==false){
                    res.send('Wrong credentials<br>Please register-<a href="/user">Register</a>');
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
