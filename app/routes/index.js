/*
 * GET home page.
 */

"use strict";
var Weekly = require('../lib/weekly').Weekly,
    Project = require('../lib/weekly').Project,
    Staff = require('../lib/weekly').Staff,
    Direction = require('../lib/weekly').Direction,
    TasksHistory = require('../lib/weekly').TasksHistory;

var nodeExcel = require('excel-export');

var User = require('../routes/user');
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

/*
 * index View
 */
exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

/*
 * logout View
 */
exports.logout = function(req, res){
  User.tofLogout(req, res);
};

/*
 * Switch role and goto View
 */
exports.task = function(req, res){
  // 公司环境，直接取OA用户名
  // var staffName = req.cookies.user.rtx;
  // 在家环境，模拟用户名
  var staffName = "sonichuang";

  if(staffName){
    Staff.find({name:staffName}).limit(1).exec(function(err,docs){
      if(err){
        res.send(404, "参数错误");
      }else{
        var goView = "",
            roles = docs[0] ? docs[0].roles : 0,
            group = docs[0] ? docs[0].group : 0;
        switch(roles){
          case 0:                  //未定义角色，转到产品视图
            goView = exports.task_pd(req, res);
            break;
          case 1:                  //产品角色，转到产品视图
            goView = exports.task_pd(req, res);
            break;
          case 2:                  //管理角色，转到管理视图
            goView = exports.task_ld(req, res, group);
            break;
          case 3:                  //重构角色，转到重构视图
            goView = exports.task_rb(req, res);
            break;
        }
        goView;
      }
    });
  }
}


/*
 * product task View 
 */
exports.task_pd = function(req, res){
  var pageShowNum = 5,  //当前一页显示多少个
      pageCur = parseInt(req.query.page) || 1,
      status = (req.query.status) ? parseInt(req.query.status) : {'$exists': true},
      priority = (req.query.priority) ? parseInt(req.query.priority) : {'$exists': true},
      // 公司环境，直接取OA用户名
      // staffName = req.cookies.user.rtx,
      // 在家环境，模拟用户名
      staffName = "sonichuang",
      ppQuery = {$regex: new RegExp(staffName.toLowerCase() + "\\b", "i") };

  // 1.把ProjectName全部取出来
  Project.find({},function(err,docs){
    if(err){console.error(err);
    }else{
      var pj_array = new Array();
      for(var i=0; i <docs.length;i++){
        pj_array[i] = {id:docs[i]._id, name:docs[i].name}
        pj_array[docs[i]._id] = docs[i].name
      }
      res.locals.projectName = pj_array;

        // 2.把符合筛选的需求取出来
        Weekly.paginate({$nor:[{hidden: true}], 'status':status, 'priority':priority, 'author':ppQuery, }, {create_date:-1}, pageCur, pageShowNum, function(error, pageCount, paginatedResults) {
          if (error) {
            console.error(error);
          } else {
            res.locals.roles = 1;
            res.locals.path = req.path;
            res.locals.originalUrl = req.originalUrl;
            res.render('task', {docs:paginatedResults, pages:pageCount, pageCur:pageCur});
          }
        });
    }
  });
};

/*
 * webRebuild task View 
 */
exports.task_rb = function(req, res){
  var pageShowNum = 10,  //当前一页显示多少个
      pageCur = parseInt(req.query.page) || 1,
      status = (req.query.status) ? parseInt(req.query.status) : {'$exists': true},
      priority = (req.query.priority) ? parseInt(req.query.priority) : {'$exists': true},
      // 公司环境，直接取OA用户名
      // staffName = req.cookies.user.rtx,
      // 在家环境，模拟用户名
      staffName = "sonichuang",
      ppQuery = {$regex: new RegExp(staffName.toLowerCase() + "\\b", "i") };

  // 1.把ProjectName全部取出来
  Project.find({},function(err,docs){
    if(err){console.error(err);
    }else{
      var pj_array = new Array();
      for(var i=0; i <docs.length;i++){
        pj_array[i] = {id:docs[i]._id, name:docs[i].name}
        pj_array[docs[i]._id] = docs[i].name
      }
      res.locals.projectName = pj_array;
        
        // 2.把符合筛选的需求取出来
        Weekly.paginate({ $nor:[{hidden: true}], 'status':status, 'priority':priority, 'pp':ppQuery}, {create_date:-1}, pageCur, pageShowNum, function(error, pageCount, paginatedResults) {
        // Weekly.paginate({'status':status, 'priority':priority}, {create_date:-1}, pageCur, pageShowNum, function(error, pageCount, paginatedResults) {
          if (error) {
            console.error(error);
          } else {
            res.locals.roles = 3;
            res.locals.path = req.path;
            res.locals.originalUrl = req.originalUrl;
            res.render('task-rb', {docs:paginatedResults, pages:pageCount, pageCur:pageCur});
            res.locals.ttdd = paginatedResults;
          }
        });
    }
  });

};

