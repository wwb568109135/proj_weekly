/*
 * GET home page.
 */

"use strict";
var Weekly = require('../lib/weekly').Weekly;
/**
 * basic example usage of `mongoose-pagination`
 * querying for `all` {} items in `MyModel`
 * paginating by second page, 10 items per page (10 results, page 2)
 **/
/*
MyModel.paginate({}, 2, 10, function(error, pageCount, paginatedResults) {
  if (error) {
    console.error(error);
  } else {
    console.log('Pages:', pageCount);
    console.log(paginatedResults);
  }
}
*/

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

/*
 * product task list 
 */
exports.task = function(req, res){
  var pageShowNum = 5,  //当前一页显示多少个
      pageCur = parseInt(req.query.page) || 1,
      status = (req.query.status) ? parseInt(req.query.status) : {'$exists': true},
      priority = (req.query.priority) ? parseInt(req.query.priority) : {'$exists': true};
      // console.log(status);
  /*
  for (var param in req.query) {
   console.log(param, req.query[param]);
  }*/

  Weekly.paginate({'status':status, 'priority':priority}, {create_date:-1}, pageCur, pageShowNum, function(error, pageCount, paginatedResults) {
    if (error) {
      console.error(error);
    } else {
      // console.log('Pages:', pageCount);
      // console.log(paginatedResults);
      res.locals.path = req.path;
      res.render('task', {docs:paginatedResults, pages:pageCount, pageCur:pageCur});
    }
  });
  
  /*
  Weekly.find({}).sort({create_date: -1}).exec(function(err,docs){  //结果倒叙排列
    res.render('task', {docs:docs}); 
  });*/
  // var docss = Weekly.find().sort({"_id" : -1});
};

/*
 * webRebuild task list 
 */
exports.task_rb = function(req, res){
  var pageShowNum = 5,  //当前一页显示多少个
      pageCur = parseInt(req.query.page) || 1,
      status = (req.query.status) ? parseInt(req.query.status) : {'$exists': true},
      priority = (req.query.priority) ? parseInt(req.query.priority) : {'$exists': true};

  Weekly.paginate({'status':status, 'priority':priority}, {create_date:-1}, pageCur, pageShowNum, function(error, pageCount, paginatedResults) {
    if (error) {
      console.error(error);
    } else {
      res.locals.path = req.path;
      res.render('task-rb', {docs:paginatedResults, pages:pageCount, pageCur:pageCur});
      res.locals.ttdd = paginatedResults;
    }
  });
};

exports.task_create = function(req, res) {
  res.render('task-create');
};

exports.task_created = function(req, res){
  // console.log(req.body.outputTemp);
  var outputJSON = req.body.outputTemp,
      // eval()解析JSON格式字符串
      outputJSON = eval("("+outputJSON+")");

  console.log(typeof(outputJSON));
  console.log(outputJSON);
  
  // create方法接受 object array, 可存1条或多条记录
  Weekly.create(outputJSON, function (err) {
    if(!err) {
      res.redirect('/task');
    } else {
      res.send(404, '写入失败');
      res.redirect('/task/create');
    }
  });

  /*
  var task = new Weekly(req.body.task);
  console.log(task);
  // res.send(404, function(){console.log(task);});
  
  task.save(function(err){
    if(!err) {
      res.redirect('/task');
    } else {
      // req.session.flash = new Flash("error",err.message);
      res.send(404, '写入失败');
      res.redirect('/task/create');
    }
  });*/
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
        res.render('task-detail', {docs:docs});
      });
  }
};

exports.task_edit = function(req, res) {
  var id = req.params.id;
  var error = false;
  var msg = '';
  if(!id) {
    error = "warning";
    msg = '必须指定要编辑的任务ID。';
  } else {
      Weekly.findById(id, function(err, docs){
        res.render('task-edit', {docs:docs});
      });
  }
};

exports.task_update = function(req, res) {
  var id = req.params.id;
  var task = new Weekly(req.body.task);
  // var task = req.body.task;
  console.log(task);
  Weekly.findByIdAndUpdate(id, 
    { 
      $set: { 
        title : task.title,
        type : task.type,
        priority : task.priority,
        focus : task.focus,
        content : task.content,
        pages : task.pages,
        online_date : task.online_date,
        rb_star_date : task.rb_star_date,
        rb_end_date : task.rb_end_date,
        pp : task.pp,
        pm : task.pm,
        status : task.status,
        progress : task.progress
      }
    }, 
    { upsert : true },
    function (err) {
      if (err){
        res.send(404, err.message);
      }else {
        res.redirect('/task/'+id);
      }
    }
  );

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
        res.send(404, err.message);
      } else {
        res.redirect('/task');
      }
    });
  }
  // req.session.flash = new Flash(error, msg);
};

// 需求列表修改AJAX保存
exports.task_ajaxUpdate = function(req, res) {
  var id = req.query.id,
      fieldName = req.query.fieldName,
      fieldValue = req.query.fieldValue;
  var updateObj = {};
      updateObj[fieldName] = fieldValue;
  console.log(updateObj);
  // var task = req.body.task;
  // console.log(id);console.log(fieldName);console.log(fieldValue);
  
  if( id && fieldName ){  
    console.log('ajax saveing');
    Weekly.findByIdAndUpdate(id, 
      updateObj, 
      {upsert : true},
      function (err) {
        if (err){
          res.send(404, "格式错误，修改失败");
        }else {
          // res.redirect('/task/'+id);
          res.send(200, "修改成功！");
          // console.log("保存成功");
        }
      }
    );
  }
};

// 日历中的需求拖动后修改保存
exports.calendar_ajaxUpdate = function(req, res) {
  // console.log(req.body.start);
  var id = req.query.id,
      start = req.query.start,
      end = req.query.end;
  var updateObj = {};
      updateObj["rb_star_date"] = start;
      updateObj["rb_end_date"] = end;
  console.log(updateObj);

  if( id && start && end ){
    console.log("ajax saveing");
      Weekly.findByIdAndUpdate(id, updateObj, 
      {upsert : true},
      function (err) {
        if (err){
          res.send(404, "格式错误，修改失败");
        }else {
          res.send(200, "修改成功！");
        }
      }
    );
  }

};

// 响应并响出索引结果json数据
exports.task_callJSON = function(req, res){
  var role = req.query.role;
  var date = new Date(),
      d = date.getDate(),
      m = date.getMonth(),
      y = date.getFullYear();

  // console.log(role);
  var date = new Date(), d = date.getDate(),m = date.getMonth(),y = date.getFullYear();
  if (role == "rb"){
    //重构角色 日历表返回 上线时间为本月1号 - 本月30号
    Weekly.find({
       "online_date": {"$gte": new Date(y, m, 1), "$lt": new Date(y, m, 30)}
    }).sort({create_date: -1}).exec(function(err,docs){  //结果倒叙排列
      res.json(docs)
    });
    
  } else if ( role == "pm" ){
    //产品角色 日历表返回 上线时间为本月1号 - 本月30号
    Weekly.find({
       "online_date": {"$gte": new Date(y, m, 1), "$lt": new Date(y, m, 30)}
    }).sort({create_date: -1}).exec(function(err,docs){  //结果倒叙排列
      res.json(docs)
    });
  }

  

}

/*
exports.index = function(req, res){
  res.render('index', { docs: docs});
};*/
