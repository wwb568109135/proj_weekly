var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

// 需求主表集合
var WeeklySchema = new Schema({
	author: {type: String, requierd: false},		//需求创建者
	type: {type: String, requierd: true},			//所属项目
	priority: {type:Number, defaults: 0},			//优先级
	create_date: {type:Date},						//需求创建时间
	title: {type: String, requierd: true},			//需求标题
	focus: {type:Boolean, defaults: false},			//是否重点需求
	content: {type: String, requierd: false},		//需求内容
	attachment: [{attfilename:String, attpath: String, attdetail: String, attsize:Number, attperson: String, attuptime:Date}],	//需求附件
	pages: {type: String, defaults: 1},				//页面数
	online_date: {type:Date},						//上线时间
	rb_star_date: {type:Date},						//重构开始时间
	rb_end_date: {type:Date},						//重构完成时间
	pp: {type: String, requierd: true},				//需求负责人员
	pm: {type: String, requierd: false},			//需求接口人
	direction: {type: String, requierd: false},		//需求其它说明
	status: {type: Number, defaults: 0},			//需求当前状态
	progress: {type: String, requierd: false},		//需求总进度
	hidden: {type:Boolean, defaults: false},			//结束的需求
	comments:[{commentname:String, commentrole:String, commenttime: Date, commentcontent: String}], //评论
	score: {type: Number, defaults: 0}, //需求评分
	suggestion: {type: String, requierd: false} //改进建议
});

// 项目表集合
var ProjectSchema = new Schema({
	name: {type: String, requierd: true},			//所属项目名
	star: {type: Number, defaults: 1},				//项目星级
	vesting: [{group: Number}]						//项目规属团队
});

// 人员表集合
var StaffSchema = new Schema({
	name: {type: String, requierd: true},			//英文名
	roles: {type:Number, defaults: 0},				//角色 0:角色未定义  1:产品/品牌经理角色  2:管理角色  3:重构角色  4:设计角色
	project: {type:String},							//项目id
	group: {type:Number, defaults: 0},				//组别 1:重构1组  2:重构2组  3:重构3组  4:设计1组  5:设计2组  6:设计3组
	launch: [{pj:String}],							//开通的项目
	remark: {type: String, requierd: false},		//备注信息
	create_date: {type:Date, requierd: true},		//创建时间
	hidden: {type:Boolean, defaults: false}			//停用的用户
});

// Add by v_xhshen 2014-01-15
//findByName 方法
StaffSchema.statics.findByName = function(name,cb){
    this.find({name:new RegExp(name,'i')},cb);
}

// 其化说明集合
var DirectionSchema = new Schema({
	name: {type: String, requierd: true},			//预设说明1
	array: {type: Number, defaults: 1}				//说明排列
});

// 需求历史变更
var TasksHistorySchema = new Schema({
	task: {type: String, requierd: true},			//变更需求ID
	modify: [{edate: Date, editor: String, efield: String, evalue_before: String, evalue_after: String}]	//修改细节
	// 变更时间	 变更人	变更字段	变更前	变更后
});

var opened = false;

mongoose.connection.on('open', function(ref) {
	opened = true;
});

mongoose.connection.on('error', function(err) {
	opened = false;
});

exports.Weekly = mongoose.model('Weekly', WeeklySchema);
exports.Project = mongoose.model('Project', ProjectSchema);
exports.Staff = mongoose.model('Staff', StaffSchema);
exports.Direction = mongoose.model('Direction', DirectionSchema);
exports.TasksHistory = mongoose.model('TasksHistory', TasksHistorySchema);

exports.connect = function(mongourl, options) {
	if ('undefined' === typeof options) {
		options = {
			server: {
				socketOptions: {
					keepAlive: 1
				}
			}
		};
	}
	mongoose.connect(mongourl, options);
};

exports.close = function() {
	mongoose.disconnect();
	opened = false;
};

exports.isOpen = function() {
	return opened;
};



/**
 * @method paginate
 * @param {Object} query Mongoose Query Object
 * @param {Number} pageNumber 
 * @param {Number} resultsPerPage
 * Extend Mongoose Models to paginate queries
 * https://github.com/edwardhotchkiss/mongoose-paginate
 **/
mongoose.Model.paginate = function(q, s, pageNumber, resultsPerPage, callback) { 
  var model = this;
  callback = callback || function(){};
  var skipFrom = (pageNumber * resultsPerPage) - resultsPerPage;
  var query = model.find(q).skip(skipFrom).limit(resultsPerPage);
  if(s){
  	query = query.sort(s);
  }
  query.exec(function(error, results) {
    if (error) {
      callback(error, null, null);
    } else {
      model.count(q, function(error, count) {
        if (error) {
          callback(error, null, null);
        } else {
          var pageCount = Math.ceil(count / resultsPerPage);
          if (pageCount == 0) {
            pageCount = 1;
          };
          callback(null, pageCount, results);
        };
      });
    };
  });
};
exports.paginate = mongoose.model.paginate;