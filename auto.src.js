/// <reference path="jquery-1.11.0-vsdoc.js" />
/// <reference path="highchart/js/highcharts.js" />
/// <reference path="underscore.js" />
/// <reference path="bootstrap-3.1.1/dist/js/bootstrap.min.js" />

//2014.4月，分公司报表的辅助插件，包括自动生成表，柱状图、饼图等。
//使用autoBS等方法，须引用jquery  underscore bootstrap.js bootstrap.css
//使用autoLine等画图方法，须引用jquery  highcharts等文件。
//使用autoTable，须引用jquery underscore auto.css文件。建议不使用它
//autoTable autoBSTable 可以代替autoThead autoTbody.它们已经过时，只用在分公司查询的页面。
//autoNy autoNyr需要用到修改过后的 bootstrap文件和样式表。

(function ($) {
    //auto的调试组件
    $.auto = {
        fmtDate: function (date, fmt) {
            var o = {
                "M+": date.getMonth() + 1,                 //月份
                "d+": date.getDate(),                    //日
                "h+": date.getHours(),                   //小时
                "m+": date.getMinutes(),                 //分
                "s+": date.getSeconds(),                 //秒
                "q+": Math.floor((date.getMonth() + 3) / 3), //季度
                "S": date.getMilliseconds()             //毫秒
            };
            if (/(y+)/.test(fmt))
                fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
            for (var k in o)
                if (new RegExp("(" + k + ")").test(fmt))
                    fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            return fmt;
        },
        log: function (msg, id) {
            this._outFunc(msg, '#5BC0DE', '#fff', id);
            $.auto._panel && $.auto._panel.find('.autolog').text(++$.auto._logCount);
        },
        warn: function (msg, id) {
            this._outFunc(msg, '#F0AD4E', '#fff', id);
            $.auto._panel && $.auto._panel.find('.autowarn').text(++$.auto._warnCount);
        },
        error: function (msg, id) {
            this._outFunc(msg, '#D9534F', '#fff', id);
            $.auto._panel && $.auto._panel.find('.autoerror').text(++$.auto._errorCount);
        },
        success: function (msg, id) {
            this._outFunc(msg, '#5CB85C', '#fff', id);
            $.auto._panel && $.auto._panel.find('.autosuccess').text(++$.auto._sucCount);
        },
        clear: function () {
            if ($.auto._debugpanel) {
                $.auto._debugpanel.children().remove();
                $.auto._count = 0;
                $.auto._time = [];
                $.auto._logCount = $.auto._sucCount = $.auto._warnCount = $.auto._errorCount = 0;
                $.auto._panel.find('.label').text(0);
            }
        },
        _outFunc: function (msg, bgColor, color, id) {
            if ($.auto._debugpanel) {
                $.auto._count++;
                var xh = '  ' + String(1000 + $.auto._count).substring(1);
                var now = new Date();
                if (typeof id !== 'undefined') {
                    if (typeof $.auto._time[id] === 'undefined') $.auto._time[id] = [];
                    var lasttime = $.auto._time[id].slice(-1);
                    lasttime.length == 0 ? lasttime = now : lasttime = lasttime[0];
                    $.auto._time[id].push(now);
                    msg = xh + '. ' + $.auto.fmtDate(now, 'hh:mm:ss ') + '(id:' + id + ' >' + ((now.getTime() - lasttime.getTime()) / 1000) + '秒) :' + msg;
                }
                else {
                    msg = xh + '. ' + $.auto.fmtDate(now, 'hh:mm:ss ') + ' :' + msg;
                }
                var div = $('<div>').css({
                    'background-color': bgColor, color: color, 'padding-left': '8px'
                }).html(msg);
                $.auto._debugpanel.append(div);
                div[0].scrollIntoView();
            }
        },

        //message组件
        alert: function (title, msg, option) {
            initMessage();
            var size = {
                smCss: { width: '300px' },
                lgCss: { width: '600px' }
            };
            var opt = $.extend({
                isFooter: false,
                size: 'sm',     //只能取lg或sm
                position: 'cm',//position取9种值，上中下分别tmb,左中右为lcr的任意组合。
                css: {}         //用户定义样式，赋给最外层。比如定义大小。
            }, option);

            $.auto._messagePanel.find('.modal-title').html(title).end()
                                .find('.modal-body').html(msg).end()
                                .css(size[opt.size + "Css"]).css(opt.css)
            if (!opt.isFooter) {
                $.auto._messagePanel.find('.modal-footer').hide();
            }

            var ww = $(window).width(), wh = $(window).height()
            dw = $.auto._messagePanel.width(), dh = $.auto._messagePanel.height();
            var t = 0, l = 5;
            if (wh > dh) {
                opt.position.indexOf('m') != -1 && (t = (wh - dh) / 2);
                opt.position.indexOf('b') != -1 && (t = (wh - dh) - 10);
            }
            if (ww > dw) {
                opt.position.indexOf('c') != -1 && (l = (ww - dw) / 2);
                opt.position.indexOf('r') != -1 && (l = (ww - dw) - 10);
            }
            $.auto._messagePanel.css({ left: l, top: t }).modal({ backdrop: false });
            //使之可拖动
            $.auto._messagePanel.autoDrag({ floatIn: 'screen', handler: '.modal-header',dragOpacity:0.6 });
        }
    };
    function initDebugPanel() {
        $(window).bind('hashchange', function () {
            if (window.location.hash.indexOf('#debug') != -1) {
                if (!$.auto._panel) {
                    $.auto._panel = null;
                    $.auto._debugpanel = null;
                    $.auto._count = 0;
                    $.auto._time = [];
                    $.auto._logCount = $.auto._sucCount = $.auto._warnCount = $.auto._errorCount = 0;
                    $('body').append(
                               '<div  style="width: 100%;height:200px;margin:0;"></div>\
                                <div id="autoDebugPanel" class="panel panel-info" style="bottom:0;position:fixed;width: 100%;height:200px;margin:0;">\
									<div class="panel-heading" style="padding: 2px 8px;">\
										 调试窗口<a href="#" class="close pull-right">&times;</a>\
                                         <span class="glyphicon glyphicon-flash"></span><span class="label label-info autolog">0</span>\
                                         <span class="glyphicon glyphicon-ok-circle"></span><span class="label label-success autosuccess">0</span>\
                                        <span class="glyphicon glyphicon-warning-sign"></span><span class="label label-warning autowarn">0</span>\
                                        <span class="glyphicon glyphicon-ban-circle"></span><span class="label label-danger autoerror">0</span>\
										 <a href="javascript:$.auto.clear();" style="margin-left:15px" > <span class="glyphicon glyphicon-trash"></span></a>\
									</div>\
									<div class="panel-body" style="padding:0px;overflow: scroll;height:170px">\
									</div>\
                                </div>');
                    $.auto._panel = $('#autoDebugPanel').hide();
                    $.auto._debugpanel = $.auto._panel.find('.panel-body');
                }
                $.auto._panel.show();
            }
            else {
                $.auto._panel && $.auto._panel.hide();
            }
        });
    }
    initDebugPanel();

    function initMessage() {
        if (!$.auto._messagePanel) {
            $('body').prepend(
'<div class="modal-dialog" id="autoMessagePanel" style="margin:0px;">\
    <div class="modal-content">\
      <div class="modal-header" style="padding:5px 15px">\
        <button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span></button>\
        <h4 class="modal-title"></h4>\
      </div>\
      <div class="modal-body"></div>\
      <div class="modal-footer" style="padding:5px 15px;text-align:center;">\
        <button type="button" class="btn btn-default" data-dismiss="modal">关闭</button>\
      </div>\
    </div>\
</div>');
            $.auto._messagePanel = $('#autoMessagePanel').hide();
        }
    }

    //拖动draggable
    $.fn.autoDrag = function (options) {
        var me = $(this);
        var opt = {
            floatIn: 'page', //page:浮于页面之上。screen:相对于屏幕。 #id：浮于某个页面元素之内,必须用#id的形式
            handler: '',      //在当前元素内部的，拖手的选择器，暂时不考虑元素外部的拖动。
            dragOpacity: 1    //拖动时的透明度
        };
        $.extend(opt, options);
        //设置元素position,外层容器，限制容器，拖手元素
        var posStyle = 'absolute';
        var posContainer = 'body';
        var limitContainer = 'body';
        var handler = me;
        opt.floatIn == 'screen' && (posStyle = 'fixed', limitContainer = window);
        opt.floatIn[0] == '#' && (posContainer = opt.floatIn, limitContainer = opt.floatIn);
        me.css({
            'position': posStyle
        }).prependTo($(posContainer));
        if (opt.handler) {
            handler = me.find(opt.handler);
        }
        handler.css({
            '-moz-user-select': 'none',
            '-webkit-user-select': 'none',
            '-ms-user-select': 'none',
            'user-select': 'none',
            'cursor': 'move'
        });
        //初始化拖动前位置等信息
        var _dragged = false,
            initPos,   //初始位置
            downX, downY,  //鼠标点击位置
            limitX, limitY, //最大的边界，拖动元素不能超过Container。
            orginContainer = { left: 0, top: 0 };
        me.off('.autodrag');

        me.on('mousedown.autodrag', opt.handler, function (e) {
            _dragged = true;
            downX = e.clientX;
            downY = e.clientY;
            initPos = me.position();
            if (opt.dragOpacity < 1 && opt.dragOpacity > 0) {
                me.css('opacity', opt.dragOpacity);
            }
            if (opt.floatIn[0] == '#') {
                orginContainer = $(limitContainer).position();
            }
            limitX = orginContainer.left + $(limitContainer).width() - me.width();
            limitY = orginContainer.top + $(limitContainer).height() - me.height();
            me.off('mousemove.autodrag');
            me.on('mousemove.autodrag', opt.handler, drag);
        });
        function drag(e) {
            if (_dragged /*  && e.buttons != 0*/) {
                var curX = initPos.left + (e.clientX - downX),
                    curY = initPos.top + (e.clientY - downY);
                curX = curX < orginContainer.left ? orginContainer.left : (curX > limitX ? limitX : curX);
                curY = curY < orginContainer.top ? orginContainer.topk : (curY > limitY ? limitY : curY);
                me.css({
                    left: curX,
                    top: curY
                });
            }
        }
        me.on('mouseup.autodrag mouseout.autodrag', opt.handler, function (e) {
            _dragged = false;
            if (opt.dragOpacity < 1 && opt.dragOpacity > 0) {
                me.css('opacity', 1);
            }
        });
        return me;
    }
    //对div等元素，双击编辑功能，支持选择多个元素、自动post数据更新。
    $.fn.autoEdit = function (options) {
        var me = $(this);
        var opt = {
            url: '',         //请求地址。返回对象必须有zt,msg两字段。zt取值error,必须有msg。 {"zt":"error","msg":"aaaaaa"}
            kv: {},          //请求时，附加发送的主键.如果不指定，则data-key="{jh:'100-10',ny:'201402'}"必是这种格式。
            field: '',       //当前元素的字段.如果这里不指定，默认找data-field的值。
            type: '',         //输入模式，同html5的input标签的type类型相同 .如果这里不指定，默认找data-type的值。
            selectList: {}   //当type是select时，这里要提供下拉列表中的项 data-selectList={'1':'男','2':'女'}
        };
        $.extend(opt, options);
        me.addClass('autoEdit');
        me.on('dblclick', function () {
            var $div = $(this);
            //判断编辑器类型及字段值，先opt,后找data-type。 如果没有，无法编辑及更新，直接退出。
            var type = opt.type || $div.data('type');
            var field = opt.field || $div.data('field');
            var url = opt.url || $div.data('url');
            var kv = _.isEmpty(opt.kv) ? $div.data('kv') : opt.kv;
            var selectList = _.isEmpty(opt.selectList) ? $div.data('selectList') : opt.selectList;
            if (!(type && field && url && kv)) return;
            var inputMode = 1;
            type == 'select' && (inputMode = 2);
            type == 'file' && (inputMode = 3);   //3暂时不处理
            //格式化kv,selectList，格式不对退出
            if (_.isString(kv))kv = JSON.parse(kv);
            if (_.isString(selectList)) selectList = JSON.parse(selectList);
            //原大小及待插入dom
            var w = $div.innerWidth(), h = $div.innerHeight(),
                oldText, $input;
            oldText = $div.text();
            $div.hide();
            if ($div.next().hasClass('autoeditinput')) {
                $input = $div.next();
                $input.tooltip('destroy').show();
            }
            else {
                if (inputMode == 1) {
                    $input = $('<input class="autoeditinput" type="' + type + '" />');
                    $input.val(oldText).blur(submit).focus();
                }
                else if (inputMode == 2) {
                    $input = $('<select class="autoeditinput">');
                    $.each(opt.selectList, function (k, v) {
                        $input.append('<option value="' + k + '">' + v + '</option>');
                    });
                    _.each(opt.selectList, function (v, k) {
                        if (v == oldText) {
                            $input.val(k);
                        }
                    });
                    $input.change(submit).focus();
                }
                $input.css({ width: w + 'px', height: h + 'px' });
                $div.after($input);
            }
            function submit() {
                var v = $input.val()
                //如果值不变，则还原状态。
                if (v == oldText) { $div.show(); $input.hide(); return; }
                kv[field] = v;
                kv['old_' + field] = oldText;
                $.ajax({
                    url: url, cache: false,
                    data: $.extend(kv, {}), dataType: 'json',
                    success: function (ret) {
                        if (ret.zt == 'error') {
                            $input.attr('title', ret.msg).tooltip({ placement: 'right' }).tooltip('show');
                        }
                        else {
                            if (inputMode == 1) {
                                $div.text($input.val()).show();
                            }
                            else if (inputMode == 2) {
                                $div.text(opt.selectList[$input.val()]).show();
                            }
                            $input.hide();
                        }
                    },
                    error: function (XMLHttpRequest, textStatus, errorThrown) {
                        $input.attr('title', textStatus).tooltip({ placement: 'right' }).tooltip('show');
                    }
                });
            }
        });
        return me;
    }
    //自动生成bootstrap样式的表格
    $.fn.autoBSTable = function (options) {
        var me = this;
        var opt = {
            data: [],             //data 
            prefix: '',           //附加前缀。如果不提供，则用table的id.
            isRownumber: true,    //是否显示行号。若显示则header中，要添加对应的列。该列的class='rownum'
            isHeader: true,       //是否显示表头
            header: [],           //  [{'col|id':[rowspan,colspan,附加属性]},.......]
            isFooter: true,       //是否显示页脚， 分页时须显示，分页条显示在footer中的。
            isPageable: false,    //是否分页  
            pageNumber: 1,        //初始页码
            pageSize: 20,         //初始页大小
            pageSizeList: [10, 20, 50, 100],   //页大小列表
            sortFieldList: [],    //需要排序的列
            verMergeList: [],       //纵向合并
            freezeCols: [],          //锁定的列，
            freezeContainer: window,//锁定表时的容器。默认是window的滚动，可以是包含表的选择器.比如 #tt_div
            columns: {},             /*格式化显示列的内容{ name:{formator:function(v,r){ return '';},
                                                                  editor:function(v,r){   //可编辑。注意对于纵向合并单元格的列，只能修改第一行的值。
                                                                                    return {
                                                                                        url: 'xedit.ashx',
                                                                                        kv: { name: r['name'],xh:r['address'] },
                                                                                        field: 'age',
                                                                                        type: 'text'
                                                                                    ````};
                                                                                    }   
                                                                  }         
                            ```````````````````````````` } 以及为末来在列上增加预定义的格式。 */
            tooltipOnRow: null,      //鼠标移到行上时，提示的内容。可以是function(row){}
            omitCols: [],          //忽略的列
            filter: null,           //过滤掉数据行，示例：function(row){ return true;}
            initClass: "autotable table table-striped table-bordered table-condensed table-hover" //如果不使用bs的样式，请在这里改成自定义的类，然后在CSS定义样式。
        };
        $.extend(opt, options);
        opt.prefix || (opt.prefix = me.attr('id'));

        if (me.hasClass(opt.initClass)) {
            me.off('.autoBSTableEvent');//移除原有事件
        }
        else {
            me.addClass(opt.initClass);
        }
        //过滤列表,设置好行数及列数,根据第一行设置列数
        opt.shownData = _.isFunction(opt.filter) ? _.filter(opt.data, opt.filter) : opt.data;
        opt.rowsCount = opt.shownData.length;
        if (opt.rowsCount >= 0) {
            opt.columnsCount = 0;
            for (var key in opt.data[0]) {
                opt.columnsCount++;
            }
        }
        //模板
        var tmpl_th = _.template('<th <%=id%> <%=colspan%> <%=rowspan%> <%=tag%>><%=title%><%=sort%></th>');
        var tmpl_td = _.template('<td class="<%=prefix%>_<%=field%> <%=freetd%>" data-field="<%=field%>" <%=rowspan%> ><%=fd1%><%=value%><%=fd2%></td>');
        var tmpl_autoedit = _.template("<div class='waitEdit' data-url='<%=url%>' data-kv='<%=kv%>' data-field='<%=field%>' data-type='<%=type%>' data-selectList='<%=selectList||''%>'>");
        renderThead();
        renderTbody(opt.shownData);
        renderTfoot();

        //1、添加表头
        function renderThead() {
            if (opt.isHeader) {      //如果不生成header，则保留原来的header.格式如: '姓名|NAME':[1,2,'附加属性']
                var output = '<th {1} {2} {3}{5}>{6}{0}{4}{7}</th>';
                var thead = me.find('thead');
                if (thead.length == 0) {
                    thead = $('<thead>');
                    me.append(thead);
                }
                var trs = [];
                $.each(opt.header, function (idx, row) {
                    trs.push('<tr data-hrownum="' + idx + '">');
                    for (key in row) {
                        var args = {};
                        var arr = key.split('|');
                        args.title=arr[0]; //标题
                        args.id=(arr[1] ? 'id="' + opt.prefix + '_' + arr[1] + '" data-field="' + arr[1] + '"' : ''); //id field
                        args.colspan=((row[key][0] && row[key][0] != 1) ? 'colspan="' + row[key][0] + '"' : '');//col
                        args.rowspan=((row[key][1] && row[key][1] != 1) ? 'rowspan="' + row[key][1] + '"' : '');//row
                        //排序图标
                        if (arr[1] && _.contains(opt.sortFieldList, arr[1])) {
                            args.sort=('<span class="glyphicon glyphicon-sort" style="cursor:pointer" title="排序"></span>');
                        }
                        else {
                            args.sort = ("");
                        }
                        //附加信息
                        args.tag=(row[key][2] || '');
                        trs.push(tmpl_th(args));
                    }
                    trs.push('</tr>')
                });
                thead.html(trs.join(''));
            }
        }
        //2、添加表内容
        function renderTbody(rows) {
            var tbody = me.find('tbody');
            if (tbody.length == 0) {
                tbody = $('<tbody>');
                me.append(tbody);
            }
            //确定显示范围
            var start, end;
            start = 0; end = rows.length - 1;
            var slcRows = rows;
            if (opt.isPageable) {
                start = (opt.pageNumber - 1) * opt.pageSize;
                end = Math.min(opt.pageNumber * opt.pageSize - 1, end);
            }
            var trs = [];
            //对纵向合并的列建立初始的值 ''
            var vMerge = {};
            $.each(opt.verMergeList, function (i, zb) {
                vMerge[zb] = Math.PI;
            });
            $.each(rows, function (idx, row) {
                if (idx >= start && idx <= end) {
                    //行的提示信息
                    if (opt.tooltipOnRow && _.isFunction(opt.tooltipOnRow)) {
                        trs.push('<tr data-rownum="' + idx + '" title="' + opt.tooltipOnRow(row) + '">');
                    } else {
                        trs.push('<tr data-rownum="' + idx + '">');
                    }
                    if (opt.isRownumber) {
                        if (_.contains(opt.freezeCols, 'rownum')) trs.push('<td class="rownum freetd"><div class="autofreeze">' + (idx + 1) + "</div></td>");
                        else trs.push('<td class="rownum">' + (idx + 1) + '</td>');
                    }
                    //循环生成所有td
                    for (key in row) {
                        if (_.contains(opt.omitCols, key)) continue;  //忽略部分列
                        var args = {};
                        args.prefix = opt.prefix;
                        args.field = key;
                        //冻结
                        if (_.contains(opt.freezeCols, key)) {
                            args.fd1 = "<div class='autofreeze'>";
                            args.fd2 = "</div>";
                            args.freetd = 'freetd';
                        }
                        else {
                            args.fd1 = "";
                            args.fd2 = "";
                            args.freetd = '';
                        }
                        //可编辑,在value外层加一个div。
                        if (opt.columns[key] && _.isFunction(opt.columns[key].editor)) {
                            var editOpt = opt.columns[key].editor(row[key], row);
                            _.has(editOpt, 'kv') && (editOpt.kv = JSON.stringify(editOpt.kv));
                            _.has(editOpt, 'selectList') ? (editOpt.selectList = JSON.stringify(editOpt.selectList)) : editOpt.selectList = '';
                            args.fd1 += tmpl_autoedit(editOpt);
                            args.fd2 += "</div>";
                        }
                        //格式化显示
                        if (opt.columns[key] && _.isFunction(opt.columns[key].formator))
                            args.value = (opt.columns[key].formator(row[key], row));
                        else
                            args.value = (row[key] == 0 ? 0 : (row[key] || ''));//值为0，显示为0. null，不显示。
                        //如果该列需要纵向合并，且该列值不同以上面一个值，则其是一个新单元格.向下搜索长度合并。
                        //如果是null，刚不进行合并
                        if (row[key] != null && _.contains(opt.verMergeList, key)) {
                            if (row[key] != vMerge[key]) {  //不等表示是新值，插入td. 否则忽略而过。
                                vMerge[key] = row[key];
                                var rowspan = 1;
                                while ((idx + rowspan) <= end) {
                                    if (rows[idx + rowspan][key] == vMerge[key]) rowspan++;
                                    else break;
                                }
                                if (rowspan > 1) {
                                    args.rowspan = 'rowspan="' + rowspan + '"';
                                    //添加大约合并行一半的div个数。rowspan在3以上，每增加2个，则添加一个div
                                    //args.value = (new Array(parseInt((rowspan - 0.5) / 2) + 1).join('<div>&nbsp;</div>')) + args.value;
                                }
                                else {
                                    args.rowspan = '';
                                }
                                trs.push(tmpl_td(args));
                            }
                        }
                        else {   //不需要合并，则简单显示出来。
                            args.rowspan = '';
                            trs.push(tmpl_td(args));
                        }
                    }
                    trs.push('</tr>')
                }
            });
            tbody.html(trs.join(''));
            opt.freezeDiv = me.find('.autofreeze');
            opt.freezeDiv.each(function (i, div) {
                var p = $(div).parents('.freetd');
                p.attr('rowspan') && $(div).css({ 'line-height': p.height() + 'px' });
            });
            me.find('.waitEdit').autoEdit();
        }
        //3、添加表脚
        function renderTfoot() {
            if (opt.isFooter) {
                var tfoot = me.find('tfoot');
                if (tfoot.length == 0) {
                    tfoot = $('<tfoot>');
                    me.append(tfoot);
                }
                var tr = $('<tr>').css('text-align', 'left');
                var colNumber = opt.isRownumber ? opt.columnsCount + 1 : opt.columnsCount;

                if (opt.isPageable) {
                    opt.pageCount = parseInt((opt.rowsCount + opt.pageSize - 1) / opt.pageSize);
                    var td = $('<td valign="bottom" colspan="' + colNumber + '"></td>');
                    td.append($('<span>').text('每页'));
                    var psSelect = $('<select>').addClass('psSelect');
                    $.each(opt.pageSizeList, function (i, ps) {
                        if (ps == opt.pageSize) psSelect.append('<option  selected="true">' + ps + '</option>');
                        else psSelect.append('<option>' + ps + '</option>');
                    });
                    psSelect.append('<option value="all">全部</option>');
                    td.append(psSelect);
                    td.append($('<span>').text('条    跳至'));
                    var pnSelect = $('<select>').addClass('pnSelect');
                    for (var i = 1; i <= opt.pageCount; i++) {
                        if (i == opt.pageNumber) pnSelect.append('<option selected="true">' + i + '</option>');
                        else pnSelect.append('<option>' + i + '</option>');
                    }
                    td.append(pnSelect);
                    td.append($('<span>').text('页').css('margin-right', '50px'));//<div class="btn-group"> <button type="button" class="btn btn-default">Left</button>
                    var pagergroup = $("<div>").addClass('btn-group autoPager');
                    pagergroup.append($('<button type="button" class="btn btn-default btn-sm">上一页</button>').data('num', Math.max(opt.pageNumber - 1, 1)));
                    pagergroup.append($('<button type="button" class="btn btn-default btn-sm">下一页</button>').data('num', Math.min(opt.pageNumber + 1, opt.pageCount)));
                    td.append(pagergroup);

                    var percent = Math.round(opt.pageNumber / opt.pageCount * 100) + '%';
                    td.append($('<div>').addClass('progress').css({ display: 'inline-block', width: '80px', height: '12px', margin: '12px 0 -6px 10px' }).attr('title', percent)
                                        .append($('<div>').addClass('progress-bar').css('width', percent)));
                    tr.append(td);
                }
                else {
                    tr.append('<td colspan="' + colNumber + '"><button type="button" class="btn btn-default btn-sm" data-pageable="true">启用分页</button></td>');
                }
                tfoot.html(tr);
            }
        }
        //页数跳转
        me.on('click.autoBSTableEvent', '.autoPager button', {}, function () {
            if (opt.pageNumber != $(this).data('num')) {
                opt.pageNumber = $(this).data('num');
                renderTbody(opt.shownData);
                renderTfoot();
            }
        });
        //下拉页数跳转
        me.on('change.autoBSTableEvent', '.pnSelect', {}, function () {
            if (opt.pageNumber != parseInt($(this).val())) {
                opt.pageNumber = parseInt($(this).val());
                renderTbody(opt.shownData);
                renderTfoot();
            }
        });
        //页面大小变化
        me.on('change.autoBSTableEvent', '.psSelect', {}, function () {
            if ($(this).val() == 'all') {
                opt.isPageable = false;
            }
            else {
                opt.pageSize = parseInt($(this).val());
                opt.pageNumber = 1;
            }
            renderTbody(opt.shownData);
            renderTfoot();
        });
        //分页打开或关闭,显示全部移到列表中了
        me.on('click.autoBSTableEvent', 'button', {}, function () {
            if ($(this).data('pageable')) {
                opt.isPageable = true;
                opt.pageNumber = 1;
            }
            renderTbody(opt.shownData);
            renderTfoot();
        });
        //排序
        me.on('click.autoBSTableEvent', 'thead th span', {}, function () {
            var field = $(this).parent().data('field');
            var ascSorted = $(this).hasClass('glyphicon-sort-by-attributes');
            $(this).parents('thead').find('span').removeClass('glyphicon-sort-by-attributes glyphicon-sort-by-attributes-alt');
            if (ascSorted) {
                opt.shownData = _.sortBy(opt.shownData, field).reverse();
                $(this).addClass('glyphicon-sort-by-attributes-alt');
            } else {
                opt.shownData = _.sortBy(opt.shownData, field);
                $(this).addClass('glyphicon-sort-by-attributes');
            }
            opt.pageNumber = 1;
            renderTbody(opt.shownData);
            renderTfoot();
        });

        //  锁定列
        if (opt.freezeCols.length > 0) {
            $(opt.freezeContainer).off('.autoBSTableEvent');
            $(opt.freezeContainer).on('scroll.autoBSTableEvent', "", function () {
                opt.freezeDiv.css('left', $(opt.freezeContainer).scrollLeft());
            });
        }
        me.data('OriginData', opt);
        return me;
    }
    $.fn.autoBSN = function (options) {
        var opt = {
            format: 'yyyy'
        }
        $.extend(opt, options);
        if (this.is('input[type=text]')) {
            this.datetimepicker({
                format: opt.format,
                weekStart: 1,
                autoclose: true,
                startView: 4,
                minView: 4,
                forceParse: false,  //必须设置，否则每次解析错，会变成1899年。
                language: 'zh-CN'
            });
        }
        return this;
    };
    $.fn.autoBSNy = function (options) {
        var opt = {
            format: 'yyyymm'
        }
        $.extend(opt, options);
        if (this.is('input[type=text]')) {
            this.datetimepicker({
                format: opt.format,
                weekStart: 1,
                autoclose: true,
                startView: 3,
                minView: 3,
                forceParse: false,  //必须设置，否则每次解析错，会变成1899年。
                language: 'zh-CN'
            });
        }
        return this;
    };
    $.fn.autoBSNyr = function (options) {
        var opt = {
            format: 'yyyy-mm-dd'
        }
        $.extend(opt, options);
        if (this.is('input[type=text]')) {
            this.datetimepicker({
                format: opt.format,
                weekStart: 1,
                autoclose: true,
                startView: 2,
                minView: 2,
                forceParse: false,
                language: 'zh-CN'
            });
        }
        return this;
    };

    if (typeof Highcharts !== 'undefined') {
        //增加颜色渐变
        Highcharts.getOptions().colors = $.map(Highcharts.getOptions().colors, function (color) {
            return {
                radialGradient: { cx: 0.5, cy: 0.4, r: 0.8 },
                stops: [
                    [0, color],
                    [1, Highcharts.Color(color).brighten(-0.4).get('rgb')] // darken
                ]
            };
        });
        //统一的公司标志
        var credits = {
            enabled: false,
            text: '胜利软件',
            href: 'http://10.75.0.125/'
        };
        //柱状图
        //cat是X轴标签，格式为['一月','二月'.....]，
        //data是数据，[{name:'指标名',data:[指标值.......]}      
        //            ,{name:'指标名',data:[指标值.......]}]
        //dataUnit是数值单位，比如 口，吨等
        //clickHandler 点击时的事件，传入当前选择的值。    
        $.fn.autoColumn = function (options) {
            var opt = {
                title: '',
                categories: [],      //必须项
                data: [],            //必须项
                yAxisTitle: '',
                dataUnit: '',
                legendEnable: false,
                clickHandle: null,
                isPlotShowUnit: false,
                grouppad: 0.2
            };
            $.extend(opt, options);
            this.data('categories', opt.categories);
            this.data('data', opt.data);
            //根据数据点控制柱子宽。
            var columnWidth = 40;
            var count = opt.data[0].data.length;
            if (count >= 5 && count < 15) {
                columnWidth = columnWidth / 2
            }
            else if (count >= 15) {
                columnWidth = Math.max(columnWidth / count / 5, 10);
            }
            columnWidth = Math.max(columnWidth / opt.data.length, 10);;
            return this.highcharts({
                chart: {
                    type: 'column'
                },
                title: {
                    text: opt.title
                },
                series: opt.data,
                xAxis: {
                    categories: opt.categories
                },
                yAxis: {
                    title: {
                        text: opt.yAxisTitle + ' (' + opt.dataUnit + ' )',
                        rotation: 0,
                        y: -15,
                        margin: -60,
                        align: 'high',
                        style: { "color": "#6D869F", "font-size": "10px" }
                    }
                },
                legend: {   //图例
                    enabled: opt.legendEnable,
                    align: 'right',
                    verticalAlign: 'middle',
                    layout: 'vertical'

                },
                tooltip: {
                    followPointer: true,
                    valueSuffix: opt.dataUnit,
                    backgroundColor: {
                        linearGradient: [0, 0, 0, 60],
                        stops: [
                            [0, '#FFFFFF'],
                            [1, '#E0E0E0']
                        ]
                    },
                    borderWidth: 1,
                    borderColor: '#AAA'
                },
                plotOptions: {
                    column: {
                        pointPadding: 0.2,
                        borderWidth: 0,
                        point: {
                            events: {
                                click: function () {
                                    if (opt.clickHandler) opt.clickHandler(this);
                                }
                            }
                        },
                        dataLabels: {
                            enabled: true,
                            format: '{y}' + (opt.isPlotShowUnit ? opt.dataUnit : '')
                        },
                        pointWidth: columnWidth,
                        groupPadding: opt.grouppad
                    },
                    series: {
                        events: {
                            //控制图标的图例legend不允许切换 
                            legendItemClick: function (event) {
                                return false;
                            }
                        }
                    }
                },
                credits: credits
            });
        }
        //data是数组，格式为：[ {name:'一月',y:'10'},{name:'二 月',y:'5'}]    或[['一月',10]，['二月',5]]   
        $.fn.autoPie = function (options) {
            var opt = {
                title: '',
                data: [],            //必须项
                dataUnit: '',
                legendEnable: false,
                clickHandle: null,
                isPlotShowUnit: true
            };
            $.extend(opt, options);
            this.data('data', opt.data);
            return this.highcharts({
                chart: {
                    type: 'pie'
                },
                title: {
                    text: opt.title
                },
                series: opt.data,
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                            //useHTML: true,     //设置后，提示框就跑到了dataLabels下面去了
                            enabled: true,
                            //format: '<b>{point.name}</b>-  {point.y} ' + opt.dataUnit +
                            //'<br /><span style=font-size:9px>{point.percentage:.2f}%<span>',   
                            formatter: function () {
                                if (this.y > 0)
                                    return '<b>' + this.point.name + '</b>-  ' + this.point.y + ' ' + (opt.isPlotShowUnit ? opt.dataUnit : '') +
                                    '<br /><span style=font-size:9px>' + Math.round(this.point.percentage * 100) / 100 + '%<span>';
                                else
                                    return null;
                            }
                        },
                        point: {
                            events: {
                                click: function () {
                                    if (opt.clickHandler) opt.clickHandler(this);
                                }
                            }
                        }
                    }
                },
                tooltip: {
                    valueSuffix: opt.dataUnit,
                    followPointer: true,
                    backgroundColor: {
                        linearGradient: [0, 0, 0, 60],
                        stops: [
                            [0, '#FFFFFF'],
                            [1, '#E0E0E0']
                        ]
                    },
                    borderWidth: 1,
                    borderColor: '#AAA'
                },
                credits: credits
            });
        };
        //data是数组，格式为：[ {name:'一月',data:[1,2.2,3,4]},{name:'二 月',data:[1,2,6,6,9]}]   
        $.fn.autoLine = function (options) {
            var opt = {
                title: '',
                data: [],            //必须项
                categories: [],      //必须项
                yAxisTitle: '',
                dataUnit: '',
                legendEnable: false,
                dataLabelsEnable: true,
                clickHandle: null,
                isPlotShowUnit: true
            };
            $.extend(opt, options);
            this.data('data', opt.data);
            return this.highcharts({
                chart: {
                    type: 'line'
                },
                title: {
                    text: opt.title
                },
                xAxis: {
                    categories: opt.categories
                },
                yAxis: {
                    title: {
                        text: opt.yAxisTitle + ' (' + opt.dataUnit + ' )',
                        rotation: 0,
                        y: -15,
                        margin: -60,
                        align: 'high',
                        style: { "color": "#6D869F", "font-size": "9px" }
                    }
                },
                series: opt.data,
                plotOptions: {
                    line: {
                        dataLabels: { enabled: opt.dataLabelsEnable },
                        point: {
                            events: {
                                click: function () {
                                    if (opt.clickHandler) opt.clickHandler(this);
                                }
                            }
                        }
                    },
                    series: {
                        events: {
                            //控制图标的图例legend不允许切换 
                            legendItemClick: function (event) {
                                return false;
                            }
                        }
                    }
                },
                tooltip: {
                    valueSuffix: opt.dataUnit,
                    followPointer: true
                },
                legend: {   //图例
                    enabled: opt.legendEnable,
                    align: 'right',
                    verticalAlign: 'middle',
                    layout: 'vertical'

                },
                credits: credits
            });

        };
    }
})(jQuery);