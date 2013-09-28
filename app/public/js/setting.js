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
    $("table.project-manage-table td").not("td.readonly").on("dblclick",function(){
      //- alert("hello");
      var _self = $(this),
          editShow = _self.find(".editable"),
          editInput = _self.find(".editinput");
      
      if(_self.hasClass('td-editing')){ //- 打开编辑时
        var returnHtml = editInput.val();
        editShow.html(returnHtml).show();
        editInput.remove();
        _self.removeClass("td-editing");
        ajaxUpdate(_self);
      }else{                            //- 未编辑时
        var editShowHtml = editShow.html();
        var editInputHtml = '<input type="txt" class="m-input editinput" value="'+ editShowHtml +'" />';
        editShow.hide();
        _self.prepend(editInputHtml);
        _self.addClass("td-editing");
      }
    })

    //- showAjaxCallbackMsg ------------------------
    function showAjaxCallbackMsg( msg ){
      var $ajaxCallbackMsg = $("#ajaxCallbackMsg");
          $ajaxCallbackMsg.html(msg).addClass('msg-show');
        setTimeout(function(){$ajaxCallbackMsg.removeClass('msg-show')},2000)
    }


    //- AJAX更新表单内容 ------------------------
    function ajaxUpdate(e){
      if(e){
        var dbCollection = "Project",
            _id = e.parent("tr").find("span[data-name='_id']").html(),
            fieldName = e.find(".editable").attr("data-name"),
            fieldValue = e.find(".editableval").val() || e.find(".editable").html(),
            postAjaxUrl = "/comm-ajaxUpdate?dbCollection="+dbCollection+"&id="+_id+"&fieldName="+fieldName+"&fieldValue="+fieldValue;
      }
      console.log('postAjaxUrl :' + postAjaxUrl);
      $.ajax({
        type: "POST",
        url: postAjaxUrl
      }).done(function( msg ) {
        showAjaxCallbackMsg(msg);
      }).fail(function(jqXHR, textStatus) {
        alert( "Request failed: " + textStatus );
      });

    }

    //- select.editinput 回车事件 -------------
    $("table.m-table-data").delegate("input.editinput","keydown",function(e){
      var key = e.which;
      if (key == 13) {
        $(this).parent().trigger('dblclick');
      }
    })

  }


  $(initDomReady);
})()