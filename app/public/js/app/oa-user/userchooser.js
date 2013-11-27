//var _userChoosers = [];

function setChooser(ca, value_ctl) {
    var chooser = new Actb(ca, value_ctl);
    value_ctl._chooser = chooser;
    //_userChoosers.push(chooser);
}

function Actb(ca, value_ctl) {

    var actb_curr = null;

    /* ---- Public Variables ---- */
    this.actb_timeOut = -1; // Autocomplete Timeout in ms (-1: autocomplete never time out)
    this.actb_lim = 4; // Number of elements autocomplete can show (-1: no limit)
    this.actb_firstText = true; // should the auto complete be limited to the beginning of keyword?
    this.actb_mouse = true; // Enable Mouse Support
    this.actb_delimiter = new Array(';'); //new Array(';',',');  // Delimiter for multiple autocomplete. Set it to empty array for single autocomplete
    this.actb_startcheck = 1; // Show widget only after this number of characters is typed in.
    /* ---- Public Variables ---- */

    /* --- Styles --- */
    this.actb_bgColor = '#eeffee';
    this.actb_textColor = '#0000CC';
    this.actb_hColor = '#C4E4FF';
    this.actb_fFamily = '"Lucida Grande" , Tahoma, Verdana, Lucida, Arial , Tahoma, Verdana, Lucida, Arial, Helvetica, 宋体,sans-serif';
    this.actb_fSize = '12px';
    this.actb_hStyle = 'text-decoration:underline;font-weight="bold"';
    /* --- Styles --- */

    /* ---- Private Variables ---- */
    var actb_delimwords = new Array();
    var actb_cdelimword = 0;
    var actb_delimchar = new Array();
    var actb_display = false;
    var actb_pos = 0;
    var actb_total = 0;
    var actb_rangeu = 0;
    var actb_ranged = 0;
    var actb_bool = new Array();
    var actb_pre = 0;
    var actb_toid;
    var actb_tomake = false;
    var actb_getpre = "";
    var actb_mouse_on_list = 0; //mic: change default value to 0 for bug #691
    var actb_kwcount = 0;
    var actb_caretmove = false;
    var actb_keywords = new Array();
    /* ---- Private Variables---- */

    this.actb_keywords = ca;

    var actb_self = this;

    var actb_curr = "";
    this.actb_curr = $('#' + value_ctl.id + 'Value')[0];
    console.log(actb_curr)
    this.actb_curr.value_ctl = value_ctl;

    if (this.actb_curr) {
        $(this.actb_curr).focus(function() {
            this.actb_curr = $('#' + value_ctl.id + 'Value')[0];
            this.actb_curr.value_ctl = value_ctl;

            actb_setup(this.actb_curr);
        });
    }

    var keydown_handler = function(evt) {
        actb_checkkey(evt);
        console.log("key-down")
    };
    var blur_handler = function(evt) {
        actb_clear(evt);
    };
    var keypress_handler = function(evt) {
        actb_keypress(evt);
    }



        function actb_setup(curr_ctl) {
            this.actb_curr = curr_ctl;

            $(this.actb_curr).keydown(keydown_handler);
            $(this.actb_curr).blur(blur_handler);
            $(document).keypress(keypress_handler);
            if (this.actb_curr.createTextRange) {
                var range = this.actb_curr.createTextRange();
                range.collapse(false);
                range.select();
            }
            if (this.actb_curr.value.trim().length > 0 && this.actb_curr.value.lastIndexOf(';') != this.actb_curr.value.length - 1)
                this.actb_curr.value = this.actb_curr.value + ';';
        }

        function actb_clear(evt) {
            try {
                if (!evt) evt = event;
                $(this.actb_curr).unbind("keydown", keydown_handler);
                $(this.actb_curr).unbind("blur", blur_handler);
                $(document).unbind("keypress", keypress_handler);
                setTimeout(function() {
                    actb_removedisp();
                }, 100);
            } catch (e) {}
            actb_calcValues();
        }

        function actb_calcValues() { //$('#TicketSummary').val(new Date());
            this.actb_curr.value = RTrim(this.actb_curr.value, ';');
            var arr = this.actb_curr.value.replace(/\s/g, '').split(';');
            var arr_result = new Array();
            var result = '';
            for (var i = 0; i < arr.length; i++) {
                if (arr[i] == '') continue;
                var find = binSearch(actb_self.actb_keywords, arr[i]);
                if (find >= 0) {
                    result += actb_self.actb_keywords[find][0] + ';';
                    arr_result.push(actb_self.actb_keywords[find][1]);
                }
            }
            if (this.actb_curr.value_ctl)
                this.actb_curr.value_ctl.value = result;
            this.actb_curr.value = arr_result.join(';');
            delete arr_result;
            return this.actb_curr.result = result;
        }

        function binSearch(R, K) {
            var low = 0,
                mid;
            var high = R.length - 1;
            var pos = K.indexOf('(');
            if (-1 == pos) {
                pos = K.indexOf('（');
            }
            var en1 = pos > 0 ? K.substring(0, pos).toLowerCase() : K.toLowerCase();
            while (low <= high) {
                if (R[low][1].toLowerCase() == K.toLowerCase())
                    return low;
                else if (R[high][1].toLowerCase() == K.toLowerCase())
                    return high;
                mid = Math.floor((low + high) / 2);
                var len = R[mid][1].indexOf('(');
                if (-1 == len) {
                    len = R[mid][1].indexOf('（');
                }
                len = len == -1 ? R[mid][1].length : len;
                var en2 = R[mid][1].substring(0, len).toLowerCase();
                if (en1 == en2 || K.toLowerCase() == R[mid][0]) return mid; //K.toLowerCase() == R[mid][0], only for userchooser;
                if (en2 > en1)
                    high = mid - 1;
                else
                    low = mid + 1;
            }
            return -1;
        }

        function binStartSearch(R, K) {
            var low = 0,
                mid;
            var high = R.length - 1;
            K = K.toLowerCase();
            var s = K.indexOf('(');
            if (-1 == s) {
                s = K.indexOf('（');
            }
            var en1 = s == -1 ? K : K.substring(0, s).toLowerCase();
            while (low <= high) {
                if (R[low][1].toLowerCase().indexOf(K) == 0) {
                    while (low >= 0 && R[low][1].toLowerCase().indexOf(K) == 0)
                        low--;
                    return low + 1;
                } else if (high >= 0 && R[high][1].toLowerCase().indexOf(K) == 0) {
                    while (R[high][1].toLowerCase().indexOf(K) == 0)
                        high--;
                    return high + 1;
                }
                mid = Math.floor((low + high) / 2);
                var len = R[mid][1].indexOf('(');
                if (-1 == len) {
                    len = R[mid][1].indexOf('（');
                }
                len = len == -1 ? R[mid][1].length : len;
                var en2 = R[mid][1].substring(0, len).toLowerCase();
                if (en2.indexOf(K) == 0) {
                    while (mid >= 0 && R[mid][1].toLowerCase().indexOf(K) == 0)
                        mid--;
                    return mid + 1;
                }
                if (en2 > en1)
                    high = mid - 1;
                else
                    low = mid + 1;
            }
            return -1;
        }

        function actb_parse(n) {
            if (actb_self.actb_delimiter.length > 0) {
                var t = actb_delimwords[actb_cdelimword].trim().addslashes();
                var plen = actb_delimwords[actb_cdelimword].trim().length;
            } else {
                var t = this.actb_curr.value.addslashes();
                var plen = this.actb_curr.value.length;
            }
            var tobuild = '';
            var i;

            if (actb_self.actb_firstText) {
                var re = new RegExp("^" + t, "i");
            } else {
                var re = new RegExp(t, "i");
            }
            var p = n.search(re);

            for (i = 0; i < p; i++) {
                tobuild += n.substr(i, 1);
            }
            tobuild += "<font style='" + (actb_self.actb_hStyle) + "'>"
            for (i = p; i < plen + p; i++) {
                tobuild += n.substr(i, 1);
            }
            tobuild += "</font>";
            for (i = plen + p; i < n.length; i++) {
                tobuild += n.substr(i, 1);
            }
            return tobuild;
        }

        function actb_generate() {
            //if (document.getElementById('tat_table')){ actb_display = false;document.body.removeChild(document.getElementById('tat_table')); }
            if (actb_kwcount == 0) {
                actb_display = false;
                return;
            }
            var a = document.getElementById('tat_table');
            if (a) {
                while (a.rows.length > 0) {
                    a.deleteRow(0);
                }
            } else {
                a = document.createElement('table');
                a.cellSpacing = '1px';
                a.cellPadding = '2px';
                a.style.position = 'absolute';
                a.style.top = eval(curTop(this.actb_curr) + this.actb_curr.offsetHeight) + "px";
                a.style.left = curLeft(this.actb_curr) + "px";
                a.id = 'tat_table';
                a.className = "autofinish";

                if (jQuery.browser.msie && (!document.documentMode || document.documentMode < 9)) {
                    var frame = document.createElement('<iframe src="javascript:false;document.write(\'\');" id="tat_frame" style="position:absolute;z-index:0;visibility:expression(this.nextSibling.visibility);width:expression(this.nextSibling.offsetWidth);height:expression(this.nextSibling.offsetHeight);top:expression(this.nextSibling.offsetTop);left:expression(this.nextSibling.offsetLeft);" frameborder="0">');
                    document.body.appendChild(frame);
                }

                document.body.appendChild(a);
            }

            var i;
            var first = true;
            var j = 1;
            if (actb_self.actb_mouse) {
                a.onmouseout = actb_table_unfocus;
                a.onmouseover = actb_table_focus;
            }
            //for ie6 bug, spark
            //document.getElementById('void').className = 'devil';
            //document.getElementById('void').className = 'angel';

            var counter = 0;

            //for (i=0;i<actb_self.actb_keywords.length;i++){
            var iStart = this.curpos || 0;
            var iEnd = this.curpos + actb_self.actb_lim;
            for (i = this.curpos; i < iEnd; i++) {
                if (actb_bool[i]) {
                    counter++;
                    r = a.insertRow(-1);
                    if (first && !actb_tomake) {
                        //r.style.backgroundColor = actb_self.actb_hColor;
                        r.className = 'hover';
                        first = false;
                        actb_pos = counter;
                    } else if (actb_pre == i) {
                        //r.style.backgroundColor = actb_self.actb_hColor;
                        r.className = 'hover';
                        first = false;
                        actb_pos = counter;
                    } else {
                        //r.style.backgroundColor = actb_self.actb_bgColor;
                        r.className = '';
                    }
                    r.id = 'tat_tr' + (j);
                    c = r.insertCell(-1);
                    //c.style.color = actb_self.actb_textColor;
                    //c.style.fontFamily = actb_self.actb_fFamily;
                    //c.style.fontSize = actb_self.actb_fSize;
                    c.innerHTML = actb_parse(actb_self.actb_keywords[i][1]);
                    c.id = 'tat_td' + (j);
                    c.setAttribute('pos', j);
                    if (actb_self.actb_mouse) {
                        c.style.cursor = 'pointer';
                        c.onclick = actb_mouseclick;
                        c.onmouseover = actb_table_highlight;
                    }
                    j++;
                }
                if (j - 1 == actb_self.actb_lim && j < actb_total) {
                    r = a.insertRow(-1);
                    r.style.backgroundColor = actb_self.actb_bgColor;
                    c = r.insertCell(-1);
                    c.style.color = actb_self.actb_textColor;
                    c.style.fontFamily = 'arial narrow';
                    c.style.fontSize = actb_self.actb_fSize;
                    c.align = 'center';
                    replaceHTML(c, '\\/');
                    if (actb_self.actb_mouse) {
                        c.style.cursor = 'pointer';
                        c.onclick = actb_mouse_down;
                    }
                    break;
                }
            }
            actb_rangeu = 1;
            actb_ranged = j - 1;
            actb_display = true;
            if (actb_pos <= 0) actb_pos = 1;
        }

        function actb_remake() {
            var a = document.getElementById('tat_table');
            if (a) {
                while (a.rows.length > 0) {
                    a.deleteRow(0);
                }
            } else {
                a = document.createElement('table');
                a.cellSpacing = '1px';
                a.cellPadding = '2px';
                a.style.position = 'absolute';
                a.style.top = eval(curTop(this.actb_curr) + this.actb_curr.offsetHeight) + "px";
                a.style.left = curLeft(this.actb_curr) + "px";
                a.style.backgroundColor = actb_self.actb_bgColor;
                a.id = 'tat_table';
                a.className = "autofinish";
                if (actb_self.actb_mouse) {
                    a.onmouseout = actb_table_unfocus;
                    a.onmouseover = actb_table_focus;
                }
                document.body.appendChild(a);
            }
            //for ie6 bug, spark
            //document.getElementById('void').className = 'devil';
            //document.getElementById('void').className = 'angel';
            var i;
            var first = true;
            var j = 1;
            if (actb_rangeu > 1) {
                r = a.insertRow(-1);
                r.style.backgroundColor = actb_self.actb_bgColor;
                c = r.insertCell(-1);
                c.style.color = actb_self.actb_textColor;
                c.style.fontFamily = 'arial narrow';
                c.style.fontSize = actb_self.actb_fSize;
                c.align = 'center';
                replaceHTML(c, '/\\');
                if (actb_self.actb_mouse) {
                    c.style.cursor = 'pointer';
                    c.onclick = actb_mouse_up;
                }
            }
            for (i = 0; i < actb_self.actb_keywords.length; i++) {
                if (actb_bool[i]) {
                    if (j >= actb_rangeu && j <= actb_ranged) {
                        r = a.insertRow(-1);
                        r.style.backgroundColor = actb_self.actb_bgColor;
                        r.id = 'tat_tr' + (j);
                        c = r.insertCell(-1);
                        c.style.color = actb_self.actb_textColor;
                        c.style.fontFamily = actb_self.actb_fFamily;
                        c.style.fontSize = actb_self.actb_fSize;
                        c.innerHTML = actb_parse(actb_self.actb_keywords[i][1]);
                        c.id = 'tat_td' + (j);
                        c.setAttribute('pos', j);
                        if (actb_self.actb_mouse) {
                            c.style.cursor = 'pointer';
                            c.onclick = actb_mouseclick;
                            c.onmouseover = actb_table_highlight;
                        }
                        j++;
                    } else {
                        j++;
                    }
                }
                if (j > actb_ranged) break;
            }
            if (j - 1 < actb_total) {
                r = a.insertRow(-1);
                r.style.backgroundColor = actb_self.actb_bgColor;
                c = r.insertCell(-1);
                c.style.color = actb_self.actb_textColor;
                c.style.fontFamily = 'arial narrow';
                c.style.fontSize = actb_self.actb_fSize;
                c.align = 'center';
                replaceHTML(c, '\\/');
                if (actb_self.actb_mouse) {
                    c.style.cursor = 'pointer';
                    c.onclick = actb_mouse_down;
                }
            }


        }

        function actb_goup() {
            if (!actb_display) return;
            if (actb_pos == 1) return;
            //document.getElementById('tat_tr'+actb_pos).style.backgroundColor = actb_self.actb_bgColor;
            document.getElementById('tat_tr' + actb_pos).className = '';
            actb_pos--;
            if (actb_pos < actb_rangeu) actb_moveup();
            //document.getElementById('tat_tr'+actb_pos).style.backgroundColor = actb_self.actb_hColor;
            document.getElementById('tat_tr' + actb_pos).className = 'hover';
            if (actb_toid) clearTimeout(actb_toid);
            if (actb_self.actb_timeOut > 0) actb_toid = setTimeout(function() {
                actb_mouse_on_list = 0;
                actb_removedisp();
            }, actb_self.actb_timeOut);
        }

        function actb_godown() {
            if (!actb_display) return;
            if (actb_pos == actb_total) return;
            //document.getElementById('tat_tr'+actb_pos).style.backgroundColor = actb_self.actb_bgColor;
            document.getElementById('tat_tr' + actb_pos).className = '';
            actb_pos++;

            //if (actb_pos > actb_ranged) actb_movedown();
            if (actb_pos > actb_ranged) actb_pos = 1;
            //document.getElementById('tat_tr'+actb_pos).style.backgroundColor = actb_self.actb_hColor;
            document.getElementById('tat_tr' + actb_pos).className = 'hover';
            if (actb_toid) clearTimeout(actb_toid);
            if (actb_self.actb_timeOut > 0) actb_toid = setTimeout(function() {
                actb_mouse_on_list = 0;
                actb_removedisp();
            }, actb_self.actb_timeOut);
        }

        function actb_movedown() {
            actb_rangeu++;
            actb_ranged++;
            actb_remake();
        }

        function actb_moveup() {
            actb_rangeu--;
            actb_ranged--;
            actb_remake();
        }

        /* Mouse */

        function actb_mouse_down() {
            //document.getElementById('tat_tr'+actb_pos).style.backgroundColor = actb_self.actb_bgColor;
            document.getElementById('tat_tr' + actb_pos).className = '';
            actb_pos++;
            actb_movedown();
            //document.getElementById('tat_tr'+actb_pos).style.backgroundColor = actb_self.actb_hColor;
            document.getElementById('tat_tr' + actb_pos).className = 'hover';
            this.actb_curr.focus();
            actb_mouse_on_list = 0;
            if (actb_toid) clearTimeout(actb_toid);
            if (actb_self.actb_timeOut > 0) actb_toid = setTimeout(function() {
                actb_mouse_on_list = 0;
                actb_removedisp();
            }, actb_self.actb_timeOut);
        }

        function actb_mouse_up(evt) {
            if (!evt) evt = event;
            if (evt.stopPropagation) {
                evt.stopPropagation();
            } else {
                evt.cancelBubble = true;
            }
            //document.getElementById('tat_tr'+actb_pos).style.backgroundColor = actb_self.actb_bgColor;
            document.getElementById('tat_tr' + actb_pos).className = '';
            actb_pos--;
            actb_moveup();
            //document.getElementById('tat_tr'+actb_pos).style.backgroundColor = actb_self.actb_hColor;
            document.getElementById('tat_tr' + actb_pos).className = 'hover';
            this.actb_curr.focus();
            actb_mouse_on_list = 0;
            if (actb_toid) clearTimeout(actb_toid);
            if (actb_self.actb_timeOut > 0) actb_toid = setTimeout(function() {
                actb_mouse_on_list = 0;
                actb_removedisp();
            }, actb_self.actb_timeOut);
        }

        function actb_mouseclick(evt) {
            if (!evt) evt = event;
            if (!actb_display) return;
            actb_mouse_on_list = 0;
            actb_pos = this.getAttribute('pos');
            actb_penter();
        }

        function actb_table_focus() {
            actb_mouse_on_list = 1;
        }

        function actb_table_unfocus() {
            actb_mouse_on_list = 0;
            if (actb_toid) clearTimeout(actb_toid);
            if (actb_self.actb_timeOut > 0) actb_toid = setTimeout(function() {
                actb_mouse_on_list = 0;
                actb_removedisp();
            }, actb_self.actb_timeOut);
        }

        function actb_table_highlight() {
            actb_mouse_on_list = 1;
            //document.getElementById('tat_tr'+actb_pos).style.backgroundColor = actb_self.actb_bgColor;
            document.getElementById('tat_tr' + actb_pos).className = '';
            actb_pos = this.getAttribute('pos');
            while (actb_pos < actb_rangeu) actb_moveup();
            while (actb_pos > actb_ranged) actb_movedown();
            //document.getElementById('tat_tr'+actb_pos).style.backgroundColor = actb_self.actb_hColor;
            document.getElementById('tat_tr' + actb_pos).className = 'hover';
            if (actb_toid) clearTimeout(actb_toid);
            if (actb_self.actb_timeOut > 0) actb_toid = setTimeout(function() {
                actb_mouse_on_list = 0;
                actb_removedisp();
            }, actb_self.actb_timeOut);
        }
        /* ---- */

        function actb_insertword(a) {
            if (actb_self.actb_delimiter.length > 0) {
                str = '';
                l = 0;
                for (i = 0; i < actb_delimwords.length; i++) {
                    if (actb_cdelimword == i) {
                        prespace = postspace = '';
                        gotbreak = false;
                        for (j = 0; j < actb_delimwords[i].length; ++j) {
                            if (actb_delimwords[i].charAt(j) != ' ') {
                                gotbreak = true;
                                break;
                            }
                            prespace += ' ';
                        }
                        for (j = actb_delimwords[i].length - 1; j >= 0; --j) {
                            if (actb_delimwords[i].charAt(j) != ' ') break;
                            postspace += ' ';
                        }
                        str += prespace;
                        str += a;
                        l = str.length;
                        if (gotbreak) str += postspace;
                    } else {
                        str += actb_delimwords[i];
                    }
                    if (i != actb_delimwords.length - 1) {
                        str += actb_delimchar[i];
                    }
                }
                this.actb_curr.value = str;
                setCaret(this.actb_curr, l);
            } else {
                this.actb_curr.value = a;
            }
            actb_mouse_on_list = 0;
            actb_removedisp();
        }

        function actb_penter() {
            if (!actb_display) return;
            actb_display = false;
            var word = '';
            var value = '';
            var c = 0;

            var iStart = this.curpos || 0;
            var iEnd = this.curpos + actb_self.actb_lim;
            //for (var i=0;i<=actb_self.actb_keywords.length;i++){
            for (i = this.curpos; i < iEnd; i++) {
                if (actb_bool[i]) c++;
                if (c == actb_pos) {
                    word = actb_self.actb_keywords[i][1];
                    break;
                }
            }
            actb_insertword(word + ';');
            l = getCaretStart(this.actb_curr);
        }

        function actb_removedisp() {
            if (actb_mouse_on_list == 0) {
                actb_display = 0;
                if (document.getElementById('tat_table')) {
                    document.body.removeChild(document.getElementById('tat_table'));
                }
                if (document.getElementById('tat_frame')) {
                    document.body.removeChild(document.getElementById('tat_frame'));
                }
                //for ie6 bug, spark
                //document.getElementById('void').className = 'devil';
                //document.getElementById('void').className = 'angel';
                if (actb_toid) clearTimeout(actb_toid);
            }
        }

        function actb_keypress(e) {
            if (actb_caretmove) stopEvent(e);
            return !actb_caretmove;
        }

        function actb_checkkey(evt) {

            if (!evt) evt = event;
            a = evt.keyCode;
            caret_pos_start = getCaretStart(this.actb_curr);
            actb_caretmove = 0;
            switch (a) {
                case 38:
                    actb_goup();
                    actb_caretmove = 1;
                    return false;
                    break;
                case 40:
                    actb_godown();
                    actb_caretmove = 1;
                    return false;
                    break;
                case 13:
                    //case 9:

                    actb_caretmove = 0;
                    actb_penter();

                    evt.returnValue = false;
                    evt.cancelBubble = true;
                    evt.preventDefault ? evt.preventDefault() : evt.keyCode = 0;

                    var table = document.getElementById('tat_table');
                    if (table)
                        table.style.display = 'none';

                    //document.getElementById('void').className = 'devil';
                    //document.getElementById('void').className = 'angel';

                    return false;

                    break;
                default:
                    setTimeout(function() {
                        actb_tocomplete(a)
                    }, 1);
                    break;
            }
        }

        function actb_tocomplete(kc) {
            if (kc == 38 || kc == 40 || kc == 13) {

                if (!event) return false;
                event.cancelBubble = true;
                event.returnValue = false;
                return false;
            }
            var i;
            if (actb_display) {
                var word = 0;
                var c = 0;

            } else {
                actb_pre = -1
            };

            if (this.actb_curr.value == '') {
                actb_mouse_on_list = 0;
                actb_removedisp();
                return;
            }
            if (actb_self.actb_delimiter.length > 0) {
                caret_pos_start = getCaretStart(this.actb_curr);
                caret_pos_end = getCaretEnd(this.actb_curr);

                delim_split = '';
                for (i = 0; i < actb_self.actb_delimiter.length; i++) {
                    delim_split += actb_self.actb_delimiter[i];
                }
                delim_split = delim_split.addslashes();
                delim_split_rx = new RegExp("([" + delim_split + "])");
                c = 0;
                actb_delimwords = new Array();
                actb_delimwords[0] = '';
                for (i = 0, j = this.actb_curr.value.length; i < this.actb_curr.value.length; i++, j--) {
                    if (this.actb_curr.value.substr(i, j).search(delim_split_rx) == 0) {
                        ma = this.actb_curr.value.substr(i, j).match(delim_split_rx);
                        actb_delimchar[c] = ma[1];
                        c++;
                        actb_delimwords[c] = '';
                    } else {
                        actb_delimwords[c] += this.actb_curr.value.charAt(i);
                    }
                }

                var l = 0;
                actb_cdelimword = -1;
                for (i = 0; i < actb_delimwords.length; i++) {
                    if (caret_pos_end >= l && caret_pos_end <= l + actb_delimwords[i].length) {
                        actb_cdelimword = i;
                    }
                    l += actb_delimwords[i].length + 1;
                }
                var ot = actb_cdelimword == -1 ? '' : actb_delimwords[actb_cdelimword].trim();
                var t = actb_cdelimword == -1 ? '' : actb_delimwords[actb_cdelimword].addslashes().trim();
            } else {
                var ot = this.actb_curr.value;
                var t = this.actb_curr.value.addslashes();
            }
            if (ot.length == 0) {
                actb_mouse_on_list = 0;
                actb_removedisp();
            }
            if (ot.length < actb_self.actb_startcheck) return this;
            if (actb_self.actb_firstText) {
                var re = new RegExp("^" + t, "i");
            } else {
                var re = new RegExp(t, "i");
            }

            actb_total = 0;
            actb_tomake = false;
            actb_kwcount = 0;

            var iStart = 0;
            var iEnd = actb_self.actb_keywords.length;

            iStart = binStartSearch(actb_self.actb_keywords, t);
            iEnd = iStart == -1 ? iEnd : iStart + actb_self.actb_lim + 1;
            iEnd = iEnd > actb_self.actb_keywords.length ? actb_self.actb_keywords.length : iEnd;
            iStart = iStart == -1 ? 0 : iStart;
            this.curpos = iStart;

            //for (i=0;i<actb_self.actb_keywords.length;i++){
            for (i = iStart; i < iEnd; i++) {
                actb_bool[i] = false;
                if (re.test(actb_self.actb_keywords[i][1])) {
                    actb_total++;
                    actb_bool[i] = true;
                    actb_kwcount++;
                    if (actb_pre == i) actb_tomake = true;
                }
            }

            if (actb_toid) clearTimeout(actb_toid);
            if (actb_self.actb_timeOut > 0) actb_toid = setTimeout(function() {
                actb_mouse_on_list = 0;
                actb_removedisp();
            }, actb_self.actb_timeOut);
            actb_generate();
        }
    return this;
}


