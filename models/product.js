var mongoose=require('mongoose');
// var schema=mongoose.Schema;
//creating new schema
//passing js object through itwhich describe the schema
var schema=new mongoose.Schema({

imagePath:{type:String},
title:{type:String},
description:{type:String},
price:{type:String}

});

module.exports=mongoose.model('Product',schema);