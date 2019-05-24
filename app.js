var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var expressHbs=require('express-handlebars');
var mongoose=require('mongoose');

var nodemailer = require('nodemailer');

var userRoute=require('./routes/user');
var indexRouter = require('./routes/index');
var session=require('express-session');
var MongoStore = require('connect-mongo')(session);
var passport=require('passport');
var LocalStrategy = require('passport-local').Strategy;

 var flash=require('connect-flash');
 var expressValidator=require('express-validator');
 
 var bcrypt = require('bcrypt-nodejs');

var async = require('async');
var crypto = require('crypto');
var request= require('request-promise');
var app = express();





mongoose.connect('mongodb://localhost/weather', {useNewUrlParser: true});
require('./config/passport');
// view engine setup
app.engine('.hbs',expressHbs({ defaultLayout:'layout',extname:'.hbs'}));
app.set('view engine', '.hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(expressValidator());
app.use(cookieParser());
app.use(session({ secret:'max',
saveUninitialized:false,
resave:false,
store: new MongoStore({ mongooseConnection:mongoose.connection }),
cookie:{maxAge:180*60*1000}
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));


app.use(function(req, res, next) {
  res.locals.variable=req.isAuthenticated();
  res.locals.session=req.session;
  next();
});



var citySchema = new mongoose.Schema({
    name : String 
});

var cityModel = mongoose.model('City', citySchema);


/*var barisal = new cityModel({name : 'Barisal'});

barisal.save();*/

app.post('/weather',function(req,res,next){
  var kk=req.body.city;
  var url = `http://api.openweathermap.org/data/2.5/weather?q=${kk}&units=imperial&appid=c86be64eedc45c801cde1f3b0dbf76d7`;
 request(url,function(err,response,body){
var weather_json =  JSON.parse(body);
 
if(weather_json.cod==200)
{
  console.log(weather_json.cod);
var cel= (((weather_json.main.temp-32)*5)/9);
cel= cel.toFixed(2);
console.log(cel);
  var weather ={
    city: req.body.city,
   description:weather_json.weather[0].description,
   icon: weather_json.weather[0].icon,
   tempareture:weather_json.main.temp,
   cel:cel
 }
 
 res.render('weather/show',{ weather:weather,mmm:'ppp'});
 

}

else{
  res.redirect('/');
}
});

 
});


async function getWeather(cities) {
    var weather_data = [];

    for (var city_obj of cities) {
        var city = city_obj.name;
        var url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=271d1234d3f497eed5b1d80a07b3fcd1`;

        var response_body = await request(url);

        var weather_json = JSON.parse(response_body);
        var cel= (((weather_json.main.temp-32)*5)/9);
cel= cel.toFixed(2);

        var weather = {
            city : city,
            
            description : weather_json.weather[0].description,
            icon : weather_json.weather[0].icon,
            tempareture:weather_json.main.temp,
   cel:cel
        };

        weather_data.push(weather);
    }

    return weather_data;
}


app.get('/', function(req, res) {

    cityModel.find({}, function(err, cities) {

        getWeather(cities).then(function(results) {

            var weather_data = {weather_data : results};

            res.render('weather/bdshow', weather_data);

        });

    });      

});


app.use('/logout', function(req,res,next){
  req.logout();
  res.redirect('/');
 });
app.use('/user',userRoute);
app.use('/', indexRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
