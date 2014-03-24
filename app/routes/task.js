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
          case 4:                  //设计角色，转到设计视图
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
        
        // 2.把用户集合表里用户所负责的项目id取出来
        Staff.find({name:staffName}).exec(function(err,docs){
          if(err){
            res.send(404, "用户表查询错误！");
            var typeSet = {'$exists': true};
          }else{
            var user_pj_array = new Array(),
                launch = docs[0].launch;
            for(var i=0; i <launch.length;i++){
              user_pj_array[i] = launch[i].pj;
            }
            var typeSet = {$in: user_pj_array}
            // console.log(user_pj_array);
          }

          // 3. 把用户所负责的项目需求及被点名的需求全部取出
          Weekly.paginate({ 
              $or:[
                {'author':ppQuery}, 
                {'pp':ppQuery}, 
                {type:typeSet}
              ],
              'status':status, 
              'priority':priority, 
              $nor:[{hidden: true}]
            }, 
            {create_date:-1}, 
            pageCur, 
            pageShowNum, 
            function(error, pageCount, paginatedResults) {
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

        });
        

        /*
        Weekly.paginate({ $nor:[{hidden: true}], 'status':status, 'priority':priority, $or:[{'author':ppQuery},{'pp':ppQuery}]}, {create_date:-1}, pageCur, pageShowNum, function(error, pageCount, paginatedResults) {
          if (error) {
            console.error(error);
          } else {
            res.locals.roles = 3;
            res.locals.path = req.path;
            res.locals.originalUrl = req.originalUrl;
            res.render('task-rb', {docs:paginatedResults, pages:pageCount, pageCur:pageCur});
            res.locals.ttdd = paginatedResults;
          }
        }); */

    }
  });

};

/*
 * Leader task View 
 */
