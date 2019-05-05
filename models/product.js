var mongoose=require('mongoose');
// var schema=mongoose.Schema;
//creating new schema
//passing js object through itwhich describe the schema
var schema=new mongoose.Schema({

imagePath:{type:String,required:true},
title:{type:String,required:true},
description:{type:String,required:true},
price:{type:String,required:true}

});

module.exports=mongoose.model('Product',schema);