var router=require('express').Router();
var path= require('path');
var bcy=require('bcrypt');
var nm=require('nodemailer');
var randtoken=require('rand-token')
require('dotenv').config()
var bodyParser=require('body-parser');
const express = require('express');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
app=express();
app.set('view engine','ejs');
app.set('views',path.join("views"));//search
let usersch=require('../models/user.model');
let tksc=require('../models/token.model');
let blsc=require('../models/blog.model');
const blogsc = require('../models/blog.model');

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
router.route('/').get((req,res)=>
{
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
       //localhost:8080/name=fredy&pass=*****
       //truthy falsy
        somem.save((err,doc)=>{
        if(!err){
            var tk=new tksc({ _userId: somem._id, token: randtoken.generate(16)});
            tk.save().then(()=>{
            const sgMail = require('@sendgrid/mail');
                sgMail.setApiKey(process.env.SENDGRID_API_KEY);
                url=req.get('host')+"/user/verify/"+tk.token;
                const msg = {
                to: somem.email,
                from: 'fredysomy@gmail.com',
                subject: 'Sending with Twilio SendGrid is Fun',
                text: "hi.."+tk.token ,
                html: `<p style="font-size:30;color:red;" align="center">Verify email of ${somem.name}</p><br><a href="${url}"><button align="center">${url}</button></a>`,
       };
            sgMail.send(msg)});
           res.send("main sent")
              
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
                    {
                        req.session.user=user;
                        res.redirect('/user/u');}
                    else
                    {
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

       blogsc.find({mailuser:req.session.user.email}).then((user)=>{console.log(user.length)});
            
        
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

router.route('/add').get((req,res)=>{
    if(req.session.user) {
    res.render('add')}
    else{
        res.redirect('/user/login');
    }
});
router.route('/add/blg').post((req,res)=>{
    const blgs=new blogsc()
    blgs.mailuser=req.session.user.email;
    blgs.head=req.body.head;
    blgs.blog=req.body.desc;
    blgs.save((err)=>{
        if(err){
            console.log("error while saving")
        }
        else{
            console.log("succes")
            res.redirect('/user/u');
        }
    });
    
    
});
router.route('/blog/:id').get((req,res)=>{
    if(req.session.user) {
        blogsc.findOne({_id:req.params.id,mailuser:req.session.user.email}).then(data => {
            res.render('editupdate',{hea:data.head,des:data.blog,id:data._id})
        });
    }
        else{
            res.redirect('/user/login');
        }
});
router.route('/edit/blg').post((req,res)=>{
    
    blogsc.updateOne({_id:req.body.id,mailuser:req.session.user.email},{"$set":{"head":req.body.head,"blog":req.body.desc}}).then(res.redirect('/user/u'))

});

router.route('/u/credupdate').get((req,res)=>{
    if(req.session.user) {
        usersch.findOne({mail:req.session.user.email}).then(data => {
            res.render('credupdate')
        });
    }
        else{
            res.redirect('/user/login');
        }
});

router.route('/update/cred').post((req,res)=>{
    if(req.body.pass==req.body.pass2){
        bcy.hash(req.body.pass2,10,(err,doc)=>{
       usersch.updateOne({email:req.session.user.email},{"$set":{"pass":doc}}).then(res.redirect('/user/u'))
console.log(doc)
    })}
    else{
        res.render('credupdate')
    }
});
module.exports=router;
