var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var WeeklySchema = new Schema({
	// title: {type:String, required: true},
	// pages:{type:Number, defaults: 1},
	// pdm: String,
	// finished: {type:Boolean, defaults: false},
	// endTime: {type:Date}

	author: {type: String, requierd: true},			//需求创建者
	type: {type: String, requierd: true},			//所属项目
	priority: {type:Number, defaults: 0},			//优先级
	create_date: {type:Date},						//需求创建时间
	title: {type: String, requierd: true},			//需求标题
	focus: {type:Boolean, defaults: false},			//是否重点需求
	content: {type: String, requierd: false},		//需求内容
	attachment: {type: String, requierd: false},	//需求附件
	pages: {type: String, defaults: 1},				//页面数
	online_date: {type:Date},						//上线时间
	rb_star_date: {type:Date},						//重构开始时间
	rb_end_date: {type:Date},						//重构完成时间
	pp: {type: String, requierd: true},				//需求负责人员
	pm: {type: String, requierd: true},				//需求接口人
	status: {type: Number, defaults: 0},			//需求当前状态
	progress: {type: String, requierd: false},		//需求总进度
});

var opened = false;

mongoose.connection.on('open', function(ref) {
	opened = true;
});

mongoose.connection.on('error', function(err) {
	opened = false;
});

exports.Weekly = mongoose.model('Weekly', WeeklySchema);

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