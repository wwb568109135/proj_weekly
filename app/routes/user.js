"use strict";
/*
 * GET users listing.
 */

var tof = require('../lib/tof');

exports.list = function(req, res){
  res.send("hello");
};
exports.hi = function(req, res){
  res.send("hi");
};

exports.isLogin = function(req, res){
  // 公司环境，直接取OA用户名
  // var user = req.cookies.user;
  // 在家环境，模拟用户名
  var user = { uid:123, nick:"黄文杰", rtx:"sonichuang" }
  // console.log(user);
  
  if(user && user.uid) {
    res.locals.user = user;
    return true;
  } else {
    res.locals.user = null;
    return false;
  }
};

// 命中白名单用户则返回
exports.isWhiteListUser = function(req, res){
  var isLogin = exports.isLogin(req, res);
  if(isLogin){
    // 设置可通行白名单列表
    var userWhiteList = ["sonichuang", "kaireewu", "karinfeng", "panther", "arvintian", "xylonhuang", "dgguo"],
        // 公司环境，直接取OA用户名
        // u = req.cookies.user;
        // 在家环境，模拟用户名
        u = { uid:123, nick:"黄文杰", rtx:"sonichuang" };
    if(u){
      var enName = u.rtx;
      for(var i=0;i<userWhiteList.length;i++){
        if( enName == userWhiteList[i] ){
          return true;
        }
      }
    }
  }
  return false;
};

exports.tofLogin = function(req, res){
  var url = req.protocol || 'http';
  url += "://";
  url += req.get('host');
  url += req.originalUrl; 
  res.redirect('http://passport.oa.com/modules/passport/signin.ashx?url='+encodeURIComponent(url));
};

exports.auth = function(req, res, next) {
  if('undefined' === typeof process.env.NODE_ENV || 'production' !== process.env.NODE_ENV) {
    var isLogin = exports.isLogin(req, res);
    var ticket = req.query.ticket || '';
    if(!isLogin){
      if(!ticket) {
        exports.tofLogin(req, res);
      } else {
        tof.passport(ticket, function(_user){
          if('undefined' !== typeof _user.uid && _user.uid) {
            res.locals.user = _user;
            res.cookie('user',_user, {maxAge:86400000});
          }
          //var path = req.query['path'] || '/';
          next();
        });
      }
    } else {
      next();
    }
  } else {
    next();
  }
};

module.exports = exports;

