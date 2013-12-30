 // index page func
(function(){

  // - 日历插件初始化代码(含需求数据获取展示、拖动后AJAX保存)
  function calendarInit(){
    console.log("calendarInit");
    // 把projectName全部取出来赋在一个变量里
    var projectName = {};
    $.ajax({
      type: "POST",
      url: "/comm-ajaxGetProjects"
    }).done(function( pj ) {
      if(pj){
        // 取回的数组处理
        $.each(pj,function(i){
          var a = pj[i].id,
              b = pj[i].name;
          projectName[a] = b;
        })
        // console.dir(projectName);
        calendarInitFunc(projectName);   // 执行日历插件函数
      }
    }).fail(function(jqXHR, textStatus) {
      projectName = "";
    });
  }

  function calendarInitFunc(pj){
    // 通过#calendar上的记录，组合不同的 calendar请求地址
    var roles = $("#calendar").attr("data-roles"),
        filterStaff = $("#calendar").attr("data-staff"),
        ajaxUrl = "/task/callJSON?roles="+roles+'&filterStaff='+filterStaff;
        projectName = pj || "";

    // console.log("filterStaff: "+filterStaff);
    var arrayOfEvents = [];
    // AJAX的方式从service拉回 json数据并处理
    $.ajax({
      type: "POST",
      url: ajaxUrl
    }).done(function( msg ) {
      // 把获得的JSON拼成 calendar 需要的数据格式
      // console.dir(projectName);
      var ev = [];
      $.each(msg,function(i){
        var o = {};
        o.id = msg[i]._id;
        o.title = "【"+projectName[msg[i].type]+"】"+msg[i].title;
        o.url = "/task/" + msg[i]._id;
        // CP的颜色处理
        if (/CP;?/i.test(msg[i].pp) && msg[i].status != 3 ){
          o.className = "fc-label-cp"
        }
        // 进度100%的处理
        if (msg[i].status == 3 ){
          o.className = "fc-label-finish"
        }
        
        var oStart = msg[i].rb_star_date,
            oEnd = msg[i].rb_end_date;
        o.start = oStart ? oStart.replace(/T/, '').replace(/\..+/, '').substr(0,10) : null;
        o.end = oEnd ? oEnd.replace(/T/, '').replace(/\..+/, '').substr(0,10) : null;
        ev.push(o);
      })
      // console.log(ev);
      // console.log(roles);
      if(roles == 1 || roles == 2){
        // 【产品角色日历】日历读取日期插件本身的加载配置代码 ----------------
        $('#calendar').fullCalendar({
          header: {
            left: 'today',
            center: 'title',
            right: ''
          },
          editable: false,
          events: ev,
          defaultView:"basicWeek",
          contentHeight:"fixed",
        })
      }else if (roles == 3){
        // 【重构角色日历】日历读取日期插件本身的加载配置代码 ----------------
        $('#calendar').fullCalendar({
          header: {
            left: 'today',
            center: 'title',
            right: ''
          },
          editable: true,
          events: ev,
          defaultView:"basicWeek",
          contentHeight:"fixed",
          // 日期块拖动后 ajax保存
          eventDrop: function (event, dayDelta, minuteDelta) {
            if(!event.end){ event.end = event.start }
            var postAjaxUrl = "/task/ajaxUpdateCalendar?id="+event.id+"&start="+event.start+"&end="+event.end;
            // console.log(postAjaxUrl);
            $.ajax({
              type: "POST",
              url : postAjaxUrl
              // data: postData
            }).done(function( msg ) {
              appAjax.callbackMsg(msg);
            })
          },
          // 日期块修改结束时间长度后 ajax保存
          eventResize:function(event, dayDelta, minuteDelta){
            if(!event.end){ event.end = event.start }
            var postAjaxUrl = "/task/ajaxUpdateCalendar?id="+event.id+"&start="+event.start+"&end="+event.end;
            // console.log(postAjaxUrl);
            $.ajax({
              type: "POST",
              url : postAjaxUrl
            }).done(function( msg ) {
              appAjax.callbackMsg(msg);
            })
          }
        });
      }

    })
  }


  //- 初始化
  function initDomReady(){
    // current nav
    $(".nav-ul li").eq(0).addClass("current");

    // 日历插件启动
    calendarInit();
  }


  $(initDomReady);
})()