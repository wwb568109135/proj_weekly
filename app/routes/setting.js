/*
 * GET task page.
 */

"use strict";
var Weekly = require('../lib/weekly').Weekly,
    Project = require('../lib/weekly').Project,
    Staff = require('../lib/weekly').Staff,
    Direction = require('../lib/weekly').Direction,
    TasksHistory = require('../lib/weekly').TasksHistory;
var nodeExcel = require('excel-export');
var xlsx = require('node-xlsx');
var fs = require('fs');
var User = require('../routes/user');


/*
 * Setting Project Manager
 */
exports.setting_project = function(req, res){
  var isWhiteListUser = User.isWhiteListUser(req, res);
  if(!isWhiteListUser){
    // 不是白单名用户，直接跳转回首页；
    res.redirect('/');
  }

  var pageShowNum = 20,  //当前一页显示多少个
      pageCur = parseInt(req.query.page) || 1,
      // 大小写不敏感的正则搜索
      query = (req.query.projectName) ? { $regex: new RegExp("^" + req.query.projectName.toLowerCase(), "i") } : {'$exists': true};
      // console.log(query);
     
  Project.paginate(
    {"name" : query },
    {}, pageCur, pageShowNum, function(error, pageCount, paginatedResults) {
    if (error) {
      console.error(error);
    } else {
      res.locals.path = req.path;
      res.locals.originalUrl = req.originalUrl;
      res.render('setting-project', {docs:paginatedResults, pages:pageCount, pageCur:pageCur});
    }
  });
 
};

/*
 * Setting Project Save
 */
exports.setting_project_created = function(req, res){
  var isWhiteListUser = User.isWhiteListUser(req, res);
  if(!isWhiteListUser){
    // 不是白单名用户，直接跳转回首页；
    res.redirect('/');
  }

  var pj = new Project(req.body.project);
  console.log(pj);
  Project.find({"name":pj.name},function(err,doc){
    if(err){
      console.log(err);
    }else{
      if(doc[0]){ //记录新项目名
        // console.log('记录新项目名');
        res.send(404, "此项目名称已存在，请输入新的项目");
      }else{       //已存在项目名
        // console.log('已存在的项目名');

          pj.save(function(err){
            if(!err) {
              res.redirect('/setting-project');
            } else {
              res.send(404, '写入失败');
              res.redirect('/setting-project');
            }
          });

      }
    }

  });
};

/*
 * Setting Project Del
 */
exports.setting_project_del = function(req, res) {
  var id = req.params.id;
  var error = false;
  var msg = '';
  if(!id) {
    error = "warning";
    msg = '必须指定要删除的任务。';
  } else {
    Project.remove({_id:id},function(err){
      if (err) {
        res.send(404, err.message);
      } else {
        res.redirect('/setting-project');
      }
    });
  }
};

/*
 * Setting Direction Manager
 */
exports.setting_direction = function(req, res){
  var isWhiteListUser = User.isWhiteListUser(req, res);
  if(!isWhiteListUser){
    // 不是白单名用户，直接跳转回首页；
    res.redirect('/');
  }

  var pageShowNum = 20,  //当前一页显示多少个
      pageCur = parseInt(req.query.page) || 1,
      // 大小写不敏感的正则搜索
      query = (req.query.directionName) ? { $regex: new RegExp("^" + req.query.directionName.toLowerCase(), "i") } : {'$exists': true};
      // console.log(query);
     
  Direction.paginate(
    {"name" : query },
    {array:1}, 
    pageCur, pageShowNum, function(error, pageCount, paginatedResults) {
    if (error) {
      console.error(error);
    } else {
      res.locals.path = req.path;
      res.locals.originalUrl = req.originalUrl;
      res.render('setting-direction', {docs:paginatedResults, pages:pageCount, pageCur:pageCur});
    }
  });
 
};

/*
 * Setting Direction Save
 */
exports.setting_direction_created = function(req, res){
  var isWhiteListUser = User.isWhiteListUser(req, res);
  if(!isWhiteListUser){
    // 不是白单名用户，直接跳转回首页；
    res.redirect('/');
  }

  var pj = new Direction(req.body.direction);
  console.log(pj);
  
  pj.save(function(err){
    if(!err) {
      res.redirect('/setting-direction');
    } else {
      res.send(404, '写入失败');
      res.redirect('/setting-direction');
    }
  });
};

/*
 * Setting Direction Del
 */
exports.setting_direction_del = function(req, res) {
  var id = req.params.id;
  var error = false;
  var msg = '';
  if(!id) {
    error = "warning";
    msg = '必须指定要删除的任务。';
  } else {
    Direction.remove({_id:id},function(err){
      if (err) {
        res.send(404, err.message);
      } else {
        res.redirect('/setting-direction');
      }
    });
  }
};

/*
 * Setting Staff Create
 */
exports.setting_staff_create = function(req, res) {
  var isWhiteListUser = User.isWhiteListUser(req, res);
  if(!isWhiteListUser){
    // 不是白单名用户，直接跳转回首页；
    res.redirect('/');
  }

  if ( req.body.staff ){
    var staff = new Staff(req.body.staff);
    // console.log(staff);
    staff.save(function(err){
      if(!err) {
        res.redirect('/setting-staff');
      } else {
        res.send(404, '写入失败');
        res.redirect('/setting-staff/create');
      }
    });
  }else{
    Project.find({}, function (err, docs) {
      if (err) {
        console.error(err);
      } else {
        res.render('setting-staff-create', {pj:docs}); 
      }
    });
  }
};

/*
 * Setting Staff List
 */
exports.setting_staff = function(req, res) {
  var isWhiteListUser = User.isWhiteListUser(req, res);
  if(!isWhiteListUser){
    // 不是白单名用户，直接跳转回首页；
    res.redirect('/');
  }

  var pj_array = new Array(),
      // 大小写不敏感的正则搜索
      query = (req.query.staffName) ? { $regex: new RegExp("^" + req.query.staffName.toLowerCase(), "i") } : {'$exists': true};
  // console.log(query);

  Project.find({},function(err,docs){
    if(err){
      console.error(err);
    }else{
      for(var i=0; i <docs.length;i++){
        pj_array[i] = {id:docs[i]._id, name:docs[i].name}
        pj_array[docs[i]._id] = docs[i].name
      }
    }
    res.locals.pj_array = pj_array;
    /*-----*/
    Staff.find({"name" : query }).sort({create_date: 1}).exec(function(err,docs){
      if (err) {
        console.error(err);
      } else {
        res.render('setting-staff', {docs:docs});
      }
    });
    /*-----*/
  });
};

/*
 * Setting Staff Del
 */
exports.setting_staff_del = function(req, res) {
  var id = req.params.id;
  if(!id) {
    res.send(404, '必须指定id才能操作！');
  } else {
    Staff.remove({_id:id},function(err){
      if (err) {
        res.send(404, err.message);
      } else {
        res.redirect('/setting-staff');
      }
    });
  }
};
