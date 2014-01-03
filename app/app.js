
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , Weekly = require('./lib/weekly');
var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 7001);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.cookieParser());
  app.use(express.cookieSession({key:'sid',secret:'alsdkjfl28DJJAS'}));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
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

// Routes Rule
app.use(app.router);
app.all('*', user.auth);
app.get('/', routes.index);
app.get('/logout', routes.logout);
app.get('/home', routes.home);
app.post('/comm-ajaxUpdateSet', routes.comm_ajaxUpdateSet);
app.post('/comm-ajaxGetRoles', routes.comm_ajaxGetRoles);
app.post('/comm-ajaxGetProjects', routes.comm_ajaxGetProjects);
app.post('/comm-ajaxGetDirections', routes.comm_ajaxGetDirections);

app.get('/task', routes.task);
app.get('/task-pd', routes.task_pd);
app.get('/task-rb', routes.task_rb);
app.get('/task-ld', routes.task_ld);
app.get('/task-ld-adv', routes.task_ld_adv);
app.post('/task-ld-adv', routes.task_ld_adv);
app.get('/task/create', routes.task_create);
app.post('/task/created', routes.task_created);
app.get('/task/search', routes.task_search);
app.get('/task/:id', routes.task_detail);
app.get('/task/del/:id', routes.task_del);
app.get('/task/edit/:id', routes.task_edit);
app.post('/task/update/:id', routes.task_update);
// app.post('/task/ajaxUpdate', routes.task_ajaxUpdate);
app.post('/task/ajaxUpdateCalendar', routes.calendar_ajaxUpdate);
app.post('/task/callJSON', routes.task_callJSON);
app.post('/tasksHistoryCreate', routes.tasksHistory_create);

app.get('/export', routes.task_export);
app.post('/excel', routes.excel);

app.get('/setting-project', routes.setting_project);
app.post('/setting-project/created', routes.setting_project_created);
app.get('/setting-project/del/:id', routes.setting_project_del);
app.get('/setting-direction', routes.setting_direction);
app.post('/setting-direction/created', routes.setting_direction_created);
app.get('/setting-direction/del/:id', routes.setting_direction_del);
app.get('/setting-staff/create', routes.setting_staff_create);
app.post('/setting-staff/create', routes.setting_staff_create);
app.get('/setting-staff', routes.setting_staff);
app.get('/setting-staff/del/:id', routes.setting_staff_del);

// app.get('/users', user.auth);
app.use(function(req, res){
  res.send("Page Not Found.",404);
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
