// User all func
var appUser = (function(){
  //- 初始化 ------------------------------------------------------------------
  function initDomReady(){
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
          setTimeout(function(){location.reload()},2500)
        }
        appAjax.updateSet(postData,callbackFunc);
      }

      return false;
    })


  };


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
