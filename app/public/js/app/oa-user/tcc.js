var Tcc = window.Tcc = {};
Tcc.base = 'http://top.oa.com/';
Tcc.host = 'top.oa.com';
//try{document.domain = 'oa.com';}catch(e){}
// jQuery.extend({
//     getScriptEx: function(jsurl, fCallback) {
//         var head = document.getElementsByTagName("head")[0];
//         var script = document.createElement("script");
//         script.src = jsurl;
//         script.charset = "utf-8";

//         // Handle Script loading
//         var done = false;

//         // Attach handlers for all browsers
//         script.onload = script.onreadystatechange = function() {
//             if (!done && (!this.readyState ||
//                 this.readyState == "loaded" || this.readyState == "complete")) {
//                 done = true;
//                 fCallback();
//                 head.removeChild(script);
//             }
//         };

//         head.appendChild(script);
//     }
// });

Tcc.UserChooser = function(args) {
    args.choosertype = args.choosertype || 1;
    args.inputType = args.inputType || 1;
    this.initUserChooser(args);
};


Tcc.UserChooser.prototype = {
    //init a user chooser by given id
    initUserChooser: function(args) {
        var value = args.value ? args.value : '';
        var size = args.size ? args.size : '';
        var user_chooser_class = args.user_chooser_class ? args.user_chooser_class : 'txt-user-chooser';
        var tempStr = '';
        tempStr += '<input type="hidden" id="' + args.id + '" value="' + value + '" userchooser="true" name="' + args.name + '"/>';
        if (args.data_source_url) {
            //support user define data source url --joeyue
            if (args.inputType == 1) {
                tempStr += '<input type="text" id="' + args.id + 'Value" onfocus="_tcc_write_userscript(\'' + args.id + '\', \'' + args.choosertype + '\', \'' + args.data_source_url + '\', \'' + args.data_source_url_params + '\');" autocomplete="off" value="' + value + '" size="' + size + '" class="' + user_chooser_class + '" />';
            } else if (args.inputType == 2) {
                tempStr += '<textarea id="' + args.id + 'Value" onfocus="_tcc_write_userscript(\'' + args.id + '\', \'' + args.choosertype + '\', \'' + args.data_source_url + '\', \'' + args.data_source_url_params + '\');" autocomplete="off" size="' + size + '" class="' + user_chooser_class + '">' + value + '</textarea>';
            }
        } else if (args.inputType == 1) {
            tempStr += '<input type="text" id="' + args.id + 'Value" onfocus="_tcc_write_userscript(\'' + args.id + '\', \'' + args.choosertype + '\');" autocomplete="off" value="' + value + '" size="' + size + '" class="' + user_chooser_class + '" />';
        } else if (args.inputType == 2) {
            tempStr += '<textarea id="' + args.id + 'Value" onfocus="_tcc_write_userscript(\'' + args.id + '\', \'' + args.choosertype + '\');" autocomplete="off" size="' + size + '" class="' + user_chooser_class + '">' + value + '</textarea>';
        }
        if (args.c) {
            $('.' + args.c).append(tempStr);
        } else {
            document.write(tempStr);
        }
    }
};

function _tcc_write_userscript(clientid, choosertype) {
    var sign = [0, 0];
    var ctl = $("#" + clientid + "Value");
    var tmp_ctl_val = '';
    tmp_ctl_val = ctl.val();
    if (typeof(Actb) == 'undefined') {
        disableCtl();
        $.getScript('/js/app/oa-user/userchooser.js', function() {
            sign[0] = 1;
            initChooser();
        });
    } else {
        sign[0] = 1;
    }
    // console.log("ee");

    var chooserdata = 'users';
    switch (choosertype) {
        case '3':
            chooserdata = 'usersandadgroups';
            break;
        case '2':
            chooserdata = 'adgroups';
            break;
        default:
            chooserdata = 'users';
            break;
    }

    if (typeof(eval('window._arr' + chooserdata)) == 'undefined') {
        disableCtl();
        if (arguments.length < 3) {
            // 获取OA的用户名列表
            $.getScript(Tcc.base + 'js/' + chooserdata + '.js', function() {
            // $.getScript('/js/app/oa-user/' + chooserdata + '.js', function() {
                sign[1] = 1;
                initChooser();
            });
        } else {
            //use user data source
            var data_source_url = arguments[2];
            var data_source_url_params = arguments[3] ? arguments[3] : '';
            $.getScriptEx(data_source_url + 'js/' + chooserdata + '.js' + data_source_url_params, function() {
                sign[1] = 1;
                initChooser();
            });
        }
    } else {
        sign[1] = 1;
    }

    if (sign[0] && sign[1]) {
        initChooser();
    }

    function initChooser() {
        if (!(sign[0] && sign[1]) || ctl.attr('init')) return;
        setChooser(eval('window._arr' + chooserdata), document.getElementById(clientid));
        sign[1] = 1;
        enableCtl();
    }


    function disableCtl() {
        if (ctl.attr('init') != 1) {
            ctl.val('loading...');
            if (-[1, ]) {
                //not IE
                ctl.css('color', '#9E9E9E');
                ctl.attr('readonly', true);
            } else {
                //IE
                ctl.attr('disabled', true);
            }
        }
    }

    function enableCtl() {
        if (sign[0] && sign[1]) {
            ctl.attr('init', 1);
            ctl.val(tmp_ctl_val);
            if (-[1, ]) {
                //not IE
                ctl.attr('readonly', false);
                ctl.css('color', '#000000');
            } else {
                //IE
                ctl.attr('disabled', false);
            }

            ctl.focus();
        }
    }
}
function bbdd(){
    console.log("bbdd");

}