// Setting all func
(function(){

  //- 初始化 ------------------------------------------------------------------
  function initDomReady(){
    //- current nav 
    $(".nav-ul li").eq(3).addClass("current");

    // submint func
    $("#addProjectForm").submit(function(){
        var addProjectName = $("#addProjectName").val();
        console.log(addProjectName);
        if(addProjectName !=""){
          return true;
        }else{
          alert("项目名不能为空");
          return false;
        }
    })

    //- Click to Edit ------------------------
    $("table.project-manage-table td,table.staff-manage-table td").not("td.readonly").on("dblclick",function(){
      // alert("hello");
      var _self = $(this),
          editShow = _self.find(".editable"),
          editInput = _self.find(".editinput"),
          dbCollection = _self.parents("table").attr("data-collection");
       // console.log(dbCollection);

      if(_self.hasClass('td-editing')){ //- 打开编辑时
        if(editShow.attr("data-name") =="role" ){ return false }
        var returnHtml = editInput.val();
        editShow.html(returnHtml).show();
        editInput.remove();
        _self.removeClass("td-editing");
        // 调用 ajax-update.js 的update方法;
        
        // 拼装准备ajax发送的数据
        var recordId = _self.parent("tr").find("span[data-name='_id']").html(),
            fieldName = _self.find(".editable").attr("data-name"),
            fieldValue = _self.find(".editable").html();
        var postData = {};
            postData.id = recordId,
            postData.dbCollection = dbCollection,
            postData[fieldName] = fieldValue;
        // 数据送ajax保存
        appAjax.updateSet(postData);
      }else{                            //- 未编辑时
        var editShowHtml = editShow.html();
        if(editShow.attr("data-name") =="role" ){
          var staffRoleSelectBox = $("#staffRoleSelectBox").html();
          var editInputHtml = '<div class="select-div editinput">'+staffRoleSelectBox+'</div>';
        }else{
          var editInputHtml = '<input type="txt" class="m-input editinput" value="'+ editShowHtml +'" />';
        }

        editShow.hide();
        _self.prepend(editInputHtml);
        _self.addClass("td-editing");
        _self.find(".editinput").focus();
      }
    })

    //- Role Select Func
    $("div.system-settings-box").delegate("select.main-select","change",function(){
    // $("#staffRoles").bind("change",function(){
      var n = parseInt($(this).val()),
          $selectDiv = $(this).parents(".select-div");
      $("select.sub-select").hide();
      if ( n==1 ){
        $selectDiv.find('select.sub-select-project').show();
        $selectDiv.find('select.sub-select-group').val(0);
      }else{
        $selectDiv.find('select.sub-select-group').show();
        $selectDiv.find('select.sub-select-project').val(0);
      }
    })

    //- .staff-role-change-button Func
    $("div.system-settings-box").delegate(".staff-role-change-button","click",function(){
      var $staffRolesTd = $(this).parents(".staffRoles");
      var postData = {};
          postData.id = $staffRolesTd.parent("tr").find("span[data-name='_id']").html(),
          postData.dbCollection = $staffRolesTd.parents("table").attr("data-collection");

      $staffRolesTd.find("select").each(function(index){
        var selectVal = $(this).val(),
            selectName = $(this).attr("name");
        $staffRolesTd.find("input[data-name="+selectName+"]").val(selectVal);
        postData[selectName] = selectVal;
      })
      console.log(postData);
      // 判断是否有选漏
      if (postData.roles == 0){
        alert("请选择角色")
      } else if( postData.roles == 1 & postData.project == 0 ){
        alert("请选择所负责的项目")
      } else if( postData.roles == 2 & postData.group == 0 ){
        alert("请选择组别")
      } else if( postData.roles == 3 & postData.group == 0 ){
        alert("请选择组别")
      }else{
        appAjax.updateSet(postData);


      }


    })


  }


  $(initDomReady);
})()