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
  // 取登录用户名
  var user = exports.returnStaffUser(req,res);
  // 公司环境，直接取OA用户名
  // var user = req.cookies.user;
  // 在家环境，模拟用户名
  // var user = { uid:123, nick:"黄文杰", rtx:"sonichuang" }
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
    var userWhiteList = ["sonichuang", "kaireewu", "karinfeng", "panther", "arvintian", "xylonhuang", "dgguo", "vivianxia", "karenwang"],
        // 取登录用户名
        user = exports.returnStaffUser(req,res);

    if(user){
      var enName = user.rtx;
      for(var i=0;i<userWhiteList.length;i++){
        if( enName == userWhiteList[i] ){
          return true;
        }
      }
    }
  }
  return false;
};

// 返回Cookie user name
exports.returnStaffUser = function(req,res){
  // 办公网络环境，直接取OA用户名
  var returnUser = req.cookies.user;
  // 非办公网络环境，取OA用户名
  // var returnUser = { uid:123, nick:"黄文杰", rtx:"sonichuang" }
  
  return returnUser;
}

exports.tofLogin = function(req, res){
  var url = req.protocol || 'http';
  url += "://";
  url += req.get('host');
  // url += "loginsuc"; 
  // url += req.originalUrl; 
  res.redirect('http://passport.oa.com/modules/passport/signin.ashx?url='+encodeURIComponent(url));
};

exports.tofLogout = function(req, res){
  res.locals.user = null;
  res.clearCookie('user');

  var url = req.protocol || 'http';
      url += "://";
      url += req.get('host');
      // url += req.originalUrl;
  console.log(url);
  res.redirect('http://www.oa.com/api/loginout.ashx?ref='+encodeURIComponent(url));
};

exports.auth = function(req, res, next) {
  if('undefined' === typeof process.env.NODE_ENV || 'production' !== process.env.NODE_ENV) {
    var isLogin = exports.isLogin(req, res);
    // var ticket = req.query.ticket || '';
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

exports.dateNow = function(req,res) {
  var date = new Date();
  var days = {},days2 = {};
  for (var i = 0; i < 6; i++)
  {
      days[i] = new Date(date.getYear(),
                         date.getMonth(),
                         date.getDate() - date.getDay() + 1 + i);

      var yy = date.getFullYear();
      var monthSingleDigit = days[i].getMonth() + 1,
          mm = monthSingleDigit < 10 ? '0' + monthSingleDigit : monthSingleDigit;
      var dd = days[i].getDate();

      days2[i] = (yy + '-' + mm + '-' + dd);
  }

  var formatDay = {};
      formatDay.now = days2[date.getDay()-1],
      formatDay.monday = days2[0],
      formatDay.friday = days2[4];
  return formatDay;
};

module.exports = exports;

