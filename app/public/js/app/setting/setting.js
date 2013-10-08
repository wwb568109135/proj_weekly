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
       console.log(dbCollection);

      if(_self.hasClass('td-editing')){ //- 打开编辑时
        var returnHtml = editInput.val();
        editShow.html(returnHtml).show();
        editInput.remove();
        _self.removeClass("td-editing");
        // 调用 ajax-update.js 的update方法;
        
        appAjax.update(_self,dbCollection);
      }else{                            //- 未编辑时
        var editShowHtml = editShow.html();
        var editInputHtml = '<input type="txt" class="m-input editinput" value="'+ editShowHtml +'" />';
        editShow.hide();
        _self.prepend(editInputHtml);
        _self.addClass("td-editing");
        _self.find(".editinput").focus();
      }
    })

    //- Role Select Func
    $("#staffRoles").bind("change",function(){
      var n = parseInt($(this).val());
      $("select.sub-select").hide();
      if ( n==1 ){
        $("select#staffProject").show();
      }else{
        $("select#staffGroup").show();
      }
    })

  }


  $(initDomReady);
})()