// User all func
var appUser = (function(){
  //- 初始化 ------------------------------------------------------------------
  function initDomReady(){
    checkUserBrower();
    getUserRoles();
  };

  //- 获取用户的角色名 ----
  function getUserRoles(){
    var $userRolse = $("#userRoles"),
        staffName = $("#userRtx").html();
    if( $userRolse && staffName ){
      appAjax.getRoles($userRolse,staffName);
    }
  };

  //- 角色选择弹出层 - 显示 ----
  function showUserRolesSelect(){
    var $dialogSelectRoles = $(".dialog-select-roles");
    $dialogSelectRoles.addClass("md-show");
    bindUserRolesSelectEvent();    // 弹层事件绑定
  };

  //- 角色选择弹出层 - 事件绑定 ----
  function bindUserRolesSelectEvent(){
    var $userRolesPD = $("#userRolesPD"),
        $userRolesRB = $("#userRolesRB"),
        $userRolesSet = $("#userRolesSet"),
        $userProject = $("#userProject"),
        $userGroup = $("#userGroup"),
        $selectRolesForm = $("#selectRolesForm"),
        $userRtxName = $("#userRtxName"),
        $userCreateDate = $("#userCreateDate");

    $userRolesPD.on("change",function(){
      // console.log("userRolesPD selected");
      $userRolesSet.val(1);
      $userGroup.val(0);
      appAjax.getProjects($userProject);    //取project集合内容填入Select框
    })

    $userRolesRB.on("change",function(){
      // console.log("userRolesRB selected");
      $userRolesSet.val(3);
      $userProject.val(0);
    })

    $selectRolesForm.on("submit",function(){
      console.log("selectRolesForm sumbit");
      var n = $userRtxName.val(),
          d = $userCreateDate.val(),
          r = $userRolesSet.val(),
          p = $userProject.val(),
          g = $userGroup.val();
      // 非空检测
      if( r == 0 ){
        alert("请选择角色");
      }else if(r == 1 && p==0){
        alert("请选择您所负责的产品");
      }else if(r == 3 && g==0){
        alert("请选择组别");
      }else{
        console.log("选择正确！")
        // 组装数据并发送
        var postData={};
            postData.dbCollection = "Staff",
            postData.name = n,
            postData.roles = r,
            postData.project = p,
            postData.group = g,
            postData.create_date = d;
        console.dir(postData);
        var callbackFunc = function(){
          $(".user-select-roles-btn").html("<span class='red'>保存中...</span>");
          setTimeout(function(){location.reload()},2500)
        }
        appAjax.updateSet(postData,callbackFunc);
      }

      return false;
    })
  };


  // 升级浏览器提醒
  function checkUserBrower(){
    if ( $.browser.msie ) {
      var dialogHtml = '<div id="dialogMark" class="m-dialog-mark"></div><div class="m-dialog dialog-change-browser md-show"><div class="m-dialog-box"><div class="m-dialog-hd"><h3>温馨提示</h3><a class="close" href="javascript:;" onclick="this.parentNode.parentNode.style.display=\'none\';document.getElementById(\'dialogMark\').style.display=\'none\'">x</a></div><div class="m-dialog-bd"><div class="change-browser"><p>您的浏览器版本过低，为了得到更好的交互及视觉体验，且推动浏览器的W3C标准，本站强烈建议你使用<a href="http://www.google.cn/intl/zh-CN/chrome/browser/index.html#eula">Google Chrome</a>或安装/使用下列新版本浏览器,在此感激你为推动互联网作出贡献。</p><ul class="change-browser-list"><li><a href="http://www.google.cn/intl/zh-CN/chrome/browser/index.html#eula" title="Chrome" class="icon-chrome">Chrome</a></li><li><a href="http://download.firefox.com.cn/releases/partners/baidu/webins3.0/zh-CN/Firefox-setup.exe" title="Firefox" class="icon-firefox">Firefox</a></li><li><a href="http://ftp-idc.pconline.com.cn/8bb162ac18c3f22e6482d6699ad312de/pub/download/201010/SafariSetup.exe" title="Safari" class="icon-safari">Safari</a></li><li><a href="http://get4.opera.com/pub/opera/win/1212/int/Opera_1212_int_Setup.exe" title="Opera" class="icon-opera">Opera</a></li></ul></div></div></div></div>';
      $("body").append(dialogHtml);
    }
  }

  /* 供闭包外部使用的方法
  -------------------------------------*/
  return{
    initDomReady : function(){ initDomReady() },
    getUserRoles : function(){ getUserRoles() },
    showUserRolesSelect : function(){ showUserRolesSelect() },
    bindUserRolesSelectEvent : function(){ bindUserRolesSelectEvent() }
  }

})()

appUser.initDomReady();
