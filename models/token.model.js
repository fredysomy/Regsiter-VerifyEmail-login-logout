var mon=require('mongoose');

var sc1= mon.Schema;

var tokenschema=new sc1({
    _userId: { type: mon.Schema.Types.ObjectId, required: true, ref: 'User' },
    token: { type: String, required: true },
    createdAt: { type: Date, required: true, default: Date.now, expires: 43200 }
});

var tokensc=mon.model('tokensc',tokenschema);

module.exports=tokensc;