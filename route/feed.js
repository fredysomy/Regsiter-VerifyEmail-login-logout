var rout=require('express').Router();
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
let blogsc = require('../models/blog.model');
rout.route('/:id').get((req,res)=>{
    blogsc.findById(req.params.id).then(data=> res.json(data));
});



module.exports=rout;