exports.task_ld = function(req, res, group){
  if(group){
    // console.log("group: "+ group);
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
      // Project.find().sort({name: 1}).exec(function(err,docs){
      //   if(err){console.error(err);
      //   }else{
      //     var pj_array = new Array();
      //     for(var i=0; i <docs.length;i++){
      //       pj_array[i] = {id:docs[i]._id, name:docs[i].name}
      //       pj_array[docs[i]._id] = docs[i].name
      //     }
      //     res.locals.projectName = pj_array;

      //       // 3.把符合筛选的需求取出来
      //       Weekly.paginate({ $nor:[{hidden: true}]}, {create_date:-1}, pageCur, pageShowNum, function(error, pageCount, paginatedResults) {
      //       // Weekly.paginate({'status':status, 'priority':priority}, {create_date:-1}, pageCur, pageShowNum, function(error, pageCount, paginatedResults) {
      //         if (error) {
      //           console.error(error);
      //         } else {
      //           res.locals.roles = 2;
      //           res.locals.path = req.path;
      //           res.locals.originalUrl = req.originalUrl;
      //           res.locals.group = group;
      //           res.render('task-rb', {docs:paginatedResults, pages:pageCount, pageCur:pageCur});
      //         }
      //       });
      //   }
      // });
      // 
      
       
      // 2.通过所在的组，从项目表里把该组的所有项目取出来，数组形式
      Project.find({ vesting:{$all:[{"$elemMatch":{"group":group}}]} },function(err,docs){
        if(err){
          res.send(404, "项目集合查询错误");
        }else{
            var pj_array = new Array();
            for(var i=0; i <docs.length;i++){
              pj_array[i] = {id:docs[i]._id, name:docs[i].name}
              pj_array[docs[i]._id] = docs[i].name
            }
            res.locals.projectName = pj_array;

            var projectIdArray = [];
            for (var i=0; i<docs.length; i++){ projectIdArray.push(docs[i]._id); }
            // console.log(projectIdArray);
            if (projectIdArray.length > 0){
               
                // 3.把符合项目的需求全部取出来
                Weekly.paginate({
                    type:{$in: projectIdArray}     // 符合本组负责项目的需求
                  }, 
                  {create_date:-1}, 
                  pageCur, pageShowNum, 
                  function(err, pageCount, paginatedResults) {
                    if(err){
                      res.send(404, "需求集合错误");
                    }else{
                      res.locals.roles = 2;
                      res.locals.path = req.path;
                      res.locals.originalUrl = req.originalUrl;
                      res.locals.group = group;
                      res.render('task-rb', {docs:paginatedResults, pages:pageCount, pageCur:pageCur});
                    }
                })

            }else{
              res.locals.roles = 2;
              res.locals.group = group;
              res.render('task-rb', { taskDocs: taskDocs });
            }
        }
      })



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
 * closed task View 
 */
exports.task_closed = function(req, res){
  var pageShowNum = 20,  //当前一页显示多少个
      pageCur = parseInt(req.query.page) || 1,
      status = (req.query.status) ? parseInt(req.query.status) : {'$exists': true},
      priority = (req.query.priority) ? parseInt(req.query.priority) : {'$exists': true},
      // 取登录用户名
      staffName = User.returnStaffUser(req,res).rtx,
      roles = "";

  if(staffName){
    Staff.find({name:staffName}).limit(1).exec(function(err,docs){
        if(err){ 
          res.send(404, "参数错误");
        }else{ 
          roles = docs[0] ? docs[0].roles : 0 ;

            var ppQuery = ( roles ==2 ) ? {'$exists': true} : {$regex: new RegExp(staffName.toLowerCase() + "\\b", "i") };
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
                    Weekly.paginate({ hidden: true, 'status':status, 'priority':priority, $or:[{'author':ppQuery},{'pp':ppQuery}]}, {create_date:-1}, pageCur, pageShowNum, function(error, pageCount, paginatedResults) {
                      if (error) {
                        console.error(error);
                      } else {
                        // res.locals.roles = 3;
                        res.locals.path = req.path;
                        res.locals.originalUrl = req.originalUrl;
                        res.render('task-closed', {docs:paginatedResults, pages:pageCount, pageCur:pageCur});
                        res.locals.ttdd = paginatedResults;
                      }
                    });
                }
              });

        }
    })
  }
  
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

  var rct = []; 
  
  //记录所有项目名 
  Project.find({}).sort({name: 1}).exec(function(err,docs){  //结果倒叙排列
    if(err){
      console.error(err)
    }else{
      rct[0]= docs; //rct[0]记录所有项目名
      
      /** 以下读取excel文件内容 **/
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
                        Weekly.findById(id, function(err, docs) {
                          function compare(obj1, obj2) {
                              return obj2.commenttime - obj1.commenttime;
                          }
                          if (err) {
                            res.send(404, "查无此需求");
                            console.log(err);
                          } else {
                            if (docs){
                                var newdocs = {};
                                docs.comments.sort(compare);
                                newdocs.commentArr = [];
                                if (docs.comments.length > 5) {
                                  for (var i = 0; i < 5; i++) {
                                    newdocs.commentArr[i] = docs.comments[i];
                                  }
                                } else {
                                  newdocs.commentArr = docs.comments;
                                }
                                newdocs.dobj = docs;
                                newdocs.person = staffName;

                                res.render('task-detail', {
                                  docs: newdocs
                                });
                            }
                            res.send(404, "查无此需求");
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
        suggestion:req.body.suggestion,
		score:req.body.scoreSet
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

  // console.log(role);
  var date = new Date(), d = date.getDate(),m = date.getMonth(),y = date.getFullYear(),
      // 取登录用户名
      staffName = User.returnStaffUser(req,res).rtx,
      ppQuery = {$regex: new RegExp(staffName.toLowerCase() + "\\b", "i") };

      // 把用户集合表里用户所负责的项目id取出来
      Staff.find({name:staffName}).exec(function(err,docs){
        if(err){
          res.send(404, "用户表查询错误！");
          var typeSet = {'$exists': true};
        }else{
          var user_pj_array = new Array(),
              launch = docs[0].launch;
          for(var i=0; i <launch.length;i++){
            user_pj_array[i] = launch[i].pj;
          }
          var typeSet = {$in: user_pj_array}
        }

          if (roles == "3"){
            console.log("重构日历视图")
            //重构角色 日历表返回 重构开始时间为上月1号 - 下月30号
            Weekly.find({
              $or:[{'author':ppQuery},{'pp':ppQuery},{type:typeSet}], 
              "rb_star_date": {"$gte": new Date(y, m-1, 1), "$lte": new Date(y, m+1, 30)},
              $nor:[{hidden: true}]
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
              // var typeSet = {'$exists': true};
              console.log( "管理角色，筛选了: "+ filterStaff );
              //管理者筛选某个角色的日历视图，重构开始时间为上月1号 - 下月30号
              Weekly.find({
                $or:[{'pp':ppQuery}], 
                "rb_star_date": {"$gte": new Date(y, m-1, 1), "$lte": new Date(y, m+1, 30)},
                $nor:[{hidden: true}]
              }).sort({create_date: -1}).exec(function(err,docs){  //结果倒叙排列
                res.json(docs)
              });
          }


       });// End Staff.find

    


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

  // 获取本周的周1和周5
  var wfMonday = User.dateNow(req,res).monday;
  var wfFriday = User.dateNow(req,res).friday;
  console.log(wfMonday);
  console.log(wfFriday);

  if(staffName){
    // 1.把用户角色取出
    Staff.find({name:staffName}).limit(1).exec(function(err,uu){
      if(err){
        res.send(404, "查询异常");
      }else{
        if(uu[0] && uu[0].roles == 2){
          ppQuery = {'$exists': true};
          var typeSet = {'$exists': true};
        }else{
          var user_pj_array = new Array(),
              launch = uu[0].launch;
          for(var i=0; i <launch.length;i++){
            user_pj_array[i] = launch[i].pj;
          }
          var typeSet = {$in: user_pj_array}
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
              res.locals.wfMonday = wfMonday;
              res.locals.wfFriday = wfFriday;

                  // 3. 把用户所负责的项目需求及被点名的需求全部取出
                  
                  Weekly.find({ 
                      $or:[
                        {'author':ppQuery}, 
                        {'pp':ppQuery}, 
                        {type:typeSet}
                      ],
                      $and:[{ "rb_star_date": {"$lte": taskEndDate }},{"rb_end_date": { "$gte": taskStarDate} }],
                      $nor:[{hidden: true}]
                    }
                  ).sort({status:-1}).exec(function(err,docs){
                      res.render('export', {docs:docs})
                  });// end 3.
                  

                // 3.需求筛选
                /*
                Weekly.find({
                  $nor:[{hidden: true}], "pp":ppQuery ,$and:[{ "rb_star_date": {"$lte": taskEndDate }},{"rb_end_date": { "$gte": taskStarDate} }] 
                }).sort({status: -1}).exec(function(err,docs){  //结果倒叙排列
                  res.render('export', {docs:docs})
                })*/
                

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