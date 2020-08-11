var mon=require('mongoose');

var schema=mon.Schema;

var userschema= new schema({
  realname:{type:String,require:true},
  name: {type:String,require:true,unique:true},
  email:{type:String,require:true,unique:true},
  pass:{type:String,require:true,unique:true}
});

const usersc=mon.model('usersc',userschema);

module.exports= usersc;