var express = require('express');
var router = express.Router();
var passport=require('passport');

var Product=require('../models/product');
var User = require("../models/user");

var async = require("async");
var nodemailer = require("nodemailer");
var crypto = require("crypto");

var multer=require('multer');
const path=require('path');


//all routes uses this csurf protection
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('weather/index');
  
});

router.get('/reset/:token', function(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      req.flash('message', 'Password reset token is invalid or has expired.');
      return res.redirect('/user/forgot');
    }
    res.render('user/reset', {token: req.params.token});
  });
});


router.post('/reset/:token', function(req, res) {
  async.waterfall([
    function(done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          req.flash('message', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }
        if(req.body.password === req.body.confirm) {
            user.password=user.encryptPassword(req.body.confirm);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            user.save(function(err) {
              req.logIn(user, function(err) {
                done(err, user);
              });
            });
          
        } else {
            req.flash("message", "Passwords do not match.");
            return res.redirect('back');
        }
      });
    },
    function(user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: 'shahnurislamplabon@gmail.com',
          pass: process.env.GMAILPW
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'shahnurislamplabon@gmail.com',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('message', 'Success! Your password has been changed.');
        done(err);
      });
    }
  ], function(err) {
    res.redirect('/');
  });
});




router.get('/imageup',function(req,res){
   var succ=req.flash('message')[0];
  res.render('upimage/impath',{success:succ,nosuccess:!succ});

});


router.post('/upload',function(req,res){

        


//set up storage 
var storage = multer.diskStorage({
  destination: './public/images',
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

//calliing storage method and limit file and its type
var upload = multer({ 
  storage: storage,
  limits:{ fileSize:1000000},//check size
  fileFilter:function(req,file,cb){
    check(file,cb);
  }
}).single('avatar');


//checking exten
function check(file,cb)
{
  //allow ext
  const filetypes=/jpeg|jpg|png|gif/;
  //check est 
  const extname=filetypes.test(path.extname(file.originalname).toLowerCase());
  //check mime
  const mimetype=filetypes.test(file.mimetype);
  if(extname && mimetype)
  {
    return cb(null,true);
  }
  else
  {
    return cb('err','typ not matched');
  }
}

 //checks 
 upload(req, res, function (err) {
 if(err)
 {
  req.flash('message', err);
  res.redirect('/imageup');
 }
 else{
  console.log(req.file.filename);

  var item={
    imagePath:req.file.filename,
    title:req.body.title,
    description:req.body.description,
    price: req.body.price

  }
  var product = new Product(item);
  product.save();
  res.redirect('/');
}
 
});


});

 module.exports = router;