/*
 * Leader task View 
 */
exports.task_ld = function(req, res, group){
  if(group){
    console.log("group: "+ group);
  }

  var pageShowNum = 20,  //当前一页显示多少个
      pageCur = parseInt(req.query.page) || 1;
      // status = (req.query.status) ? parseInt(req.query.status) : {'$exists': true},
      // priority = (req.query.priority) ? parseInt(req.query.priority) : {'$exists': true},
      // ppQuery =  (req.query.pp) ? parseInt(req.query.pp) : {'$exists': true};


  // 1.把某个组的人员全部取出来
  Staff.find({"group":group}).exec(function(err,docs){
    if(err){
      console.log(err)
    }else{
      var staff_array = new Array();
      for(var i=0; i <docs.length;i++){
        staff_array[i] = docs[i].name;
      }
      res.locals.staffName = staff_array;

      // 2.把ProjectName全部取出来
      Project.find({},function(err,docs){
        if(err){console.error(err);
        }else{
          var pj_array = new Array();
          for(var i=0; i <docs.length;i++){
            pj_array[i] = {id:docs[i]._id, name:docs[i].name}
            pj_array[docs[i]._id] = docs[i].name
          }
          res.locals.projectName = pj_array;

            // 3.把符合筛选的需求取出来
            Weekly.paginate({ $nor:[{hidden: true}]}, {create_date:-1}, pageCur, pageShowNum, function(error, pageCount, paginatedResults) {
            // Weekly.paginate({'status':status, 'priority':priority}, {create_date:-1}, pageCur, pageShowNum, function(error, pageCount, paginatedResults) {
              if (error) {
                console.error(error);
              } else {
                res.locals.roles = 2;
                res.locals.path = req.path;
                res.locals.originalUrl = req.originalUrl;
                res.locals.group = group;
                res.render('task-rb', {docs:paginatedResults, pages:pageCount, pageCur:pageCur});
              }
            });
        }
      });

    }
  });
};

/*
 * Leader AdvFilter task View 
 */
exports.task_ld_adv = function(req, res){
  var data = req.body;
  var group = data.advGroup;

  var pageShowNum = 20,  //当前一页显示多少个
      pageCur = parseInt(req.query.page) || 1,
      project = (data.advFilterProject) ? parseInt(data.advFilterProject) : {'$exists': true},
      status = (data.advFilterStatus) ? parseInt(data.advFilterStatus) : {'$exists': true},
      priority = (data.advFilterPriority) ? parseInt(data.advFilterPriority) : {'$exists': true},
      // staffName = (data.advFilterStaff) ? data.advFilterStaff : {'$exists': true};
      ppQuery =  (data.advFilterStaff) ? {$regex: new RegExp(data.advFilterStaff.toLowerCase() + "\\b", "i") } : {'$exists': true};


  // 1.把某个组的人员全部取出来
  Staff.find({"group":group}).exec(function(err,docs){
    if(err){
      console.log(err)
    }else{
      var staff_array = new Array();
      for(var i=0; i <docs.length;i++){
        staff_array[i] = docs[i].name;
      }
      res.locals.staffName = staff_array;

        // 2.把ProjectName全部取出来
        Project.find({},function(err,docs){
          if(err){console.error(err);
          }else{
            var pj_array = new Array();
            for(var i=0; i <docs.length;i++){
              pj_array[i] = {id:docs[i]._id, name:docs[i].name}
              pj_array[docs[i]._id] = docs[i].name
            }
            // console.dir("pj_array: "+pj_array)
            res.locals.projectName = pj_array;

              // 3.把符合筛选的需求取出来
              Weekly.paginate({ $nor:[{hidden: true}], 'type':project, 'status':status, 'priority':priority, 'pp':ppQuery}, {create_date:-1}, pageCur, pageShowNum, function(error, pageCount, paginatedResults) {
              // Weekly.paginate({'status':status, 'priority':priority}, {create_date:-1}, pageCur, pageShowNum, function(error, pageCount, paginatedResults) {
                if (error) {
                  console.error(error);
                } else {
                  res.locals.roles = 2;
                  res.locals.path = req.path;
                  res.locals.originalUrl = req.originalUrl;
                  res.locals.group = group;
                  // 把提交的数据传回页面，用于筛选表单中的上次筛选记录呈现
                  res.locals.formData = data;
                  res.render('task-rb', {docs:paginatedResults, pages:pageCount, pageCur:pageCur});
                }
              });
          }
        });

    }
  });
};