// Get the obj that starts the event

function getElement(evt) {
    if (window.event) {
        return window.event.srcElement;
    } else {
        return evt.currentTarget;
    }
}
// Get the obj that triggers off the event

function getTargetElement(evt) {
    if (window.event) {
        return window.event.srcElement;
    } else {
        return evt.target;
    }
}
// For IE only, stops the obj from being selected

function stopSelect(obj) {
    if (typeof obj.onselectstart != 'undefined') {
        addEvent(obj, "selectstart", function() {
            return false;
        });
    }
}

// Stop an event from bubbling up the event DOM

function stopEvent(evt) {
    evt || window.event;
    if (evt.stopPropagation) {
        evt.stopPropagation();
        evt.preventDefault();
    } else if (typeof evt.cancelBubble != "undefined") {
        evt.cancelBubble = true;
        evt.returnValue = false;
    }
    return false;
}

/* Offset position from top of the screen */

function curTop(obj) {
    toreturn = 0;
    while (obj) {
        toreturn += obj.offsetTop;
        obj = obj.offsetParent;
    }
    return toreturn;
}

function curLeft(obj) {
    toreturn = 0;
    while (obj) {
        toreturn += obj.offsetLeft;
        obj = obj.offsetParent;
    }
    return toreturn;
}
/* ------ End of Offset function ------- */

