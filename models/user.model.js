var mon=require('mongoose');

var schema=mon.Schema;

var userschema= new schema({
  realname:{type:String,require:true,trim:true},
  name: {type:String,require:true,unique:true,trim:true},
 email:{type:String,require:true,unique:true,trim:true},
  pass:{type:String,require:true,unique:true,trim:true},
  verify:{type:Boolean,default:false}
});

const usersc=mon.model('usersc',userschema);

module.exports= usersc;
