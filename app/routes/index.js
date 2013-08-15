/*
 * GET home page.
 */

"use strict";
var Weekly = require('../lib/weekly').Weekly;

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

exports.task = function(req, res){
  Weekly.find({}, function(err, docs){
    res.render('task', {docs:docs});
  });
};

exports.task_create = function(req, res) {
  res.render('task_create');
};

exports.task_created = function(req, res){
  var task = new Weekly(req.body.task);
  console.log(task);
  // res.send(404, function(){console.log(task);});
  task.save(function(err){
    if(!err) {
      // req.session.flash = new Flash("success", "Task Created.");
      res.redirect('/task');
    } else {
      // alert("写入失败! 原因："+err.message);
      // req.session.flash = new Flash("error",err.message);
      res.send(404, '写入失败');
      res.redirect('/task/create');
    }
  });

}

/*
exports.index = function(req, res){
  res.render('index', { docs: docs});
};*/
