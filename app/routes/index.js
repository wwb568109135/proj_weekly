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
var xlsx = require('node-xlsx');
var fs = require('fs');

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
 * index View (login success redirect to /home)
 */
exports.index = function(req, res){
  res.redirect('/home');
}

/*
 * home View
 */
exports.home = function(req, res){
  // res.render('index', { title: '系统首页' });
  // 取登录用户名
  var staffName = User.returnStaffUser(req,res).rtx;
  if(staffName){
    Staff.find({name:staffName}).limit(1).exec(function(err,docs){
      if(err){
        res.send(404, "参数错误");
      }else{
        var roles = docs[0] ? docs[0].roles : 0;

         res.locals.roles = roles;
         res.render('index', { title: '系统首页' });
      }
    });
  }
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
  // 取登录用户名
  var staffName = User.returnStaffUser(req,res).rtx;

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
  var pageShowNum = 20,  //当前一页显示多少个
      pageCur = parseInt(req.query.page) || 1,
      status = (req.query.status) ? parseInt(req.query.status) : {'$exists': true},
      priority = (req.query.priority) ? parseInt(req.query.priority) : {'$exists': true},
      // 取登录用户名
      staffName = User.returnStaffUser(req,res).rtx,
      ppQuery = {$regex: new RegExp(staffName.toLowerCase() + "\\b", "i") };

  // 1.把ProjectName全部取出来
  Project.find().sort({name: 1}).exec(function(err,docs){
    if(err){console.error(err);
    }else{
      var pj_array = new Array();
      for(var i=0; i <docs.length;i++){
        pj_array[i] = {id:docs[i]._id, name:docs[i].name}
        pj_array[docs[i]._id] = docs[i].name
      }
      res.locals.projectName = pj_array;

        // 2.把符合筛选的需求取出来
        Weekly.paginate({$nor:[{hidden: true}], 'status':status, 'priority':priority, $or:[{'author':ppQuery},{'pm':ppQuery}]}, {create_date:-1}, pageCur, pageShowNum, function(error, pageCount, paginatedResults) {
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
  var pageShowNum = 20,  //当前一页显示多少个
      pageCur = parseInt(req.query.page) || 1,
      status = (req.query.status) ? parseInt(req.query.status) : {'$exists': true},
      priority = (req.query.priority) ? parseInt(req.query.priority) : {'$exists': true},
      // 取登录用户名
      staffName = User.returnStaffUser(req,res).rtx,
      ppQuery = {$regex: new RegExp(staffName.toLowerCase() + "\\b", "i") };

  // 1.把ProjectName全部取出来
  Project.find().sort({name: 1}).exec(function(err,docs){
    if(err){console.error(err);
    }else{
      var pj_array = new Array();
      for(var i=0; i <docs.length;i++){
        pj_array[i] = {id:docs[i]._id, name:docs[i].name}
        pj_array[docs[i]._id] = docs[i].name
      }
      res.locals.projectName = pj_array;
        
        // 2.把符合筛选的需求取出来
        Weekly.paginate({ $nor:[{hidden: true}], 'status':status, 'priority':priority, $or:[{'author':ppQuery},{'pp':ppQuery}]}, {create_date:-1}, pageCur, pageShowNum, function(error, pageCount, paginatedResults) {
        // Weekly.paginate({ $nor:[{hidden: true}], 'status':status, 'priority':priority, 'pp':ppQuery}, {create_date:-1}, pageCur, pageShowNum, function(error, pageCount, paginatedResults) {
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
      Project.find().sort({name: 1}).exec(function(err,docs){
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
      project = (data.advFilterProject) ? data.advFilterProject : {'$exists': true},
      status = (data.advFilterStatus) ? parseInt(data.advFilterStatus) : {'$exists': true},
      priority = (data.advFilterPriority) ? parseInt(data.advFilterPriority) : {'$exists': true},
      // staffName = (data.advFilterStaff) ? data.advFilterStaff : {'$exists': true};
      ppQuery =  (data.advFilterStaff) ? {$regex: new RegExp(data.advFilterStaff.toLowerCase() + "\\b", "i") } : {'$exists': true};
      console.log(project);

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
        Project.find().sort({name: 1}).exec(function(err,docs){
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
  // 取登录用户名
  var staffName = User.returnStaffUser(req,res).rtx;

  // 1.取当前用户信息(负责了哪些项目)
  Staff.find({"name":staffName}).exec(function(err,docs){
    if(err){
      console.log(err)
    }else{
      res.locals.staff = docs[0];

      // 2.取所有的项目出来
      Project.find({}).sort({name: 1}).exec(function(err,docs){  //结果倒叙排列
        if(err){
          console.error(err)
        }else{
          res.render('task-create', {pj:docs}); 
        }
      });

    }
  })

};


/*
 * tasks-excel upload
 */
exports.task_upexcel = function(req, res) {
    // 取登录用户名
    var staffName = User.returnStaffUser(req,res).rtx;
    // 在家环境，模拟用户名

  var rct = []; 
  
  //记录所有项目名 
  Project.find({}).sort({name: 1}).exec(function(err,docs){  //结果倒叙排列
      if(err){
        console.error(err)
      }else{
        //res.render('task-create', {pj:docs}); 
        rct[0]= docs; //rct[0]记录所有项目名
      }
    });
  
  var tmp_path = req.files.fileuplod.path;
  var newDateStr = (new Date()).getTime();
  var target_path =  __dirname + '/../upfiles/' + staffName + newDateStr + '__' + req.files.fileuplod.name;
  fs.rename(tmp_path, target_path, function(err) {
      //if (err) throw err;
      // 删除临时文件夹文件, 
      fs.unlink(tmp_path, function() {
         //if (err) throw err;
         //res.send('File uploaded to: ' + target_path + ' - ' + req.files.fileuplod.size + ' bytes');
     var obj = xlsx.parse(target_path).worksheets[0]['data'];
     //console.log(obj[0]);
     obj.shift();
     var newArr = [];
     for(var i=0; i<obj.length; i++){
      if(!!obj[i][0].value){
        vton(i);
      }else{ break;}
     }
     //console.log(newArr.length);
  
     function vton(n){
      newArr[n]=obj[n];
     }

     rct[1] = newArr;
     //console.log(rct[1]);
     res.render('task-create_excel', {rct:rct}); 
      });
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
    // 取登录用户名
    var staffName = User.returnStaffUser(req,res).rtx;
    if(staffName){
      // 1.取出角色名
      Staff.find({name:staffName}).limit(1).exec(function(err,docs){
        if(err){
          res.send(404, "参数错误");
        }else{
          var roles = docs[0] ? docs[0].roles : 0;
          res.locals.roles = roles;
            
            // 2.取出修改记录
            TasksHistory.findOne({task:id},function(err,doc){
              if(err){console.log(err)}else{
                res.locals.taskHistory = doc;
                
                  // 3.把ProjectName全部取出来
                  Project.find().sort({name: 1}).exec(function(err,docs){
                    if(err){console.error(err);
                    }else{
                      var pj_array = new Array();
                      for(var i=0; i <docs.length;i++){
                        pj_array[i] = {id:docs[i]._id, name:docs[i].name}
                        pj_array[docs[i]._id] = docs[i].name
                      }
                      res.locals.projectName = pj_array;

                        // 4.按id取出需求
                        Weekly.findById(id, function(err, docs){						  
									  function compare(obj1,obj2){
										return obj2.commenttime - obj1.commenttime;
									  }
									  var newdocs={};
									  docs.comments.sort(compare);
									  newdocs.commentArr=[];
									  if(docs.comments.length >5){
									    for(var i=0; i<5; i++){
										  newdocs.commentArr[i] = docs.comments[i];
										}
									  } else {
										newdocs.commentArr = docs.comments;
									  }
									  
						              newdocs.dobj = docs;
						              newdocs.person = staffName;
									  if(err){console.log(err);}else{
										res.render('task-detail', {docs:newdocs});
									  }
                        });

                    }
                  });

              }
            })
        }
      });
    }
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
  if(!query){
    console.log("必须输入ID或标题");
  }else if(/\d{4,}/.test(query)){   // 按ID精确查找
    console.log("精确查找");
    var queryParm = {_id:query};
  }else{                            // 通过title模糊查找
    console.log("通过title模糊查找");
    var queryParm = {title:new RegExp(query)}
  }

  if(queryParm){
    // 1.把ProjectName全部取出来
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

          // 2.把搜索结果取出来取出来
          Weekly.find(queryParm).sort({create_date: -1}).exec(function(err,docs){
            if(err){
              console.error(err);
              res.send(404, "暂时不支持模糊查找，本次查换异常");
            }else if(docs.length){
              res.render('task-search', {docs:docs})
            }else{
              res.send(404, "查询不到数据");
            }
          });
      }
    });
  }
};

//需求打分 (by v_xhshen)
exports.task_score = function(req, res) {
	var id = req.params.id;
	var task = new Weekly(req.body.task);	
	
	Weekly.findByIdAndUpdate(id, 
    { 
      $set: { 
        score:req.body.scoreSet,
		suggestion:req.body.suggestion
      },
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
}

//用户评论 (by v_xhshen)
exports.task_comment = function(req, res) {
  // 取登录用户名
  var staffName = User.returnStaffUser(req,res).rtx;
  var id = req.params.id;
  var task = new Weekly(req.body.task);
  
  var date = new Date();
  
  var newcomment;
  
  Staff.findByName(staffName,function(err,person){
    if(err){
	  throw err;
	} else{
	  var role = person[0].roles;
	  
	  var rolestr;
	  switch(role){
          case 0:                  //未定义角色
            rolestr='';
            break;
          case 1:                  //产品角色
            rolestr='产品';
            break;
          case 2:                  //管理角色
            rolestr='管理';
            break;
          case 3:                  //重构角色
            rolestr='重构';
            break;
      }
	  newcomment = {commentname:staffName,commentrole:rolestr, commenttime:date, commentcontent:req.body.commenttext};
	  
	  
	  Weekly.findByIdAndUpdate(id, 
		{ 
		  $set: { 
			status:req.body.task.status,
		  },
		  $push:{
			comments:newcomment,
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
	}
  })
};


exports.task_update = function(req, res) {
  // 取登录用户名
  var staffName = User.returnStaffUser(req,res).rtx;
  
  var id = req.params.id;
  var task = new Weekly(req.body.task);
  var tmp_txtArr = [];
  var tmp_Arr =[];
  var tmp_size = [];
   
  //console.log(req.files);
  //遍历用于取出有用的input值 by v_xhshen
  for(var i=0; i<100; i++){
   if(!!req.files['accessory'+i]){
     if(!!(req.files['accessory'+i].size)){
     tmp_Arr[tmp_Arr.length] = req.files['accessory'+i];
     tmp_txtArr[tmp_txtArr.length] = (!!req.body['accessoryditail'+i])? req.body['accessoryditail'+i] : ' ';

     tmp_size[tmp_size.length] = req.files['accessory'+i].size;
     }
   }
  }

  var L = tmp_Arr.length;
  
  //attachment: [{attpath: String, attdetail: String, attsize: number}]
  //存储多个文件到指定文件夹 by v_xhshen
  for(var i=0; i<L; i++){
    var tmp_path = tmp_Arr[i].path;
	var newDateStr = (new Date()).getTime(); 
    var target_path = '/upfiles/attachment/' + staffName + newDateStr + '_' + tmp_Arr[i].name;
    var nowtime = new Date();
  
    var tmpObj = {attfilename: tmp_Arr[i].name, attpath: target_path, attdetail: tmp_txtArr[i], attsize: tmp_size[i], attperson: staffName, attuptime:nowtime};
    Weekly.findByIdAndUpdate(id, 
      { 
        $push:{
           attachment: tmpObj,
        }
      }, 
      { upsert : true },
      function (err) {
        if (err){
          res.send(404, err.message);
        }
      }
    );

    fs.rename(tmp_path, __dirname + '/..' + target_path, function(err) {
      if (err) throw err;
      // 删除临时文件夹文件, 
      fs.unlink(tmp_path, function() {
         if (err) throw err;
      });
    });
  }


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
        progress : task.progress,
        direction : task.direction,
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
      // 取登录用户名
      staffName = User.returnStaffUser(req,res).rtx,
      ppQuery = {$regex: new RegExp(staffName.toLowerCase() + "\\b", "i") };


  if (roles == "3"){
    console.log("重构日历视图")
    //重构角色 日历表返回 重构开始时间为上月1号 - 下月30号
    Weekly.find({
      $nor:[{hidden: true}], "pp":ppQuery, "rb_star_date": {"$gte": new Date(y, m-1, 1), "$lte": new Date(y, m+1, 30)}
    }).sort({create_date: -1}).exec(function(err,docs){  //结果倒叙排列
      res.json(docs)
    });
  } else if (roles == "1"){
    //产品角色 日历表返回 上线时间为上月1号 - 下月30号
    Weekly.find({
      $nor:[{hidden: true}], "author":staffName, "online_date": {"$gte": new Date(y, m-1, 1), "$lte": new Date(y, m+1, 30)}
    }).sort({create_date: -1}).exec(function(err,docs){  //结果倒叙排列
      res.json(docs)
    });
  } else if(roles == "2" && filterStaff) {
      var ppQuery = {$regex: new RegExp(filterStaff.toLowerCase() + "\\b", "i") };
      console.log( "管理角色，筛选了: "+ filterStaff );
      //管理者筛选某个角色的日历视图，重构开始时间为上月1号 - 下月30号
      Weekly.find({
        $nor:[{hidden: true}], "pp":ppQuery, "rb_star_date": {"$gte": new Date(y, m-1, 1), "$lte": new Date(y, m+1, 30)}
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
      // 取登录用户名
      staffName = User.returnStaffUser(req,res).rtx,
      ppQuery = {$regex: new RegExp(staffName.toLowerCase() + "\\b", "i") };

  if(staffName){
    // 1.把用户角色取出
    Staff.find({name:staffName}).limit(1).exec(function(err,uu){
      if(err){
        res.send(404, "查询异常");
      }else{
        if(uu[0] && uu[0].roles == 2){
          ppQuery = {'$exists': true}
        }
        res.locals.roles = uu[0].roles;

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

                // 3.需求筛选
                Weekly.find({
                  //$nor:[{hidden: true}], "pp":ppQuery, "rb_star_date": {"$gte": taskStarDate, "$lte": taskEndDate} ,$or:[{ "rb_end_date": { $gt: taskStarDate, $lt: taskEndDate } }] 
                  $nor:[{hidden: true}], "pp":ppQuery ,$or:[{ "rb_star_date": {"$gte": taskStarDate, "$lte": taskEndDate }},{"rb_end_date": { "$gte": taskStarDate, "$lte": taskEndDate } }] 
                }).sort({status: -1}).exec(function(err,docs){  //结果倒叙排列
                  res.render('export', {docs:docs})
                })

            }
          })
      }
    });
  }

};

/*
 * export Weekly Data [debug]
 */
exports.task_export_debug = function(req, res){
  var taskStarDate = (req.query.taskStarDate) ? req.query.taskStarDate : {'$exists': true},
      taskEndDate = (req.query.taskEndDate) ? req.query.taskEndDate : {'$exists': true},
      // 取登录用户名
      staffName = User.returnStaffUser(req,res).rtx,
      ppQuery = {$regex: new RegExp(staffName.toLowerCase() + "\\b", "i") };

  if(staffName){
    // 1.把用户角色取出
    Staff.find({name:staffName}).limit(1).exec(function(err,uu){
      if(err){
        res.send(404, "查询异常");
      }else{
        if(uu[0] && uu[0].roles == 2){
          ppQuery = {'$exists': true}
        }
        res.locals.roles = uu[0].roles;

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

                // 3.需求筛选
                Weekly.find({
                  //$nor:[{hidden: true}], "pp":ppQuery, "rb_star_date": {"$gte": taskStarDate, "$lte": taskEndDate} ,$or:[{ "rb_end_date": { $gt: taskStarDate, $lt: taskEndDate } }] 
                  $nor:[{hidden: true}], "pp":ppQuery ,$or:[{ "rb_star_date": {"$gte": taskStarDate, "$lte": taskEndDate }},{"rb_end_date": { "$gte": taskStarDate, "$lte": taskEndDate } }] 
                }).sort({status: -1}).exec(function(err,docs){  //结果倒叙排列
                  res.render('export0', {docs:docs})
                })

            }
          })
      }
    });
  }

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
          // console.error("没记录");
          TasksHistory.create(data, function (err) {
            if (err){
              res.send(404, "格式错误，需求历史记录失败");
            }else {
              res.send(200, "需求历史记录成功");
            }
          })
        }else{                  // 有记录，在原记录上修改
          // console.error("有记录");
          TasksHistory.findOne({task:data.task}, function (err, doc) {
            if (err){
              console.log(error);
              res.send(404, "格式错误，需求历史记录失败");
            }else{
              // doc.name = 'jason borne';
              for(var i=0; i<data.modify.length; i++){
                doc.modify.push(data.modify[i]);
              }
              doc.save();
              res.send(200, "需求历史记录成功");
            }
          })

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
       flag = data.dbCollection;
  var dbCollection = null;
  delete data.id;
  delete data.dbCollection;

  // console.log(id);console.log(dbCollection);console.log(data);

  if(flag == "Project" ){
    dbCollection = Project;
  }else if(flag == "Weekly" ){
    dbCollection = Weekly;
  }else if(flag == "Staff"){
    dbCollection = Staff;
  }else if(flag = "Direction"){
    dbCollection = Direction;
  }
  
  // console.log(id);
  // console.log(data);

  if( id && data ){  
    console.log('ajax saveing');

    var oldStatus = null;
    if(flag == "Weekly" )
    {
      dbCollection.findById(id, function(err, docs){            
        oldStatus = docs.status;
      });
    }

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

          //需求状态被修改
          if(flag == "Weekly" && oldStatus && data.status && oldStatus != data.status )
          {
            dbCollection.findById(id, function(err, docs){   

              var nameList = new Array();

              //获取需求负责人
              var str = docs.pp;
              if ( str.charAt(str.length-1) == ';')
              {
                str=str.substring(0,str.length-1);
              }
              var nameTmp = str.split(";");

              for(var i=0;i<nameTmp.length;i++){
                nameList.push(nameTmp[i]);
              }

              //获取需求接口人
              nameTmp = [];
              str = docs.pm;
              if ( str.charAt(str.length-1) == ';')
              {
                str=str.substring(0,str.length-1);
              }
              nameTmp = str.split(";");

              for(var i=0;i<nameTmp.length;i++)
              {
                var s = true;
                for(var j=0;j<nameList.length;j++)
                {
                  if(nameTmp[i] == nameList[j])
                  { s = false; break; }
                }
                if(s)
                {
                  nameList.push(nameTmp[i]);
                }
              }


              //获取需求创建者
              nameTmp = [];
              str = docs.author;
              if ( str.charAt(str.length-1) == ';')
              {
                str=str.substring(0,str.length-1);
              }
              nameTmp = str.split(";");

              for(var i=0;i<nameTmp.length;i++)
              {
                var s = true;
                for(var j=0;j<nameList.length;j++)
                {
                  if(nameTmp[i] == nameList[j])
                  { s = false; break; }
                }
                if(s)
                {
                  nameList.push(nameTmp[i]);
                }
              }

              var staffName = User.returnStaffUser(req,res).rtx;
              var taskName = docs.title;
              var mailTitle = '状态更新"' + taskName + '"';
              var sLink = 'http://wr.ied.com/task/' + id;
              var mailContent = 'Dear All:\n' + staffName + '在周报系统中更新了"' + taskName + '"的任务状态。详情请点击：\n' + sLink;

              var spawn = require('child_process').spawn;
              for(i=0;i<nameList.length;i++){
                var python = spawn('python', ['/home/wwwroot/public/weekly/script/send_mail.py',nameList[i],mailTitle,mailContent]);

                python.stdout.on('data', function (data) {
                    console.log('send email:' + data);
                });

                // 捕获标准错误输出并将其打印到控制台
                python.stderr.on('data', function (data) {
                    console.error('错误输出：\n' + data);
                });

                /*
                // 注册子进程关闭事件
                python.on('exit', function (code, signal) {
                    console.log('子进程已退出，代码：' + code);
                });
                */
              }

            });
          }
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

/**
* Add by v_xhshen 
* 2014-01-14
* ajax分页显示
*/
exports.comm_ajaxPageShow = function(req, res) {
  var data = req.body;  
  var id = data.id || null;
  delete data.id;
  var pageCur= data.pagenum*1;
  
  // 4.按id取出需求
  Weekly.findById(id, function(err, docs){
	  var comtsL=docs.comments.length;
	  function compare(obj1,obj2){
		return obj2.commenttime - obj1.commenttime;
	  }
	  docs.comments.sort(compare);
	  
	  var newcometobj={};
	  newcometobj.cometarr=[];
	  newcometobj.comLength = comtsL;
	  
	  for(var i=0; i<5; i++){
		var j = (pageCur-1)*5+i;
		if(comtsL>j){
			var comttime=docs.comments[j].commenttime;
			var comttime = new Date(comttime);
			var nowtimestr = comttime.getFullYear() + '-' + ((comttime.getMonth()<9)? '0'+(comttime.getMonth()+1) : comttime.getMonth()+1) + '-' + ((comttime.getDate()<10)? '0'+comttime.getDate() : comttime.getDate()) + ' ' + ((comttime.getHours()<10)? '0'+comttime.getHours() : comttime.getHours()) + ':' + ((comttime.getMinutes()<10)? '0'+comttime.getMinutes() : comttime.getMinutes()) + ':' + ((comttime.getSeconds()<10)? '0'+comttime.getSeconds() : comttime.getSeconds());
			
			var newobj={};
			newobj.commt= docs.comments[j];
			newobj.timestr = nowtimestr;
			newcometobj.cometarr[i] = newobj;
		}
	  }

	  if(err){console.log(err);}else{
		res.send(200, newcometobj);
	  }
	});
};


/**
* Add by v_xhshen 
* 2014-01-14
* ajax编辑更新评论
*/
exports.comm_ajaxcommetUpdate = function(req, res) {
  var data = req.body;  
  var id = data.id || null;
  delete data.id;
  var id2 = data.id2;
  var comtcontent = data.comtcontent;
  var oldArr;
  
  if(data.type == "commentsedit")
  {

  	Weekly.findById(id, function(err, docs)
    {
  	  if(err)
      {
  		  console.log(err);
  	  }
      else
      {
    		oldArr = docs.comments;
    		var L=oldArr.length;
    		for(var i=0;i<L;i++)
        {
    			if(oldArr[i]._id == id2)
          {
    				oldArr[i].commentcontent = comtcontent;
    			}
    		}
    		//console.log(newArr); 
    		//console.log('ajax saveing');
    		//console.log(oldArr);
    		Weekly.findByIdAndUpdate(id, 
    			{$set: {
    			   comments: oldArr,
    		  }},
    			{upsert : true},
    			function (err)
          {
    				if (err)
            {
    				  res.send(404, "格式错误，修改失败");
    				}
            else 
            {
    				  Weekly.findById(id, function(err, docs)
              {
    					  var comtsL=docs.comments.length;
    					  function compare(obj1,obj2)
                {
    						  return obj2.commenttime - obj1.commenttime;
    					  }
                docs.comments.sort(compare);

    					  var newcometobj={};
    					  newcometobj.cometarr=[];
    					  newcometobj.comLength = comtsL;
    					  
                var pageCur = data.pageCur*1;
                if(pageCur <= 0)
                {
                  pageCur = 1;
                }

    					  for(var i=0; i<5; i++)
                {
      						var j = (pageCur-1)*5+i;
      						if(comtsL>j)
                  {
      							var comttime=docs.comments[j].commenttime;
      							var comttime = new Date(comttime);
      							var nowtimestr = comttime.getFullYear() + '-' + ((comttime.getMonth()<9)? '0'+(comttime.getMonth()+1) : comttime.getMonth()+1) + '-' + ((comttime.getDate()<10)? '0'+comttime.getDate() : comttime.getDate()) + ' ' + ((comttime.getHours()<10)? '0'+comttime.getHours() : comttime.getHours()) + ':' + ((comttime.getMinutes()<10)? '0'+comttime.getMinutes() : comttime.getMinutes()) + ':' + ((comttime.getSeconds()<10)? '0'+comttime.getSeconds() : comttime.getSeconds());

      							var newobj={};
      							newobj.commt= docs.comments[j];
      							newobj.timestr = nowtimestr;
      							newcometobj.cometarr[i] = newobj;
      						}
    					  }
                console.error("ccc");   
    					  newcometobj.pageCurnum = pageCur;
    					  if(err){console.log(err);}
                else
                {
    						  res.send(200, newcometobj);
    					  }
    				  });
    				}
    			}
  		  );
      }
    });
  } 
};

/**
* Add by v_xhshen 
* 2014-01-14
* ajax删除附件/评论
*/
exports.comm_ajaxUpdateDel = function(req, res) {
  var data = req.body;  
  var id = data.id || null;
  delete data.id;
  var id2 = data.id2;
  
  var oldArr=[],newArr=[];
  
  if(data.type == "attachment"){
    var filepath = __dirname + '/..' + data.filepath;
	Weekly.findById(id, function(err, docs){
	  if(err){
		console.log(err);
	  }else{
		oldArr = docs.attachment;
		var L=oldArr.length;
		for(var i=0;i<L;i++){
			if(oldArr[i]._id == id2){
				
			} else{
				newArr.push(oldArr[i]);
			}
		}
		//console.log(newArr); 
		//console.log('ajax saveing');
		Weekly.findByIdAndUpdate(id, 
			{$set: {
			   attachment: newArr,
		    }},
			{upsert : true},
			function (err) {
				if (err){
				  res.send(404, "格式错误，修改失败");
				}else {
				  res.send(200, "修改成功！");
				  fs.unlink(filepath, function() {
					   //if (err) throw err;
					});
				  //console.log("保存成功");
				}
			}
		);
	  }
    });
  } else if(data.type == "comments"){
	Weekly.findById(id, function(err, docs){
	  if(err){
		console.log(err);
	  }else{
		oldArr = docs.comments;
		var L=oldArr.length;
		for(var i=0;i<L;i++){
			if(oldArr[i]._id == id2){
				
			} else{
				newArr.push(oldArr[i]);
			}
		}
		//console.log(newArr); 
		//console.log('ajax saveing');
		Weekly.findByIdAndUpdate(id, 
			{$set: {
			   comments: newArr,
		    }},
			{upsert : true},
			function (err) {
				if (err){
				  res.send(404, "格式错误，修改失败");
				}else {
				  
				  Weekly.findById(id, function(err, docs){
					  var comtsL=docs.comments.length;
					  function compare(obj1,obj2){
						return obj2.commenttime - obj1.commenttime;
					  }
                      docs.comments.sort(compare);
					  
					  var newcometobj={};
					  newcometobj.cometarr=[];
					  newcometobj.comLength = comtsL;
					  
                      var pageCur = data.pageCur*1;
                      if((pageCur-1)*5==comtsL){
					     pageCur--;
					  }
					  
					  for(var i=0; i<5; i++){
						var j = (pageCur-1)*5+i;
						if(comtsL>j){
							var comttime=docs.comments[j].commenttime;
							var comttime = new Date(comttime);
							var nowtimestr = comttime.getFullYear() + '-' + ((comttime.getMonth()<9)? '0'+(comttime.getMonth()+1) : comttime.getMonth()+1) + '-' + ((comttime.getDate()<10)? '0'+comttime.getDate() : comttime.getDate()) + ' ' + ((comttime.getHours()<10)? '0'+comttime.getHours() : comttime.getHours()) + ':' + ((comttime.getMinutes()<10)? '0'+comttime.getMinutes() : comttime.getMinutes()) + ':' + ((comttime.getSeconds()<10)? '0'+comttime.getSeconds() : comttime.getSeconds());
							
							var newobj={};
							newobj.commt= docs.comments[j];
							newobj.timestr = nowtimestr;
							newcometobj.cometarr[i] = newobj;
						}
					  }
                      
					  newcometobj.pageCurnum = pageCur;
					  if(err){console.log(err);}else{
						res.send(200, newcometobj);
					  }
				    }); 
				}
			}
		);
	  }
    });
  }
};


/*
 * Comm : Ajax Get Roles
 */
exports.comm_ajaxGetRoles = function(req, res) {
  var staffName = req.query.staffName;
      // rolesText = ["未定义角色", "产品角色", "管理角色", "重构角色"];

  // console.log(staffName);
  if(staffName){
    Staff.find({name:staffName}).limit(1).exec(function(err,docs){
      if(err){
        res.send(404, "查询异常");
      }else{
        if(docs[0]){
          // var roles = rolesText[docs[0].roles];
          var roles = docs[0].roles + "";
        }else{
          var roles = "0";
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
  Project.find().sort({name: 1}).exec(function(err,docs){
    if(err){
      console.error(err);
    }else{
      var pj_array = new Array();
      for(var i=0; i <docs.length;i++){
        pj_array[i] = {id:docs[i]._id, name:docs[i].name}
        pj_array[docs[i]._id] = docs[i].name
      }
      // console.log(pj_array)
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
