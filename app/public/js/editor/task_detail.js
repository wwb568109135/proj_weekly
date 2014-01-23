   /**
    * created by v_xhshen  
    * 2014-01-21
    */



   //评论/处理意见
    $.each($('.tdo-comment-ul li.tdo-comment-item'),function(){
      var commentcont = ($(this).find('textarea').val()+'').replace(/&lt;/g,'<');
      commentcont = commentcont.replace(/&gt;/g,'>');
      commentcont = commentcont.replace(/&amp;/g,'&');
      commentcont = commentcont.replace(/&quot;/g,'"');

      $(this).find('.tdo-comment-bd').html(commentcont);
    })

    
   //评论修改
    function comteditfun(obj){
        var vthis = $(obj)
        if(vthis.attr('data-able') == '1'){
          vthis.attr('data-able','0');
          var $this = vthis;
          var $li = vthis.parent().parent().parent();
          var $id = vthis.siblings('.idnum').text();
          var $form = $li.find('form');
          var oldhtml = $form.html();

          $li.find('.tdo-comment-bd').hide();
          $li.find('.subbtn').show();

          $li.find('.cancelbtn').show().click(function(){
             $form.html(oldhtml);
             $li.find('.tdo-comment-bd').show();
             $this.attr('data-able','1');
          });
        

          $form.submit(function () {
            var nid = 'editor-'+$id;
            var viframe = document.getElementById(nid).getElementsByTagName('iframe')[0];

            var iframeBody = viframe.contentWindow.document.getElementsByTagName('body')[0];
            

            var postData = {};
            postData.id = $(location).attr("pathname").replace("/task/","");
            postData.type = "commentsedit";
            postData.id2 = $id;
            postData.comtcontent = iframeBody.innerHTML;
            postData.pageCur = ($('.m-page-pn-current')) ? $('.m-page-pn-current').text() : 1;

            var callBackFunction = function(datas){
               //location.reload(true);
              var arrL=datas.cometarr.length;
              var htmlstr = '';
              var pageHtml = '';
              var comul = $('#commentListUl');

              for(var i=0; i<arrL; i++){
                var objnow = datas.cometarr[i].commt;
                var commentname = objnow.commentname;
                var commentrole = objnow.commentrole;
                var commentid = objnow._id;
                var nowtimestr2= datas.cometarr[i].timestr;
                var commentcon = objnow.commentcontent;

                htmlstr += "<li class='tdo-comment-item'>"+
                              "<div class='tdo-comment-hd'>"+
                                  "<h5>" + commentname + "<span class='role'>(" + commentrole + ")</span>" +"</h5>"+
                                  "<cite>"+ nowtimestr2 +"</cite>"+
                                  "<span class='edit'>"+
                                    "<span class='idnum'>"+ commentid + "</span>"+
                                    "<a class='comtedit' data-able='1' onclick='comteditfun(this)' href='javascript:'>编辑</a>"+
                                    "<a class='comtdel' href='javascript:' onclick='comsdelfun(this)'>删除</a>"+
                                  "</span>"+
                              "</div>"+
                              "<form>"+
                                  "<textarea class='hidetextarea' name='data[textarea]' id='"+ commentid +"'>" + commentcon + "</textarea>"+
                                  "<input type='submit' class='m-btn subbtn btn-skin-1' value='确认修改'>"+
                                  "<a class='m-btn cancelbtn btn-skin-1'>取消</a>"+
                              "</form>"+
                              "<div class='tdo-comment-bd'>"+ commentcon + "</div>"+
                            "</li>";
              }
              
              comul.html(htmlstr);
              
              var pages = Math.ceil((datas.comLength)/5);
              var pageCur = datas.pageCurnum;
              if(pages >1){
                      pageHtml += "<div class='m-page-total'><span class='m-page-total-page'>共" + pages + "页</span></div>"+
                                    "<div class='m-page-pn'>"+
                                      "<a class='m-page-pn_disabled' href='javascript:pagenumfun(1);'>首页</a>";
                      if (pageCur<2){
                          pageHtml += "<span class='m-page-pn-current'>"+pageCur+"</span>";
                        if(pageCur<pages){
                          pageHtml += "<a href='javascript:pagenumfun(" + (pageCur+1) + ");'>" + (pageCur+1) + "</a>";
                          if((pages - pageCur) > 1){
                          pageHtml += "<a href='javascript:pagenumfun(" + (pageCur+2) + ");'>" + (pageCur+2) + "</a>";
                          }
                          if((pages - pageCur) > 2){
                          pageHtml += "<a href='javascript:pagenumfun(" + (pageCur+3) + ");'>" + (pageCur+3) + "</a>";
                          }

                          pageHtml += "<span class='m-page-pn-ellipsis'>...</span>";
                        }
                      } else{
                        if(pageCur >3){
                          pageHtml += "<a href='javascript:pagenumfun(" + (pageCur-3) + ");'>" + (pageCur-3) + "</a>";
                        }
                        if(pageCur >2){
                          pageHtml += "<a href='javascript:pagenumfun(" + (pageCur-2) + ");'>" + (pageCur-2) + "</a>";
                        }
                          pageHtml += "<a href='javascript:pagenumfun(" + (pageCur-1) + ");'>" + (pageCur-1) + "</a>";
                          pageHtml += "<span class='m-page-pn-current'>" + pageCur + "</span>";
                      if(pageCur < pages){
                          pageHtml += "<a href='javascript:pagenumfun(" + (pageCur+1) + ");'>" + (pageCur+1) + "</a>";
                        if((pages - pageCur) > 1){
                          pageHtml += "<a href='javascript:pagenumfun(" + (pageCur+2) + ");'>" + (pageCur+2) + "</a>";
                        }
                        if((pages - pageCur) > 2){
                          pageHtml += "<a href='javascript:pagenumfun(" + (pageCur+3) + ");'>" + (pageCur+3) + "</a>";
                        }
                        pageHtml += "<span class='m-page-pn-ellipsis'>...</span>";
                      }
                      }
                        pageHtml += "<a href='javascript:pagenumfun(" + pages + ");'>尾页</a></div>";

                      $('#pagenumbar').html(pageHtml);
                }
            }


            // 数据送ajax删除数据库中记录
            appAjax.commentUpdateEdit(postData,callBackFunction);

            return false;
          });

          var myeditor3 = TFL.editor({"id":$id,"height":"128px","width":"95%","name":"data[textarea]","showRelativePath":false}); 
        }
    }
    

    // 分页码
    function pagenumfun(pagenum){
        var postData = {};
            postData.id = $(location).attr("pathname").replace("/task/",""); 
            postData.pagenum = pagenum;   
        
        var callBackFunction = function(datas){
              var arrL=datas.cometarr.length;
              var htmlstr = '';
              var pageHtml = '';
              var comul = $('#commentListUl');

              for(var i=0; i<arrL; i++){
                var objnow = datas.cometarr[i].commt;
                var commentname = objnow.commentname;
                var commentrole = objnow.commentrole;
                var commentid = objnow._id;
                var nowtimestr2= datas.cometarr[i].timestr;
                var commentcon = objnow.commentcontent;

                htmlstr += "<li class='tdo-comment-item'>"+
                              "<div class='tdo-comment-hd'>"+
                                  "<h5>" + commentname + "<span class='role'>(" + commentrole + ")</span>" +"</h5>"+
                                  "<cite>"+ nowtimestr2 +"</cite>"+
                                  "<span class='edit'>"+
                                    "<span class='idnum'>"+ commentid + "</span>"+
                                    "<a class='comtedit' data-able='1' onclick='comteditfun(this)' href='javascript:'>编辑</a>"+
                                    "<a class='comtdel' href='javascript:' onclick='comsdelfun(this)'>删除</a>"+
                                  "</span>"+
                              "</div>"+
                              "<form>"+
                                  "<textarea class='hidetextarea' name='data[textarea]' id='"+ commentid +"'>" + commentcon + "</textarea>"+
                                  "<input type='submit' class='m-btn subbtn btn-skin-1' value='确认修改'>"+
                                  "<a class='m-btn cancelbtn btn-skin-1'>取消</a>"+
                              "</form>"+
                              "<div class='tdo-comment-bd'>"+ commentcon + "</div>"+
                            "</li>";
              }
              
              comul.html(htmlstr);
              
              var pages = Math.ceil((datas.comLength)/5);
              var pageCur = pagenum;
              if(pages >1){
                      pageHtml += "<div class='m-page-total'><span class='m-page-total-page'>共" + pages + "页</span></div>"+
                                    "<div class='m-page-pn'>"+
                                      "<a class='m-page-pn_disabled' href='javascript:pagenumfun(1);'>首页</a>";
                      if (pageCur<2){
                          pageHtml += "<span class='m-page-pn-current'>"+pageCur+"</span>";
                        if(pageCur<pages){
                          pageHtml += "<a href='javascript:pagenumfun(" + (pageCur+1) + ");'>" + (pageCur+1) + "</a>";
                          if((pages - pageCur) > 1){
                          pageHtml += "<a href='javascript:pagenumfun(" + (pageCur+2) + ");'>" + (pageCur+2) + "</a>";
                          }
                          if((pages - pageCur) > 2){
                          pageHtml += "<a href='javascript:pagenumfun(" + (pageCur+3) + ");'>" + (pageCur+3) + "</a>";
                          }

                          pageHtml += "<span class='m-page-pn-ellipsis'>...</span>";
                        }
                      } else{
                        if(pageCur >3){
                          pageHtml += "<a href='javascript:pagenumfun(" + (pageCur-3) + ");'>" + (pageCur-3) + "</a>";
                        }
                        if(pageCur >2){
                          pageHtml += "<a href='javascript:pagenumfun(" + (pageCur-2) + ");'>" + (pageCur-2) + "</a>";
                        }
                          pageHtml += "<a href='javascript:pagenumfun(" + (pageCur-1) + ");'>" + (pageCur-1) + "</a>";
                          pageHtml += "<span class='m-page-pn-current'>" + pageCur + "</span>";
                      if(pageCur < pages){
                          pageHtml += "<a href='javascript:pagenumfun(" + (pageCur+1) + ");'>" + (pageCur+1) + "</a>";
                        if((pages - pageCur) > 1){
                          pageHtml += "<a href='javascript:pagenumfun(" + (pageCur+2) + ");'>" + (pageCur+2) + "</a>";
                        }
                        if((pages - pageCur) > 2){
                          pageHtml += "<a href='javascript:pagenumfun(" + (pageCur+3) + ");'>" + (pageCur+3) + "</a>";
                        }
                        pageHtml += "<span class='m-page-pn-ellipsis'>...</span>";
                      }
                      }
                        pageHtml += "<a href='javascript:pagenumfun(" + pages + ");'>尾页</a></div>";

                      $('#pagenumbar').html(pageHtml);
                }
        }

        appAjax.ajaxpageShow(postData,callBackFunction);
    }
    

    //删除评论
    function comsdelfun(thisobj){
        var vthis = $(thisobj)
        var postData = {};
            postData.id = $(location).attr("pathname").replace("/task/","");
            postData.type = "comments";
            postData.id2 = vthis.siblings('.idnum').text();          
            postData.pageCur = ($('.m-page-pn-current')) ? $('.m-page-pn-current').text() : 1;


        var callBackFunction = function(datas){
              var arrL=datas.cometarr.length;
              var htmlstr = '';
              var pageHtml = '';
              var comul = $('#commentListUl');

              for(var i=0; i<arrL; i++){
                var objnow = datas.cometarr[i].commt;
                var commentname = objnow.commentname;
                var commentrole = objnow.commentrole;
                var commentid = objnow._id;
                var nowtimestr2= datas.cometarr[i].timestr;
                var commentcon = objnow.commentcontent;

                htmlstr += "<li class='tdo-comment-item'>"+
                              "<div class='tdo-comment-hd'>"+
                                  "<h5>" + commentname + "<span class='role'>(" + commentrole + ")</span>" +"</h5>"+
                                  "<cite>"+ nowtimestr2 +"</cite>"+
                                  "<span class='edit'>"+
                                    "<span class='idnum'>"+ commentid + "</span>"+
                                    "<a class='comtedit' data-able='1' onclick='comteditfun(this)' href='javascript:'>编辑</a>"+
                                    "<a class='comtdel' href='javascript:' onclick='comsdelfun(this)'>删除</a>"+
                                  "</span>"+
                              "</div>"+
                              "<form>"+
                                  "<textarea class='hidetextarea' name='data[textarea]' id='"+ commentid +"'>" + commentcon + "</textarea>"+
                                  "<input type='submit' class='m-btn subbtn btn-skin-1' value='确认修改'>"+
                                  "<a class='m-btn cancelbtn btn-skin-1'>取消</a>"+
                              "</form>"+
                              "<div class='tdo-comment-bd'>"+ commentcon + "</div>"+
                            "</li>";
              }
              
              comul.html(htmlstr);
              
              var pages = Math.ceil((datas.comLength)/5);
              var pageCur = datas.pageCurnum;
              if(pages >1){
                      pageHtml += "<div class='m-page-total'><span class='m-page-total-page'>共" + pages + "页</span></div>"+
                                    "<div class='m-page-pn'>"+
                                      "<a class='m-page-pn_disabled' href='javascript:pagenumfun(1);'>首页</a>";
                      if (pageCur<2){
                          pageHtml += "<span class='m-page-pn-current'>"+pageCur+"</span>";
                        if(pageCur<pages){
                          pageHtml += "<a href='javascript:pagenumfun(" + (pageCur+1) + ");'>" + (pageCur+1) + "</a>";
                          if((pages - pageCur) > 1){
                          pageHtml += "<a href='javascript:pagenumfun(" + (pageCur+2) + ");'>" + (pageCur+2) + "</a>";
                          }
                          if((pages - pageCur) > 2){
                          pageHtml += "<a href='javascript:pagenumfun(" + (pageCur+3) + ");'>" + (pageCur+3) + "</a>";
                          }

                          pageHtml += "<span class='m-page-pn-ellipsis'>...</span>";
                        }
                      } else{
                        if(pageCur >3){
                          pageHtml += "<a href='javascript:pagenumfun(" + (pageCur-3) + ");'>" + (pageCur-3) + "</a>";
                        }
                        if(pageCur >2){
                          pageHtml += "<a href='javascript:pagenumfun(" + (pageCur-2) + ");'>" + (pageCur-2) + "</a>";
                        }
                          pageHtml += "<a href='javascript:pagenumfun(" + (pageCur-1) + ");'>" + (pageCur-1) + "</a>";
                          pageHtml += "<span class='m-page-pn-current'>" + pageCur + "</span>";
                      if(pageCur < pages){
                          pageHtml += "<a href='javascript:pagenumfun(" + (pageCur+1) + ");'>" + (pageCur+1) + "</a>";
                        if((pages - pageCur) > 1){
                          pageHtml += "<a href='javascript:pagenumfun(" + (pageCur+2) + ");'>" + (pageCur+2) + "</a>";
                        }
                        if((pages - pageCur) > 2){
                          pageHtml += "<a href='javascript:pagenumfun(" + (pageCur+3) + ");'>" + (pageCur+3) + "</a>";
                        }
                        pageHtml += "<span class='m-page-pn-ellipsis'>...</span>";
                      }
                      }
                        pageHtml += "<a href='javascript:pagenumfun(" + pages + ");'>尾页</a></div>";

                      $('#pagenumbar').html(pageHtml);
                }
        }

        if(confirm('确认删除？')){
          // 数据送ajax删除数据库中记录
          appAjax.updateDel(postData,callBackFunction);
        }
    }


    //评分
    $('#taskVoteBtn').click(function(){
      $('.dialog-task-score').show();
    });
    
    $.each($('#task-score-form :radio'),function(key){
      $(this).change(function(){
        if($(this).attr('checked')){
          $('#task-score-form h4').eq(0).html('此需求已完,评分：<b>' + $(this).val() + '</b>分')
           .after($('<a class="m-btn btn-skin-4" id="resetscore" href="javascript:">重新打分</a>'));
          $('#task-score-form .score-list').hide();

          $('#task-score-form #resetscore').click(function(){
            $('#task-score-form .score-list').show();
            $('#task-score-form h4').eq(0).html('请您为本次需求服务评分');
            $(this).remove();
          });

          input.m-btn.btn-skin-4(type='reset', value='提交评分')
        }
      });
    })
    

    



    $('#task-score-form').submit(function(){
      var $radios = $('#task-score-form :radio:checked');
      if(!$radios.length){
        $('#task-score-form :submit').after($('<h4 id="noticeh4"><b>请您为本次需求服务评分后再提交</b></h4>'));
        var ttimeout = setTimeout(function(){$('#noticeh4').remove();},1500);
        return false;
      } else{
        $('#task-score-form h4').eq(1).text();
        return ture;
      }    
    });


    //评论    
    $('#commentarea').focus(function(){
      $(this).val('');
    });

    var myeditor2 = TFL.editor({"id":"commentarea","width":"65%","height":"128px","name":"task[content]","showRelativePath":false,"mode":1});  