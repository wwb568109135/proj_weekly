// Task all func
(function(){
  //- 具体更新操作(未完成)
  function checkAndUpdate(){
    var tds = $("table.m-table-data td.td-editing");
    //- console.log(tds.length);
    if (tds.length>0){

    }
  }

  //- 根据当前td,反馈回编辑代码，
  function callEditInputHtml(o,s){
    var cbVal = s || "";
    if(o.attr("data-name") == "status" ){
      //- 设置需求状态时反馈回的HTML
      var cbHtml = '';
          cbHtml += '<select class="editinput" name="editStatus">';
          //- cbHtml += '<option value="' + cbVal +'">' + cbVal +'</option>';
          cbHtml += '<option value="0">排期中</option>';
          cbHtml += '<option value="1">重构中</option>';
          cbHtml += '<option value="2">联调中</option>';
          cbHtml += '<option value="3">已上线</option>';
          cbHtml += '</select>';
    }else if(o.attr("data-name") == "direction" ){
      // - 设置其它说明时反馈回的HTML
      var cbHtml = $("#directionSelectDiv").html();

    }else if(o.attr("data-name") == "online_date" || o.attr("data-name") == "rb_star_date" || o.attr("data-name") == "rb_end_date"){
      //- 设置日期input 反馈回的HTML
      var cbHtml = '<input type="txt" class="m-input date-picker editinput" value="'+ cbVal +'" />';
    }else if(o.attr("data-name") == "pp"){
      var randomNum = Math.floor((Math.random()*10000)),
          inputId = "pp" + randomNum + "Value",
          inputId2 = "pp" + randomNum;

      var cbHtml = '<input id="'+ inputId +'" type="txt" class="m-input editinput" value="'+ cbVal +'" onfocus="_tcc_write_userscript(this.id.replace(\'Value\',\'\'), \'1\');" />';
          cbHtml+= '<input id='+ inputId2 +' type="hidden" value="" class="editinput" userchooser="true" />';
      console.log(cbHtml);
    }else{
      //- 设置其它表单项时反馈回的HTML
      var cbHtml = '<input type="txt" class="m-input editinput" value="'+ cbVal +'" />';
    }
    return cbHtml;
  }

  //- 取回暂存的.editinput的值，因为有可能是select,要做下数值处理
  function callEditInputVal(o){
    if (!o) { return false }
    if(o.attr("name") == "editStatus"){
      //- 需求状态的Select框时，设定数组，取回相对应的值；
      var statusText = ["排期中", "重构中", "联调中", "已上线"],
          returnVal = statusText[o.val()];
    }else{
      //- 正常input时，直接取回value值
      var returnVal = o.val();
    }
    return returnVal;
  }
  

  // - 日历插件初始化代码(含需求数据获取展示、拖动后AJAX保存)
  function calendarInit(){
    
    // 把projectName全部取出来赋在一个变量里
    var projectName = {};
    $.ajax({
      type: "POST",
      url: "/comm-ajaxGetProjects"
    }).done(function( pj ) {
      if(pj){
        // projectName = pj;
        // 取回的数组处理
        $.each(pj,function(i){
          var a = pj[i].id,
              b = pj[i].name;
          projectName[a] = b;
        })
        // console.dir(projectName);
      }
    }).fail(function(jqXHR, textStatus) {
      projectName = "";
    });



    // 通过#calendar上的记录，组合不同的 calendar请求地址
    var roles = $("#calendar").attr("data-roles"),
        filterStaff = $("#calendar").attr("data-staff"),
        ajaxUrl = "/task/callJSON?roles="+roles+'&filterStaff='+filterStaff;

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
            left: 'prev,next today',
            center: 'title',
            right: 'basicWeek,month'
          },
          editable: false,
          events: ev
        })
      }else if (roles == 3){
        // 【重构角色日历】日历读取日期插件本身的加载配置代码 ----------------
        $('#calendar').fullCalendar({
          header: {
            left: 'prev,next today',
            center: 'title',
            right: 'basicWeek,month'
          },
          editable: true,
          events: ev,
          // 日期块拖动后 ajax保存
          eventDrop: function (event, dayDelta, minuteDelta) {
            var postAjaxUrl = "/task/ajaxUpdateCalendar?id="+event.id+"&start="+event.start+"&end="+event.end;
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
            var postAjaxUrl = "/task/ajaxUpdateCalendar?id="+event.id+"&start="+event.start+"&end="+event.end;
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

  // - 管理视频筛选框先中上次的晒选记录
  function advFilterSelectActive(){
    var roles = $("#calendar").attr("data-roles");

    if(roles==2){
      $("#advFilterProject, #advFilterStatus, #advFilterPriority").each(function(index){
        oData = $(this).attr("data-o");

        filterOption = $(this).find("option");
        filterOption.each(function(){
          var _self = $(this);
          // console.log(_self.val());
          if(_self.val() == oData){
            _self.attr("selected","selected");
          }
        })
      })
    }
  }

  //- 初始化
  function initDomReady(){
    // current nav
   $(".nav-ul li").eq(1).addClass("current");

    //- Click to Edit ------------------------
    $("table.m-table-data td").not("td.readonly").on("dblclick",function(){
      //- alert("hello");
      var _self = $(this),
          editShow = _self.find(".editable"),
          editInput = _self.find(".editinput"),
          dbCollection = _self.parents("table").attr("data-collection");
      
      checkAndUpdate(); //- 检测是否存在其它编辑中的表单项

      if(_self.hasClass('td-editing')){ //- 打开编辑时
        var returnHtml = callEditInputVal(editInput);
        editShow.html(returnHtml).show();
        editInput.remove();
        _self.removeClass("td-editing");
        // ajaxUpdate(_self);

        // 拼装准备ajax发送的数据
        var recordId = _self.parent("tr").find("span[data-name='_id']").html(),
            fieldName = _self.find(".editable").attr("data-name"),
            fieldValue = _self.find(".editableval").val() || _self.find(".editable").html();
        var postData = {};
            postData.id = recordId,
            postData.dbCollection = dbCollection,
            postData[fieldName] = fieldValue;
        // 数据送ajax保存
        appAjax.updateSet(postData);

      }else{                            //- 未编辑时
        var editShowHtml = editShow.html();
        var editInputHtml = callEditInputHtml(editShow,editShowHtml);
        editShow.hide();
        _self.prepend(editInputHtml);
        //- 对有.date-picker的input 进行calendar激活        
        _self.find('.date-picker').datepicker({ dateFormat: "yy-mm-dd" });
        _self.find(".editinput").focus();
        _self.addClass("td-editing");
      }
    })

    
    //- select.task-filter-select 选择事件 -------------
    $("select.task-filter-select").on("change", function(){
        var param = $(this).val(),
            local = $(location).attr('href'),
            newlocal = local;
        var paramHas = local.indexOf("?"),
            statusPar = param.indexOf("status"),
            priorityPar = param.indexOf("priority");
        var regExp1 = /\?status=(\w+)?/,
            regExp2 = /\&status=(\w+)?/;
            regExp3 = /\?priority=(\w+)?/;
            regExp4 = /\&priority=(\w+)?/;

        // 1.先把 ?page= &page=干掉
        local = local.replace(/[\?\&]page[^&]+$/,"");
        console.log("local: "+local);

        // 2.重新修改所带参数，有点复杂，待优化
        if(paramHas =="-1"){          // 完全没参数，直接加上
          newlocal = local + "?" + param;
        }else if( statusPar!="-1" && regExp1.test(local)){  // 如果命中regExp1 用?status 替换
          // console.log("?status");
          newlocal = local.replace(regExp1,"?"+param);
        }else if(statusPar!="-1" &&regExp2.test(local)){    // 如果命中regExp2 用&status 替换
          // console.log("&status");
          newlocal = local.replace(regExp2,"&"+param);
        }else if(priorityPar!="-1" && regExp3.test(local)){ // 如果命中regExp3 用?priority 替换
          // console.log("?priority");
          newlocal = local.replace(regExp3,"?"+param);
        }else if(priorityPar!="-1" && regExp4.test(local)){ // 如果命中regExp4 用&priority 替换
          // console.log("&priority");
          newlocal = local.replace(regExp4,"&"+param);
        }else if(paramHas !="-1" && statusPar=="-1" ){      // 有参数，但不是status。
          newlocal = local + "&" + param;
        }else if(paramHas !="-1" && priorityPar=="-1" ){    // 有参数，但不是priority。
          newlocal = local + "&" + param;
        }
        console.log("newlocal: "+newlocal)
        $(location).attr('href',newlocal);

        /*
        local = local.replace(/[\?\&]status[^&]+/,"");
        local = local.replace(/[\?\&]priority[^&]+/,"");
        if(param){
          if(local.indexOf('?') == -1 ){
            param = "?" + param;
          }else{
            param = "&" + param;
          }
        }
        var newlocal = local+param;
        $(location).attr('href',newlocal);
        */
    })
    
    //- select.task-filter-select 当前选择位置处理 -------------
    var localSearch = $(location).attr('search'),
        localSearch = localSearch.replace(/\?/,"");
    // console.log(localSearch);
    if(localSearch){
      // console.log(localSearch);
      var $filterSelect = $("select.task-filter-select")

      var param = localSearch.split("&");
      // console.log(param);
      $.each(param,function(i){
        // console.log(param[i]);
        $filterSelect.find("option").each(function(){
          // console.log($(this).attr('value'));
          var v = $(this).attr('value');
          if ( v==param[i] ){
           $(this).attr('selected','selected')
          }
        })
        
      })

      
    }

    // 日历插件启动
    calendarInit();

    // 填充当前说明的下载框
    var $directionSelect = $("#directionSelect");
    if($directionSelect.length > 0 ){
      appAjax.getDirections($directionSelect);
    }

    // 填充#advFilterProject 下拉框里所有项目
    var $advFilterProject = $("#advFilterProject");
    if($advFilterProject.length > 0 ){
      // console.log("get Project")
      appAjax.getProjects($advFilterProject,advFilterSelectActive);
    }

    // 管理者筛选框记录
    // advFilterSelectActive();
  }
  $(initDomReady);

  /* 供闭包外部使用的方法
  -------------------------------------*/
  return{
    advFilterSelectActive : advFilterSelectActive
  }

})()