/*
 * task create 
 */
exports.task_create = function(req, res) {
  Project.find({}).sort({name: 1}).exec(function(err,docs){  //结果倒叙排列
    if(err){
      console.error(err)
    }else{
      res.render('task-create', {pj:docs}); 
    }
  });
};

/*
 * task created 
 */
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
};

/*
 * task detail 
 */
exports.task_detail = function(req, res) {
  var id = req.params.id;
  var error = false;
  var msg = '';
  if(!id) {
    error = "warning";
    msg = '必须指定要显示的任务ID。';
  } else {
      
    TasksHistory.findOne({task:id},function(err,doc){
      if(err){console.log(err)}else{
        res.locals.taskHistory = doc;
        
        Weekly.findById(id, function(err, docs){
          if(err){console.log(err);}else{
            res.render('task-detail', {docs:docs});
          }
        });
      }
    })

  }
};

/*
 * task edit 
 */
exports.task_edit = function(req, res) {
  var id = req.params.id;
  var error = false;
  var msg = '';
  if(!id) {
    error = "warning";
    msg = '必须指定要编辑的任务ID。';
  } else {

      Project.find({}).sort({name: 1}).exec(function(err,docs){  //结果倒叙排列
        if(err){
          console.error(err)
        }else{
          res.locals.pj = docs; 
          Weekly.findById(id, function(err, docs){
            res.render('task-edit', {docs:docs});
          });
        }
      });
      
  }
};

/*
 * task search 
 */
