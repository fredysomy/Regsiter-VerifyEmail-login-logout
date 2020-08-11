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

mon.connect(process.env.ATLAS_URI, {useNewUrlParser: true, useUnifiedTopology: true });

mon.connection.once("open", (err)=>{
    console.log("mongodb connected")
});
const userroute=require('./route/use');
app.get('/',(req,res)=>{
    
    if(req.session.user) {
res.render('dashboard',{title:req.session.user.name,
email:req.session.user.email,pass:req.session.user.pass
});
}
else{res.render('main');
}
});
app.use('/user',userroute);

app.listen(8080,()=>{
    console.log("server running on http://localhost:4242/")
});
