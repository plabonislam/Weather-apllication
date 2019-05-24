var City = require('../models/city');
var mongoose=require('mongoose');

mongoose.connect('mongodb://localhost/shop', {useNewUrlParser: true});




var cities=[
 new City({ name:'dhaka'}),
 new City({ name:'Rangpur'}),
 new City({ name:'Chittagong'}),
 new City({ name:'Barishal'}),
 new City({ name:'Khulna'}),
 new City({ name:'Rajshahi'})
];

 var da=0;
        for(var i=0;i<cities.length;i++)
        {
            da++;
            cities[i].save(function(err,res){
            if(da===cities.length)
            {
                mongoose.disconnect();
            }
        });
        }