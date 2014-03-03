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

/*
 * index View (login success redirect to /home)
 */
exports.index = function(req, res){
  // res.redirect('/home');

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

        if(roles == 2){
          res.redirect('/home-leader');
        }else{
          res.redirect('/home');
        }

      }
    });
  }
}


/*
 * home View
 */
exports.home = function(req, res){
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
 * home Leader View
 */
exports.home_leader = function(req, res){
  // 取登录用户名
  var staffName = User.returnStaffUser(req,res).rtx;
  if(staffName){
    // 1.从用户表取出此leader对应的组别
    Staff.find({name:staffName}).limit(1).exec(function(err,docs){
      if(err){
        res.send(404, "参数错误");
      }else{
        var date = new Date(), d = date.getDate(),m = date.getMonth(),y = date.getFullYear();
        var roles = docs[0] ? docs[0].roles : 0,
            group = docs[0] ? docs[0].group : 0;

            // 2.通过所在的组，从项目表里把该组的所有项目取出来，数组形式
            Project.find({ vesting:{$all:[{"$elemMatch":{"group":group}}]} },function(err,docs){
              if(err){
                res.send(404, "项目集合查询错误");
              }else{
                  var projectIdArray = [];
                  for (var i=0; i<docs.length; i++){ projectIdArray.push(docs[i]._id); }
                  console.log(projectIdArray);
                  if (projectIdArray.length > 0){
                     
                      // 3.把符合项目的需求全部取出来
                      Weekly.find({
                          type:{$in: projectIdArray},     // 符合本组负责项目的需求
                          "rb_star_date": {"$gte": new Date(y, m, 1), "$lte": new Date(y, m, 30)}  //重构开始时间在这个月以内的需求
                      },function(err,taskDocs){
                        if(err){
                          res.send(404, "需求集合错误");
                        }else{
                          // 计算已完成需求的数量,CP需求的数量;
                          var taskStatus = {};
                              taskStatus.finish = 0,taskStatus.CP = 0,taskStatus.focus = 0;
                          var patt1 = new RegExp(/CP;?/);
                          for(var i=0; i<taskDocs.length; i++){
                            if(taskDocs[i].progress == 100){ taskStatus.finish += 1 }
                            if(patt1.test(taskDocs[i].pp)){ taskStatus.CP += 1 }
                            if(taskDocs[i].focus){ taskStatus.focus += 1 }
                          }
                          taskStatus.len = taskDocs.length;

                          // console.log(taskDocs);
                          res.locals.roles = roles;
                          res.locals.group = group;
                          res.locals.taskStatus = taskStatus;
                          res.render('index-leader', {
                            taskDocs:taskDocs,
                            // 获取当前的日期 yyyy-mm-dd
                            dateNow: function() {
                              var dateNow = new Date();
                              var dd = dateNow.getDate();
                              var monthSingleDigit = dateNow.getMonth() + 1,
                                  mm = monthSingleDigit < 10 ? '0' + monthSingleDigit : monthSingleDigit;
                              var yy = dateNow.getFullYear();
                              return (yy + '-' + mm + '-' + dd);
                            }
                          })
                        }
                      })
                  }else{
                    res.locals.roles = roles;
                    res.locals.group = group;
                    res.render('index-leader', { taskDocs: '' });
                  }
              }
            })

         
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
              var nameListStr = "";
              for(i=0;i<nameList.length;i++)
              {
                nameListStr += nameList[i] + "@tencent.com;";

              }

              var python = spawn('python', [__dirname + '/../script/send_mail.py',nameListStr,mailTitle,mailContent]);

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
