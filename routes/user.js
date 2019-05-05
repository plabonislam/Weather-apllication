
var express = require('express');
var router = express.Router();
var passport=require('passport');
var csrf = require('csurf');//import csurf in csrf variable


var csrfProtection=csrf();//csurfProtection variable using csurf pacakage
router.use(csrfProtection);//all routes uses this csurf protection

router.get('/profile',isLoggedin,function (req,res,next) { 
  res.render('user/profile');
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
 

 router.get('/logout', isLoggedin, function(res,req,next){
  req.logout();
  res.redirect('/');
 });

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