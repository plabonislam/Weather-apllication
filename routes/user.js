
var express = require('express');
var router = express.Router();
var passport=require('passport');
var csrf = require('csurf');//import csurf in csrf variable
var User = require("../models/user");

var async = require("async");
var nodemailer = require("nodemailer");
var crypto = require("crypto");



var csrfProtection=csrf();//csurfProtection variable using csurf pacakage
router.use(csrfProtection);//all routes uses this csurf protection

router.get('/profile',isLoggedin,function (req,res,next) { 
  res.render('user/profile');
 });

 router.get('/forgot', function(req, res) {
  var succ=req.flash('message')[0];
  res.render('user/forgot', { csrftoken : req.csrfToken(), success:succ,nosuccess:!succ});
});




router.post('/forgot', function(req, res, next) {
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({ email: req.body.email }, function(err, user) {
        if (!user) {
          req.flash('message', 'No account with that email address exists.');
          return res.redirect('/user/forgot');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
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
        subject: 'Node.js Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        console.log('mail sent');
        req.flash('message', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
        done(err, 'done');
        
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/user/forgot');
  });
});








router.use('/',notLoggedin, function(res,req,next)
{
next();
});

router.get('/signup',function (req,res,next) {
    var messages=req.flash('error');
    var cond;
    if(messages.length > 0)
      cond=true;
     else
     cond=false;
   res.render('user/signup', { csrftoken : req.csrfToken(),messages:messages,hasErrors: true });
 });
 
 router.post('/signup',passport.authenticate('local.signup',{
   successRedirect :'/user/profile',
   failureRedirect:'/user/signup',
   failureFlash:true
  }));
 
 
  router.get('/signin',function (req,res,next) {
   var messages=req.flash('error');
   var cond;
   if(messages.length > 0)
     cond=true;
    else
    cond=false;
  res.render('user/signin', { csrftoken : req.csrfToken(),messages:messages,hasErrors: true });
 });
 
 router.post('/signin',passport.authenticate('local.signin',{
   successRedirect :'/user/profile',
   failureRedirect:'/user/signin',
   failureFlash:true
  }));
 



 module.exports=router;

 function isLoggedin(req,res,next)
 {
   if(req.isAuthenticated())
   {
     return next();
   }
   res.redirect('/');
 }

 function notLoggedin(req,res,next)
 {
   if(!req.isAuthenticated())
   {
     return next();
   }
   res.redirect('/');
 }