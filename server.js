var mon=require('mongoose');
var express=require('express');
require('dotenv').config()
var path=require('path');
var bodyParser=require('body-parser');
app=express();

app.use(bodyParser.urlencoded({extended:false}));
app.set('view engine','ejs');
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname,'public')));
app.set('views',path.join(__dirname,"views"));

mon.connect(process.env.ATLAS_URI, {useNewUrlParser: true, useUnifiedTopology: true }).then(err =>{
    console.log("err");
});

mon.connection.once("open", (err)=>{
    console.log("mongodb connected")
});
const feedroute=require('./route/feed.js');
const userroute=require('./route/use.js');

app.get('/',(req,res)=>
{
    if(req.session.user) 
    {
         res.render('main',{dash:'<a href="/user/u">Dashboard</a>'});
    }
    else{
        res.render('main',{dash: ' '});
    }
});
app.use('/user',userroute);
app.use('/feed',feedroute);

app.listen(8081,()=>{
    console.log("server running on http://localhost:8080/")
});
