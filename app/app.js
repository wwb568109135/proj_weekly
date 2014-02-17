
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , taskRoutes = require('./routes/task')
  , settingRoutes = require('./routes/setting')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , Weekly = require('./lib/weekly');
var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 7001);
  app.set('trust proxy', true);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.cookieParser());
  app.use(express.cookieSession({key:'sid',secret:'alsdkjfl28DJJAS'}));
  app.use(express.bodyParser({uploadDir:__dirname + '/tmp'}));
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname,"excelmodel"));
  app.use(express.static(path.join(__dirname, 'public')));

  // 本地测试时数据库连接地址
  app.set('mongourl', 'mongodb://localhost/weekly_dev');
  
  // 173 的数据库连接地址
  // app.set('mongourl', 'mongodb://test:WeoY*5TB@localhost/weekly_dev');
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

// Connect MongoDB
// if ('production' == app.get('env')) {
//   var afEnv = JSON.parse(process.env.VCAP_SERVICES);
//   var mongo = afEnv['mongodb-1.8'][0]['credentials'];
//   var mongourl = '';
//   mongo.hostname = (mongo.hostname || 'localhost');
//   mongo.port = (mongo.port || 27017);
//   mongo.db = (mongo.db || 'weekly_dev');
//   if(mongo.username && mongo.password){
//     mongourl = "mongodb://" + mongo.username + ":" + mongo.password + "@" + mongo.hostname + ":" + mongo.port + "/" + mongo.db;
//   }else{
//     mongourl = "mongodb://" + mongo.hostname + ":" + mongo.port + "/" + mongo.db;
//   }
//   app.set('mongourl', mongourl);
// }
Weekly.connect(app.get('mongourl'));

// Index & comm Routes Rule(roules/index.js) -------------------------------
app.use(app.router);
app.all('*', user.auth);
app.get('/', routes.index);
app.get('/logout', routes.logout);
app.get('/home', routes.home);
app.get('/home-leader', routes.home_leader);
app.post('/comm-ajaxUpdateSet', routes.comm_ajaxUpdateSet);
app.post('/comm-ajaxGetRoles', routes.comm_ajaxGetRoles);
app.post('/comm-ajaxGetProjects', routes.comm_ajaxGetProjects);
app.post('/comm-ajaxGetDirections', routes.comm_ajaxGetDirections);
app.post('/comm-ajaxUpdateDel', routes.comm_ajaxUpdateDel);
app.post('/comm-ajaxUpdateCommetEdit', routes.comm_ajaxcommetUpdate);
app.post('/comm-ajaxPageShow', routes.comm_ajaxPageShow);
app.get('/downloadattach/:filep', function(req,res,next){
	var filep = req.params.filep;
	var filename = filep;
	filep = __dirname + '/upfiles/attachment/'+filep;
	res.download(filep,filename);
});

// Task Routes Rule(roules/task.js) -------------------------------
app.get('/task', taskRoutes.task);
app.get('/task-pd', taskRoutes.task_pd);
app.get('/task-rb', taskRoutes.task_rb);
app.get('/task-ld', taskRoutes.task_ld);
app.get('/task-ld-adv', taskRoutes.task_ld_adv);
app.post('/task-ld-adv', taskRoutes.task_ld_adv);
app.get('/task-closed', taskRoutes.task_closed);
app.get('/task/create', taskRoutes.task_create);
app.post('/task/upexcel', taskRoutes.task_upexcel);
app.post('/task/created', taskRoutes.task_created);
app.get('/task/search', taskRoutes.task_search);
app.get('/task/:id', taskRoutes.task_detail);
app.get('/task/del/:id', taskRoutes.task_del);
app.get('/task/edit/:id', taskRoutes.task_edit);
app.post('/task/update/:id', taskRoutes.task_update);
app.post('/task/comment/:id', taskRoutes.task_comment);
app.post('/task/taskscore/:id', taskRoutes.task_score);
app.post('/task/ajaxUpdateCalendar', taskRoutes.calendar_ajaxUpdate);
app.post('/task/callJSON', taskRoutes.task_callJSON);
app.post('/tasksHistoryCreate', taskRoutes.tasksHistory_create);
app.get('/export', taskRoutes.task_export);
app.get('/export-debug', taskRoutes.task_export_debug);
app.post('/excel', taskRoutes.excel);

// Setting Routes Rule(roules/setting.js)  -------------------------------
app.get('/setting-project', settingRoutes.setting_project);
app.post('/setting-project/created', settingRoutes.setting_project_created);
app.get('/setting-project/del/:id', settingRoutes.setting_project_del);
app.get('/setting-direction', settingRoutes.setting_direction);
app.post('/setting-direction/created', settingRoutes.setting_direction_created);
app.get('/setting-direction/del/:id', settingRoutes.setting_direction_del);
app.get('/setting-staff/create', settingRoutes.setting_staff_create);
app.post('/setting-staff/create', settingRoutes.setting_staff_create);
app.get('/setting-staff', settingRoutes.setting_staff);
app.get('/setting-staff/del/:id', settingRoutes.setting_staff_del);

// app.get('/users', user.auth);
app.use(function(req, res){
  res.send("Page Not Found.",404);
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
