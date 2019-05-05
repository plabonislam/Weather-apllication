var Product=require('../models/product');
var mongoose=require('mongoose');

mongoose.connect('mongodb://localhost/shop', {useNewUrlParser: true});
var products=[new Product(
{
 imagePath:'https://static1.squarespace.com/static/52fc05c9e4b08fc45bd99090/t/5ca392fbe4966bd365870db7/1554223873227/mgot-aftermath-poster.jpg',
 title:'game of thrones',
 description:'song of ice and fire ',
 price:10
}),
new Product(
    {
     imagePath:'https://i.pinimg.com/originals/00/f3/71/00f371b879192e6f0a52c12d1f03b214.jpg',
     title:'game of thrones',
     description:'song of ice and fire ',
     price:10
    }),
    new Product(
        {
         imagePath:'http://hdqwalls.com/wallpapers/dragon-night-king-game-of-thrones-season-8-5s.jpg',
         title:'game of thrones',
         description:'song of ice and fire ',
         price:10
        }),
        new Product(
            {
             imagePath:'https://wallpaperaccess.com/full/529281.jpg',
             title:'game of thrones',
             description:'song of ice and fire ',
             price:10
            })
        ];
      var da=0;
        for(var i=0;i<products.length;i++)
        {
            da++;
            products[i].save(function(err,res){
            if(da===products.length)
            {
                mongoose.disconnect();
            }
        });
        }