exports.task_search = function(req, res) {
  var query = req.query.q;
  console.log(query);

  if(/\d{4,}/.test(query)){
    // 按ID精确查找
    console.log("精确查找")
    Weekly.find({_id:query}, function(err, docs){
       res.render('task-search', {docs:docs});
    });
  }else if(!query){
    console.log("必须输入ID或标题");
  }else{
    // 通过title模糊查找
    Weekly.find({
      title : new RegExp(query)
    }).sort({create_date: -1}).exec(function(err,docs){  //结果倒叙排列
       res.render('task-search', {docs:docs})
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

/*
 * 需求列表修改AJAX保存
 */
/*
exports.task_ajaxUpdate = function(req, res) {
  var id = req.query.id,
      fieldName = req.query.fieldName,
      fieldValue = req.query.fieldValue;
  var updateObj = {};
      updateObj[fieldName] = fieldValue;
  
  if( id && fieldName ){  
    console.log('ajax saveing');
    Weekly.findByIdAndUpdate(id, 
      updateObj, 
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
};*/

/*
 * 日历中的需求拖动后修改保存
 */
exports.calendar_ajaxUpdate = function(req, res) {
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
    });
  }

};

/*
 * 响应并响出索引结果json数据
 */
exports.task_callJSON = function(req, res){
  var roles = req.query.roles || "",
      filterStaff = req.query.filterStaff || "";
  // console.log("filterStaff: "+filterStaff)

  // var role = "rb";
  var date = new Date(),
      d = date.getDate(),
      m = date.getMonth(),
      y = date.getFullYear();

  // console.log(role);
  var date = new Date(), d = date.getDate(),m = date.getMonth(),y = date.getFullYear(),
      // 公司环境，直接取OA用户名
      // staffName = req.cookies.user.rtx,
      // 在家环境，模拟用户名
      staffName = "sonichuang",
      ppQuery = {$regex: new RegExp(staffName.toLowerCase() + "\\b", "i") };


  if (roles == "3"){
    console.log("重构日历视图")
    //重构角色 日历表返回 重构开始时间为本月1号 - 本月30号
    Weekly.find({
      $nor:[{hidden: true}], "pp":ppQuery, "rb_star_date": {"$gte": new Date(y, m, 1), "$lte": new Date(y, m, 30)}
    }).sort({create_date: -1}).exec(function(err,docs){  //结果倒叙排列
      res.json(docs)
    });
  } else if (roles == "1"){
    //产品角色 日历表返回 上线时间为本月1号 - 下月30号
    Weekly.find({
      $nor:[{hidden: true}], "author":staffName, "online_date": {"$gte": new Date(y, m, 1), "$lte": new Date(y, m+1, 30)}
    }).sort({create_date: -1}).exec(function(err,docs){  //结果倒叙排列
      res.json(docs)
    });
  } else if(roles == "2" && filterStaff) {
      var ppQuery = {$regex: new RegExp(filterStaff.toLowerCase() + "\\b", "i") };
      console.log( "管理角色，筛选了: "+ filterStaff );
      //管理者筛选某个角色的日历视图，重构开始时间为本月1号 - 本月30号
      Weekly.find({
        $nor:[{hidden: true}], "pp":ppQuery, "rb_star_date": {"$gte": new Date(y, m, 1), "$lte": new Date(y, m, 30)}
      }).sort({create_date: -1}).exec(function(err,docs){  //结果倒叙排列
        res.json(docs)
      });
  }
};


/*
 * export Weekly Data
 */
exports.task_export = function(req, res){
  var taskStarDate = (req.query.taskStarDate) ? req.query.taskStarDate : {'$exists': true},
      taskEndDate = (req.query.taskEndDate) ? req.query.taskEndDate : {'$exists': true},
      // 公司环境，直接取OA用户名
      // staffName = req.cookies.user.rtx,
      // 在家环境，模拟用户名
      staffName = "sonichuang",
      ppQuery = {$regex: new RegExp(staffName.toLowerCase() + "\\b", "i") };

  // console.log(taskStarDate);console.log(taskEndDate);
  Weekly.find({
    $nor:[{hidden: true}], "pp":ppQuery, "rb_star_date": {"$gte": taskStarDate, "$lte": taskEndDate}
  }).sort({create_date: -1}).exec(function(err,docs){  //结果倒叙排列
    res.render('export', {docs:docs})
  })
};


/*
 * export Excel File
 */
exports.excel = function(req, res){
  
  var colsData = req.body.outputCols;
  var rowsData = req.body.outputRows;
  var outputDataRange = req.body.outputDataRange || "unknowDate";

  if(colsData && rowsData){
    // eval()解析JSON格式字符串
    colsData = eval("("+colsData+")");
    rowsData = eval("("+rowsData+")");
    console.log(colsData);console.log(rowsData);

    //设置excel的文件名
    var excelFileName = "username" + "_" + outputDataRange + ".xlsx";
    console.log(excelFileName);

    var conf = {};
    conf.cols = colsData;
    conf.rows = rowsData;
    var result = nodeExcel.execute(conf);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats');
    res.setHeader("Content-Disposition", "attachment; filename=" + excelFileName);
    res.end(result, 'binary');
  }

/*
    var conf ={};
    conf.cols = [
        {caption:'string', type:'string'},
        {caption:'date', type:'date'},
        {caption:'bool', type:'bool'},
        {caption:'number', type:'number'}               
    ];
    conf.rows = [
        ['pi', (new Date(2013, 4, 1)), true, 3.14],
        ["e", (new Date(2012, 4, 1)), false, 2.7182]
    ];
    var result = nodeExcel.execute(conf);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats');
    res.setHeader("Content-Disposition", "attachment; filename=" + "Report.xlsx");
    res.end(result, 'binary');
*/
};

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
  
  pj.save(function(err){
    if(!err) {
      res.redirect('/setting-project');
    } else {
      res.send(404, '写入失败');
      res.redirect('/setting-project');
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
  console.log(query);

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
    Staff.find( {"name" : query }, function (err, docs) {
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
 * tasksHistory Create
 */
exports.tasksHistory_create = function(req, res) {
  var data = req.body;
  console.dir("tasksHistory_create" + data);

  if (data.task){


    TasksHistory.find({"task":data.task}, function (err, docs) {
      if (err) {
        console.log(err);
      } else {


        if(docs.length == 0){    // 没记录，新创建1个记录
          console.error("没记录");
          TasksHistory.create(data, function (err) {
            if (err){
              res.send(404, "格式错误，需求历史记录失败");
            }else {
              res.send(200, "需求历史记录成功");
            }
          })
        }else{                  // 有记录，在原记录上修改
          console.error("有记录");
          TasksHistory.findOne({task:data.task}, function (err, doc) {
            if (err){
              console.log(error);
              res.send(404, "格式错误，需求历史记录失败");
            }else{
              doc.name = 'jason borne';
              doc.modify.push(data.modify[0]);
              doc.save();
              res.send(200, "需求历史记录成功");
            }
          })

          // 把 新增的记录push到docs上并进行保存
          /*var newDataModify = docs[0].modify;
              newDataModify.push(data.modify[0]);
          console.log(newDataModify)    
          TasksHistory.findOneAndUpdate({"task":data.task}, 
            {$set: newDataModify}, 
            {upsert : true},
            function (err) {
              if (err){
                res.send(404, "格式错误，需求历史记录失败");
              }else {
                res.send(200, "需求历史记录成功");
              }
            }
          );*/

        }

      }
    });
  }

};


/*
 * Comm : Ajax Update Set
 */
exports.comm_ajaxUpdateSet = function(req, res) {
  var data = req.body;  
  var id = data.id || null,
      dbCollection = data.dbCollection;
  delete data.id;
  delete data.dbCollection;

  // console.log(id);console.log(dbCollection);console.log(data);

  if(dbCollection == "Project" ){
    dbCollection = Project;
  }else if(dbCollection == "Weekly" ){
    dbCollection = Weekly;
  }else if(dbCollection == "Staff"){
    dbCollection = Staff;
  }else if(dbCollection = "Direction"){
    dbCollection = Direction;
  }
  
  // console.log(id);
  // console.log(data);

  if( id && data ){  
    console.log('ajax saveing');
    // console.dir(data);
    dbCollection.findByIdAndUpdate(id, 
      {$set: data},
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
  }else if( !id && data ){
    console.log('ajax ceate');
    dbCollection.create(data, function (err) {
      if (err){
        res.send(404, "格式错误，修改失败");
      }else {
        res.send(200, "修改成功！");
      }
    })
  }
};


/*
 * Comm : Ajax Get Roles
 */
exports.comm_ajaxGetRoles = function(req, res) {
  var staffName = req.query.staffName,
      rolesText = ["未定义角色", "产品角色", "管理角色", "重构角色"];

  // console.log(staffName);
  if(staffName){
    Staff.find({name:staffName}).limit(1).exec(function(err,docs){
      if(err){
        res.send(404, "查询异常");
      }else{
        // console.log(docs[0]);
        if(docs[0]){
          var roles = rolesText[docs[0].roles];
        }else{
          var roles = "角色未定义";
        }
        res.send(200, roles);

      }
    });
  }
};


/*
 * Comm : Ajax Get Projects
 */
exports.comm_ajaxGetProjects = function(req, res) {
  Project.find({},function(err,docs){
    if(err){
      console.error(err);
    }else{
      var pj_array = new Array();
      for(var i=0; i <docs.length;i++){
        pj_array[i] = {id:docs[i]._id, name:docs[i].name}
        pj_array[docs[i]._id] = docs[i].name
      }
      console.log(pj_array)
      res.send(200, pj_array);
    }
  });
};


/*
 * Comm : Ajax Get Directions
 */
exports.comm_ajaxGetDirections = function(req, res) {
  Direction.find({}).sort({array: 1}).exec(function(err,docs){
    if(err){
      console.error(err);
    }else{
      var dir_array = new Array();
      for(var i=0; i <docs.length;i++){
        dir_array[i] = {id:docs[i]._id, name:docs[i].name}
        dir_array[docs[i]._id] = docs[i].name
      }
      res.send(200, dir_array);
    }
  });
};

/* ADD TEST*/
