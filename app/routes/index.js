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
    res.render('task', {docs:docs.sort({_id : -1})});  //结果倒叙排列
    // res.render('task', {docs:docs});
  });
  // var docss = Weekly.find().sort({"_id" : -1});
  // res.render('task', {docs:docss});
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
};

exports.task_detail = function(req, res) {
  var id = req.params.id;
  var error = false;
  var msg = '';
  if(!id) {
    error = "warning";
    msg = '必须指定要显示的任务ID。';
  } else {
      Weekly.findById(id, function(err, docs){
        console.log(docs);
        res.render('task-detail', {docs:docs});
      });
  }
  // req.session.flash = new Flash(error, msg);
};

exports.task_del = function(req, res) {
  var id = req.params.id;
  var error = false;
  var msg = '';
  if(!id) {
    error = "warning";
    msg = '必须指定要删除的任务。';
  } else {
    Weekly.remove({_id:id},function(err){
      if (err) {
        error = "error";
        res.send(404, err.message);
      } else {
        res.redirect('/task');
      }
    });
  }
  // req.session.flash = new Flash(error, msg);
};


/*
exports.index = function(req, res){
  res.render('index', { docs: docs});
};*/