/* Types Function */

// is a given input a number?

function isNumber(a) {
    return typeof a == 'number' && isFinite(a);
}

/* Object Functions */

function replaceHTML(obj, text) {
    while (el = obj.childNodes[0]) {
        obj.removeChild(el);
    };
    obj.appendChild(document.createTextNode(text));
}

/*    Escape function   */
String.prototype.addslashes = function() {
    return this.replace(/(["\\\.\|\[\]\^\*\+\?\$\(\)])/g, '\\$1');
}
String.prototype.trim = function() {
    return this.replace(/^\s*(\S*(\s+\S+)*)\s*$/, "$1");
};
/* --- Escape --- */

// Get the end position of the caret in the object. Note that the obj needs to be in focus first

function getCaretEnd(obj) {
    if (typeof obj.selectionEnd != "undefined") {
        return obj.selectionEnd;
    } else if (document.selection && document.selection.createRange) {
        var M = document.selection.createRange();
        try {
            var Lp = M.duplicate();
            Lp.moveToElementText(obj);
        } catch (e) {
            var Lp = obj.createTextRange();
        }
        try {
            Lp.setEndPoint("EndToEnd", M);
        } catch (e) {
            return;
        }
        var rb = Lp.text.length;
        if (rb > obj.value.length) {
            return -1;
        }
        return rb;
    }
}

// Get the start position of the caret in the object

function getCaretStart(obj) {
    if (typeof obj.selectionStart != "undefined") {
        return obj.selectionStart;
    } else if (document.selection && document.selection.createRange) {
        var M = document.selection.createRange();
        try {
            var Lp = M.duplicate();
            Lp.moveToElementText(obj);
        } catch (e) {
            var Lp = obj.createTextRange();
        }
        try {
            Lp.setEndPoint("EndToStart", M);
        } catch (e) {
            return;
        }
        var rb = Lp.text.length;
        if (rb > obj.value.length) {
            return -1;
        }
        return rb;
    }
}
// sets the caret position to l in the object

function setCaret(obj, l) {
    obj.focus();
    if (obj.setSelectionRange) {
        obj.setSelectionRange(l, l);
    } else if (obj.createTextRange) {
        m = obj.createTextRange();
        m.moveStart('character', l);
        m.collapse();
        m.select();
    }
}
// sets the caret selection from s to e in the object

function setSelection(obj, s, e) {
    obj.focus();
    if (obj.setSelectionRange) {
        obj.setSelectionRange(s, e);
    } else if (obj.createTextRange) {
        m = obj.createTextRange();
        m.moveStart('character', s);
        m.moveEnd('character', e);
        m.select();
    }
}

function RTrim(str, sep) {
    var i;
    for (i = str.length - 1; i >= 0; i--) {
        if (str.charAt(i) != sep)
            break;
    }
    return str.substring(0, i + 1);
}