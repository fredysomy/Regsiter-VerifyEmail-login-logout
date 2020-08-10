var router=require('express').Router();
var path= require('path');
app.set('views',path.join("views"));
let usersch=require('../models/user.model');

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
        else {res.render('dashboard',{
            title:req.body.name,
            email:req.body.email,
            pass:req.body.pass
        });}
            });

});

module.exports=router;
