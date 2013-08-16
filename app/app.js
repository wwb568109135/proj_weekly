
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
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));

  app.set('mongourl', 'mongodb://localhost/weekly_dev');
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

// Connect MongoDB
if ('production' == app.get('env')) {
  var afEnv = JSON.parse(process.env.VCAP_SERVICES);
  var mongo = afEnv['mongodb-1.8'][0]['credentials'];
  var mongourl = '';
  mongo.hostname = (mongo.hostname || 'localhost');
  mongo.port = (mongo.port || 27017);
  mongo.db = (mongo.db || 'todoDb');
  if(mongo.username && mongo.password){
    mongourl = "mongodb://" + mongo.username + ":" + mongo.password + "@" + mongo.hostname + ":" + mongo.port + "/" + mongo.db;
  }else{
    mongourl = "mongodb://" + mongo.hostname + ":" + mongo.port + "/" + mongo.db;
  }
  app.set('mongourl', mongourl);
}
Weekly.connect(app.get('mongourl'));

// Routes Rule
app.get('/', routes.index);
app.get('/task', routes.task);
app.get('/task/create', routes.task_create);
app.post('/task/created', routes.task_created);
app.get('/task/:id', routes.task_detail);
app.get('/task/del/:id', routes.task_del);
app.get('/users', user.list);
app.use(function(req, res){
  res.send("Page Not Found.",404);
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
