angular.module('ui.wisoft.datagrid',['ui.wisoft.bindHtml', 'ui.wisoft.resizelistener'])
    .constant('dgConf',{
        'defaultColWidth': 120 // 未指定列宽时最小的列宽
        ,'miniColWidth': 60 // 拖动列时最小的列宽
        ,'pageBarHeight': 30 // pageBar 高度
        ,'headerHeight': 50 // 表格头部默认行高
        ,'rowHeight': 40 // 表格内容部分行高
        ,'scrollBarSize': 17 // 滚动条尺寸
        ,'leftColWidth': 30 // 序号、复选框列宽度
        ,'dragDivWidth': 3 // 监听拖拽的 DIV 宽度
        ,'dgBorder': 1 // 整个组件的外部边框 size
        ,'treeIndent': 16 // 树中子节点缩进
    })

    .value('excelTemplate',{'worksheet_template':'<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" xmlns:html="http://www.w3.org/TR/REC-html40"><Styles><Style ss:ID="Default" ss:Name="Normal"><Alignment ss:Vertical="Center"/><Borders/><Font ss:FontName="宋体" x:CharSet="134" ss:Size="11" ss:Color="#000000"/><Interior/><NumberFormat/><Protection/></Style><Style ss:ID="s62"><NumberFormat ss:Format="Short Date"/></Style><Style ss:ID="s63"><Font ss:FontName="宋体" x:CharSet="134" ss:Size="11" ss:Color="#000000" ss:Bold="1"/></Style></Styles><Worksheet ss:Name="Sheet1"><Table>{{COLUMNS}}{{ROWS}}</Table><WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel"><PageSetup><Header x:Margin="0.3"/><Footer x:Margin="0.3"/><PageMargins x:Bottom="0.75" x:Left="0.7" x:Right="0.7" x:Top="0.75"/></PageSetup><Unsynced/><Selected/><FreezePanes/><FrozenNoSplit/><SplitHorizontal>1</SplitHorizontal><TopRowBottomPane>1</TopRowBottomPane><ActivePane>2</ActivePane><Panes><Pane><Number>3</Number><ActiveRow>2</ActiveRow><ActiveCol>1</ActiveCol></Pane></Panes><ProtectObjects>False</ProtectObjects><ProtectScenarios>False</ProtectScenarios></WorksheetOptions></Worksheet></Workbook>'
        ,'column_template':'<Column ss:Width="{{WIDTH}}"/>'
        ,'head_template':'<Row ss:Height="14.25" ss:StyleID="s63">{{CELL}}</Row>'
        ,'row_template':'<Row ss:AutoFitHeight="0">{{CELL}}</Row>'
        ,'cell_template':'<Cell><Data ss:Type="String">{{NAME}}</Data></Cell>'
        ,'cell_template_date':'<Cell ss:StyleID="s62"><Data ss:Type="DateTime">{{NAME}}</Data></Cell>'
        ,'cell_template_number':'<Cell><Data ss:Type="Number">{{NAME}}</Data></Cell>'})

    .factory('dgService', ['excelTemplate',function (excelTemplate) {
        return{
            isEmptyRow: function(obj){
                for (var name in obj){
                    return false;
                }
                return true;
            },
            allChecked: function (dataprovider) {
                if(dataprovider && dataprovider.length > 0){
                    for(var i= 0, item; i<dataprovider.length; i++){
                        item = dataprovider[i];
                        if(!this.isEmptyRow(item) && !item.__ischecked) return false;// 有非空行未选中，则返回 true
                    }
                }
                return true;
            },
            uncheckAll:function(pagedata){
                angular.forEach(pagedata,function(data){
                    data.__ischecked=false;
                })
            },
            base64: function (string) {
                return window.btoa(unescape(encodeURIComponent(string)));
            },
            isDate: function (RQ) {
                var date = RQ+'';
                var result = date.match(/^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2})$/);

                if (result == null)
                    return false;
                var d = new Date(result[1], result[3] - 1, result[4]);
                return (d.getFullYear() == result[1] && (d.getMonth() + 1) == result[3] && d.getDate() == result[4]);
            },
            table2excel: function (rows, colwidths) {
                var col_data = '',
                    row_data = '';
                angular.forEach(colwidths, function(val){
                    col_data += excelTemplate.column_template.replace('{{WIDTH}}', val*3/4);
                });

                for (var i = 0, length = rows.length; i < length; i++) {
                    var cells = rows[i],
                        cell_data = '';
                    for(var j=0, len = cells.length; j<len; j++) {
                        if(this.isDate(cells[j])){
                            cell_data += excelTemplate.cell_template_date.replace('{{NAME}}', cells[j]+'T00:00:00.000');
                        }else if(angular.isNumber(cells[j])){
                            cell_data += excelTemplate.cell_template_number.replace('{{NAME}}', cells[j]);
                        }else{
                            cell_data += excelTemplate.cell_template.replace('{{NAME}}', cells[j]);
                        }
                    }
                    if(i===0){
                        row_data += excelTemplate.head_template.replace('{{CELL}}', cell_data);
                    }else{
                        row_data += excelTemplate.row_template.replace('{{CELL}}', cell_data);
                    }
                }

                return excelTemplate.worksheet_template.replace('{{COLUMNS}}', col_data).replace('{{ROWS}}', row_data);
            },
            table2excelByIE: function (rows, colwidths) {
                var oXL = null;
                try {
                    oXL = new ActiveXObject("Excel.Application");
                } catch(e) {
                    oXL = new ActiveXObject("ET.Application");
                }

                try {
                    var oWB = oXL.Workbooks.Add();
                    var oSheet = oWB.ActiveSheet;

                    angular.forEach(colwidths, function (val,index) {
                        oSheet.Columns(index+1).ColumnWidth = val/8;
                    })

                    for (var i = 0, length = rows.length; i < length; i++) {
                        for(var j=0, len = rows[i].length; j<len; j++) {
                            if(i===0) {
                                oSheet.Cells(i+1,j+1).Font.Bold = true;
                                oSheet.Cells(i+1,j+1).Font.Size = 11;
                            }
                            if(!this.isDate(rows[i][j]) && !angular.isNumber(rows[i][j])) {
                                oSheet.Cells(i+1,j+1).NumberFormatLocal = "@";
                            }
                            oSheet.Cells(i+1,j+1).value = rows[i][j];
                        }
                    }

                    oXL.Visible = true;
                    oXL.UserControl = true;
                } catch(e) {
                    oXL.Application.Quit();
                    console.error(e)
                } finally {
                    oXL = null;
                }

                //oXL.SaveAs("C:\\TEST.XLS");
            }
        };
    }])

/**
 * @ngdoc directive
 * @name ui.wisoft.datagrid.directive:wiDatagrid
 * @restrict E
 *
 * @description
 * 数据表格
 *
 * @param {object=} wiid 供外部调用.
 * @param {function=} wiid.getSelectedItems 获取选中条目 多选.
 * @param {function=} wiid.getSelectedItem 获取选中条目 单选.
 * @param {array=} dataprovider 数据源，若定义了 dataurl，此属性失效.
 * @param {string=} dataurl 请求数据的url，若定义了此属性，dataprovider 失效.
 * @param {string=} params 请求数据的参数（lx, keyword, start, limit）.
 * @param {string=} pagemode 分页模式：client:前台分页 server：后台分页 none:不启用分页(将隐藏分页工具条).
 * @param {function=} itemclick 单击事件.（itemclick和itemdoubleclick不能同时设置）
 * @param {function=} itemdoubleclick 双击事件.（itemclick和itemdoubleclick不能同时设置）
 * @param {object=} columns 通过数据源实现的列定义.
 * @param {number=} lockcolumns 锁定前几列.
 * @param {function=} rowcolorfunction 设置行颜色.
 * @param {boolean=} showno 显示行序号，默认为 false，不显示序号.
 * @param {boolean=} multiselect 多选，默认为 false，不显示复选框.
 * @param {string=} treefield 树节点字段.
 * @param {boolean=} collapse 初始化时树型节点是否折叠，false 时展开，默认为 true。
 * @param {function=} itemopen 节点展开，动态获取子节点数据 children[]。itemopen(data, callback))<br />参数：data 要展开的节点数据，callback 回调函数，获取 children[] 后，需手动执行 callback(data, children[]).
 * @param {number|percent=} width 宽度.指令直接从属性值attrs['width']获取数字(不含单位：px)或百分比.
 * @param {number|percent=} height 高度.指令直接从属性值attrs['height']获取数字(不含单位：px)或百分比.
 * @param {number=} headerheight 表头的行高.(不含单位：px),默认为 50.
 * @param {number=} rowheight 表内容的行高.(不含单位：px),默认为 40.
 * @param {boolean=} wordwrap 单元格内容是否支持自动换行，默认为 false，若定义了 lockcolumn，此属性失效。
 * @param {array=} pageselect 每页显示数量.默认为：[20,30,40,50,60]
 * @param {boolean=} showexcel 显示excel按钮.
 * @param {boolean=} showrefresh 显示刷新按钮.
 * @param {number=} pagebarHeight 分页栏高度.(不含单位：px),默认为 30.
 * @param {string=} pagebarrenderer 自定义工具条.
 *
 */
    .directive('wiDatagrid',['$compile','$templateCache','$http','$timeout','$q','$parse','wiResizeListener','dgService','dgConf',function($compile,$templateCache,$http,$timeout,$q,$parse,wiResizeListener,dgService,dgConf){
        return{
            restrict:'E',
            transclude:true,
            replace:true,
            scope: {
                wiid:'=',
                columns:'=',// 通过数据源设置的列定义
//                dataprovider:'=',// 数据源
                itemclick:'&',// 单击事件
                itemdoubleclick:'&',// 双击事件 - 不能与单击事件同时定义？
                treefield:'@',//树节点字段
//                collapse:'@',//树型节点是否展开，true:全不展开，false:全展开，默认不展开
                itemopen:'&',//节点展开事件

                //样式
                rowheight:'@',// 数据行行高
                hscrollpolicy:'@',// overflow-x？
                vscrollpolicy:'@',// overflow-y？
                rowcolorfunction:'&',//设置行的颜色

                //pagebar属性
                pageselect:'=',//每页显示数量数组，默认为：[20,30,40,50,60]
                dataurl:'@',//请求数据的url
                params:'=',//请求数据的参数
                success:'&',//请求成功后的回调事件
                error:'&',//请求失败后的回调事件
                showexcel:'@',//显示excel按钮
                excelexport:'&',//excel导出回调事件
                showrefresh:'@',//显示刷新按钮
                pagemode:'@',//分页模式：client:前台分页 server：后台分页 none:不启用分页(将隐藏分页工具条)
                pagebarrenderer:'@'//自定义工具条
            },
            templateUrl:'template/datagrid/datagridTemplate.html',
            controller: ['$scope',function ($scope) {
                $scope.maxLevel = 0;// 表头部分的最大层级数
                $scope.heads = [];// 第一行
                $scope.columnDefs = [];// 列集合（不含 group）

                // 子指令 column 调用定义列
                this.addColumnDef = function(column) {
                    $scope.columnDefs.push(column);
                };

                var columns = [];// 临时列定义，子指令 group 定义时从中获取 column
                // 将 childColumn 加入到临时列定义队列，供 group 指令从中获取
                this.addChildCol = function(column){
                    columns.push(column);
                };
                // 删除并返回列定义中的第一个 column
                this.getChildCol = function(){
                    return columns.shift();
                };

                // 获取表头信息 - top 部分第一行信息
                this.addHeadDef = function(head, maxLevel) {
                    $scope.heads.push(head);
                    if(maxLevel > $scope.maxLevel) $scope.maxLevel = maxLevel;
                };
            }],
            link:function(scope,element,attrs,datagridCtrl){
                //整个表格主要分为5块区域：左上，右上，左下，右下和分页工具条
                var divChildren = element.children(),
                    leftTopDiv = divChildren.eq(0),//左上div,锁定表头区域
                    rightTopDiv = divChildren.eq(1),//右上div，表头区域
                    leftBottomDiv = divChildren.eq(2),//左下div，锁定列区域
                    rightBottomDiv = divChildren.eq(3),//右下div,内容滚动区域
                    pagebarDiv = divChildren.eq(4),//分页工具条
                    dragline = divChildren.eq(5),//拖拽表头时显示的线
                    maskDiv = divChildren.eq(6),//遮罩层
                    ngTranscludeDiv = divChildren.eq(7);//ngTranscludeDiv
                var colDefs = scope.columnDefs //列定义信息，代码中访问频率较高，定义成局部变量可以提升性能
                    ,defaultColWidth = dgConf.defaultColWidth //默认列宽,未指定列宽时最小的列宽
                    ,document = window.document
                    ,gridParentElement = element[0].parentElement //datagrid 的父元素
                    ,reqParams = scope.params || {} // 向 dataurl 请求数据时需要的参数
                    ,initColsW = [] // 记录用户初始化时定义的列宽
                    ,unWidthCols = []; //未指定宽度的列下标
                /**
                 * griddata 用来保存表格数据
                 * 分为以下几种情况：
                 *  a)前台分页：griddata 保存所有页的数据,pagedata 则只保存当页数据
                 *  b)不分页：griddata 和 pagedata一样，都是保存所有页的数据
                 *  c)后台分页：griddata 和 pagedata一样，都只保存当页的数据
                 */
                var griddata = undefined
                    ,pagedata = scope.pagedata = [];//用于当页显示的数据
                /* 处理用户定义的尺寸值，使之合法 */
                var width = attrs['width']
                    ,height = attrs['height'];
                if(!angular.isNumber(width)){// 非数字
                    if(Number(width)){// 可以转换为数值
                        width = Number(width);
                    }else if (!angular.isString(width) || width.indexOf('%') == -1) {// 不合法的值都以 100% 计算
                        width = '100%';
                    }
                }
                if(!angular.isNumber(height)){// 非数字
                    if(Number(height)){// 可以转换为数值
                        height = Number(height);
                    }else if (!angular.isString(height) || height.indexOf('%') == -1) {// 不合法的值都以 100% 计算
                        height = '100%';
                    }
                }
                element.css({'width': width +(angular.isNumber(width)?'px':''),'height': height +(angular.isNumber(height)?'px':'')}); // 整个组件尺寸
                var divStyle = {
                    'topHeight': scope.$eval(attrs['headerheight']) || dgConf.headerHeight // leftTop、rightTop 的高度，获取层级后会调整
                    ,'pagebarHeight': scope.$eval(attrs['pagebarHeight']) || dgConf.pageBarHeight //pagebar高度
                    ,'leftWidth': 0
                    ,'rightWidth': 0
                };
                var staticSize= angular.isNumber(width) && angular.isNumber(height);// 尺寸固定

                /**
                 * 检测obj是否是空对象(不包含任何可读属性)。
                 * 方法既检测对象本身的属性，也检测从原型继承的属性(因此没有使hasOwnProperty)。
                 */
                var isEmptyObject = dgService.isEmptyRow;

                /**
                 * 若定义了 columns，获取定义的列，在 initScope 及 initHeadArray 前执行
                 * 遍历 children，将修改 parent 的 colspan、maxLevel、children
                 */
                var getColsByColumns = function(){// TODO 若定义了 columns 属性，是否忽略通过子指令定义的列
                    if(!scope.columns) return;
                    var maxLevel;// 记录顶层 group 的最大层级（含自身）-每个顶层 group 定义时设置为1
                    var manageChildren = function(cols, parent){
                        angular.forEach(cols, function(col){
                            var obj;
                            if(col.children){// group
                                obj = {
                                    level: parent.level + 1// 子层级为父层级+1，需在 manageChildren 前设置
                                    ,parent: parent
                                    ,type: 'childGroup' //标识此对象为非顶层的group
                                    ,text: col.headtext || ''
                                    ,colspan: 0
                                    ,children: []
                                };
                                manageChildren(col.children, obj);// 递归设置 children
                                if(obj.colspan == 0) obj.colspan = 1;// 若 group 下未定义列，默认占一列
                                parent.colspan += obj.colspan;// 将包含的列数累加到 parent
                            }else{// column
                                obj = {
                                    level: parent.level + 1// 子层级为父层级+1
                                    ,parent: parent
                                    ,type: 'childColumn' //标识此对象为非第顶层的column(直接在datagrid下的column)
                                    ,text: col.headtext || ''
                                    ,colspan: 1
                                    ,datafield: col.datafield
                                    ,itemrenderer: col.itemrenderer
                                    ,headrenderer: col.headrenderer
                                    ,width: col.width
                                    ,sortable: col.sortable
                                    ,align: col.align||'center'
                                };
                                parent.colspan ++;// parent 列数加1
                                datagridCtrl.addColumnDef(obj);// 加入列定义
                            }
                            if(obj.level > maxLevel) maxLevel = obj.level;
                            parent.children.push(obj);
                        });
                    };
                    angular.forEach(scope.columns,function(col){
                        var head;
                        if(col.children){// 顶层 group
                            maxLevel = 1;
                            head = {
                                level : 1 //顶层层级为1
                                ,type : 'topGroup'//标识此对象为顶层的group
                                ,text : col.headtext || ''
                                ,colspan: 0
                                ,children : [] // 用来存储顶层group的子元素，子元素如果是group，则子元素也有children属性
                            };
                            manageChildren(col.children, head);// 处理 children 时可能会改变 maxLevel
                            head.maxLevel = maxLevel;// 最大层级数
                            if(head.colspan == 0) head.colspan = 1;// 若 group 下未定义列，默认占一列
                        }else{// 顶层 col
                            head = {
                                level: 1 //顶层层级为1
                                ,type: 'topColumn'// 标识为顶层的column，即直接在datagrid下的column
                                ,text: col.headtext || ''
                                ,colspan: 1
                                ,datafield: col.datafield
                                ,itemrenderer: col.itemrenderer
                                ,headrenderer: col.headrenderer
                                ,width: col.width
                                ,sortable: col.sortable
                                ,align: col.align||'center'
                            };
                            datagridCtrl.addColumnDef(head);// 加入列定义
                            maxLevel = 1;
                        }
                        datagridCtrl.addHeadDef(head, maxLevel);
                    });
                };

                /* 初始化 scope */
                var initScope = function(){
                    scope.rightW = 0;// 右侧表格实际宽度 - 如不定义宽度，将导致：单元格自动隐藏失效、表格宽度异常等
                    scope.lockcolumns = Math.min((scope.$eval(attrs['lockcolumns']) || 0),colDefs.length); // 锁定的列数，默认不锁定列，若超过总列数，lockcolumn 取总列数
                    scope._wordwrap = (scope.lockcolumns>0) ? false : scope.$eval(attrs['wordwrap']);// 单元格内容是否支持自动换行，定义了锁定列时，禁止换行
                    scope.isCheckAll = false;// 是否全部选中
                    scope.showno = scope.$eval(attrs['showno']) || false;// 是否显示序号，默认不显示
                    scope.multiselect = scope.$eval(attrs['multiselect']) || false;// 是否支持多选（显示复选框列），默认不支持

                    // 分页相关
                    scope.selectedPageSize = scope.pageselect ? scope.pageselect[0] : 20;//每页显示数量默认值
                    scope.pageNum = 1;//当前页索引
                    scope.pageStart = (scope.pageNum - 1) * scope.selectedPageSize + 1;// 当前页中第一条数据的序号
                    scope.pageCount = 1;//总页数
                    scope.dataCount = 0;//总条数
                    /**
                     * 改变每页显示的数量时，跳转到第一页
                     * angular会运行完watch中的方法才更新UI,这导致size换为较大时pagesize下拉框会在页面上停留大约400～500ms
                     * 使用$timeout可以使得下拉框UI立即更新，运算后的数据绑定放到下一轮的UI更新，这样可以获得更好的用户体验，
                     * 使用$timeout会触发新的一次digest(在angularjs的$digest()里加上打印语句就可以看到加上$timeout后会执行两次digest)
                     */
                    scope.$watch('selectedPageSize',function(newValue,oldValue){
                        if(newValue != oldValue){
                            $timeout(function(){
                                getGridData();// 重新获取 griddata
                            })
                        }
                    });
//                    scope.isclear = false;//表示是否当前正在清空数据

//                    scope.collapse = (scope.collapse!='false');
                    scope.collapse = (attrs['collapse']!='false');
                    scope._rowheight = scope.rowheight||dgConf.rowHeight;//默认值，td 高度
                    /**
                     *  将所有设置的labelfunction存储在scope.lblFuns对象中
                     *  以column的datafield为key,值为设置的labfunction本身
                     */
                    scope.lblFuns=(function(){
                        var lblFuns={};
                        angular.forEach(colDefs,function(colDef){
                            if(colDef.labfunction){
                                lblFuns[colDef.datafield] = colDef.labfunction();
                            }
                        });
                        return lblFuns;
                    })();

                    // 数据源控制
                    if(scope.dataurl){ // 定义了 dataurl，则 dataprovider 失效
                        scope.dataprovider = undefined;
                    }
                    else{
                        var _setDataprovider
                            ,parentScope = scope.$parent;
                        if (attrs.dataprovider) {// 有 dataprovider 属性，监听
                            var _getDataprovider = $parse(attrs.dataprovider);
                            _setDataprovider = _getDataprovider.assign;
                            scope.dataprovider = _getDataprovider(parentScope);
                            _setDataprovider && parentScope.$watch(_getDataprovider, function(val, wasVal) {
                                if(val !== wasVal) scope.dataprovider = val;
                            });
                        }else{// 未定义 dataurl
                            scope.dataprovider = [];
                        }
                        /**
                         * 监听dataprovider的变化
                         * 用户进行了重新检索等操作改变了dataprovider后，重新跳转到第一页
                         * 下面的写法很不好，整理好getAndSetPageData后需要修改。。。。。。
                         */
                        scope.$watchCollection('dataprovider',function(newValue, oldValue){
                            if(newValue != oldValue){
                                if(!scope.dataprovider) scope.dataprovider=[];
                                //如果清空了数据，则计算页面空间可以显示多少空行，向dataprovider中添加相应数据的空对象 - 不再支持补白
                                if(scope.dataprovider.length==0){
                                    scope.isclear = true;
                                    pagedata.length=0;
                                }else{
                                    getGridData();// 重新获取数据并显示第一页
                                    scope.isclear ? scope.dataCount=0 : null;
                                    scope.isclear = false;
                                }
                                if(_setDataprovider){
                                    _setDataprovider(parentScope, newValue);// 同时修改数据源
                                }
                            }
                        });
                    }
                };

                // TODO 必须保证在所有列定义完成后运行，以确保获得正确的 maxLevel
                /**
                 * 根据 scope.maxLevel 创建用于存放 head 部分各行的数组 headarray
                 * 多表头的实现是借助于table的rowspan和colspan来实现的
                 * headarray的行数等于最大层级数
                 * 每一行都是一个数组对象，用来存储每个列td的信息
                 */
                var initHeadArray = function(){
                    var heads = [];
                    for (var h = 0; h < scope.maxLevel;) {
                        heads[h++] = [];
                    }
                    return heads;
                };
                /**
                 * 递归函数，根据表头 scope.heads（第一行） 完成 scope.headarray（所有行） 的内容填充
                 * controller中准备好的head信息是一组一组的信息，它可以是datagrid下的column或者顶层的group。
                 * initHeads函数将head信息根据其 type，补充每个td元素的信息（rowspan、colspan），并存储到headarray的恰当位置
                 * rowIndex: 当前处理的 heads 对应的行号，由父元素计算得出后传入
                 * - head.type: head 有四种类型：顶层group,顶层column，非顶层group,非顶层column
                 * - head.rowspan：行并行数，标明该td占用多少行
                 * - head.colspan：合并列数，标明该td占用多少列 - deleted 已经在列定义 columnDefs 和 heads 时已经设置好
                 * - head.rowindex：行索引，标明该td属于第几行 - deleted 初始化后不再使用，删除
                 * - head.colindex: 列索引，标明该td在整个表头中是第几列
                 */
                var initHeads=function (heads, rowIndex) {
                    angular.forEach(heads, function (head) {
                        switch (head.type){
                            //顶层的column
                            case 'topColumn':{
                                (head.datafield == scope.treefield) && (head.align = 'left');
                                head.colindex = colIndex++;
                                head.rowspan = scope.maxLevel;
                                break;
                            }
                            //顶层的group
                            case 'topGroup':{
                                head.colindex = colIndex;
                                head.rowspan = scope.maxLevel - head.maxLevel + 1;//顶层 group 的 rowspan = 总行数 - 自身包含的层级 + 1;
                                initHeads(head.children, rowIndex + head.rowspan);//递归调用，下一层的行索引 = 当前行索引 + 占用行数
                                break;
                            }
                            //非顶层的column
                            case 'childColumn':{
                                (head.datafield == scope.treefield) && (head.align = 'left');
                                head.colindex = colIndex++;
                                head.rowspan = scope.maxLevel - rowIndex;//column下已经不能有子column，所以 rowspan = 总行数 - 行索引
                                break;
                            }
                            //非顶层的group
                            case 'childGroup':{
                                head.colindex = colIndex;
                                head.rowspan=1;
                                initHeads(head.children, rowIndex + head.rowspan);//递归调用
                                break;
                            }
                        }
                        headarray[rowIndex].push(head);
                    })
                };

                /* 设置模板(左下和右下区域的模板是动态拼接的) */
                var setTemplate=function(){
                    var colItem
                        ,labFunField
                        ,treefield = scope.treefield
                        ,treeIndent = dgConf.treeIndent
                        ,leftCols = 0;// 左侧 div 总列数，最后一行（滚动条留白）合并所有列
                    // 返回 startIndex 到 endIndex 列的单元格 DOM 字符串
                    var getTds = function(startIndex, endIndex){
                        var str = '';
                        for(var i=startIndex; i < endIndex; i++){
                            colItem=colDefs[i];
                            str+='<td style="text-align:'+colItem.align+'">';
                            //设置了 itemrender 就仅使用 itemrender,不管是不是还设置了 labfunction
                            if(colItem.itemrenderer){
                                str+='<span ng-include src="\''+colItem.itemrenderer+'\'"></span></td>';
                            }else{
                                if(treefield && colItem.datafield==treefield){
                                    // 子节点空出一定宽度，这样看起来像树，空出的宽度 = 节点层级 × treeIndent
                                    str+='<span ng-if="pdata[\'__level\']" style="display:inline-block;"' +
                                        ' ng-style="{width:('+treeIndent+'*pdata[\'__level\'])+\'px\'}"></span>';
                                    // 若有子节点，显示收缩/展开的图标，!!确保children长度为0时允许展开延迟加载的节点 TODO id 不唯一
                                    str+='<span ng-if="!!pdata[\'children\']" class="treespan icon-{{pdata[\'__close\']?\'plus\':\'minus\'}}"></span>';
                                    str+='<span ng-if="pdata[\'__loading\']" class="wi-datagrid-tree-loading"></span>';// 延迟加载的数据加载时的动画
                                }
                                //labfunction是可以返回一段html的，所以这里使用了bind-html指令
                                if(colItem.labfunction){
                                    labFunField = colItem.datafield + "_lblFun";
                                    str+= '<span bind-html-unsafe=lblFuns["'+colItem.datafield+'"](pdata)></span></td>';
                                }else{
                                    str+='<span>{{pdata[\''+colItem.datafield+'\']}}</span></td>';
                                }
                            }
                        }
                        return str;
                    };

                    //左下方锁定列数据显示区域
                    var getleftBottom=function(){
                        var str="";
                        if(scope.showno){
                            leftCols++;
                            str+='<td class="wi-datagrid-keycol"><span ng-if="pdata">{{pdata["__index"]}}</span></td>';
                        }
                        if(scope.multiselect){// TODO id 不唯一
                            leftCols++;
                            str+='<td class="wi-datagrid-keycol">'+
                                '<input ng-if="pdata[\'__level\']==0"' +
                                ' type="checkbox" class="wi-checkbox" ng-checked="pdata.__ischecked" /></td>';
                        }
                        leftCols += scope.lockcolumns;
                        str += getTds(0, scope.lockcolumns);
                        return str;
                    };
                    //右下方数据显示区域
                    var getRightBottom=function(){
                        var str="",
                            start = 0;// 默认右侧表格中第一列的在 colDefs 中的索引为 0
                        if(!scope.lockcolumns){// 无锁定列
                            if(scope.showno){
                                str+='<td class="wi-datagrid-keycol"><span ng-if="pdata">{{pdata["__index"]}}</span></td>';
                            }
                            if(scope.multiselect){// TODO id 不唯一
                                str+='<td class="wi-datagrid-keycol">'+
                                    '<input ng-if="pdata[\'__level\']==0"' +
                                    ' type="checkbox" class="wi-checkbox" ng-checked="pdata.__ischecked" /></td>';
                            }
                        }else{// 有锁定列，从第一列非锁定列开始
                            start = scope.lockcolumns;
                        }
                        str += getTds(start, colDefs.length);
                        return str;
                    };

                    if(scope.lockcolumns>0){
                        leftBottomDiv.find('tr').eq(0)
                            .attr('ng-repeat','pdata in pagedata track by $index')
                            .attr('ng-if','!pdata["__hide"]')
                            .attr('data-dg-pindex','{{::$index}}')
                            .html(getleftBottom());
                        leftBottomDiv.find('tr').eq(1).find('td').attr('colspan', leftCols);// 锁定列的情况下左下需要多出一行为滚动条补齐
                    }
                    rightBottomDiv.find('tr').eq(0)
                        .attr('ng-repeat','pdata in pagedata track by $index')
                        .attr('ng-if','!pdata["__hide"]')
                        .attr('data-dg-pindex','{{::$index}}')
                        .html(getRightBottom());// IE9 报错
                    ngTranscludeDiv.remove();// 移除ng-transclude的div
                    $compile(element)(scope);
                };

                // 计算并设置表格的相关样式，高、宽、列宽、行高等 - isInit = true，初始化阶段
                var computeStyle = function(isInit) {
                    (isInit !== true) && (isInit = false);// isInit 可能为事件对象，此处规范为布尔值
                    if(!isInit && staticSize) return;// 非初始化时，若长宽均为数字，不影响内部尺寸，返回
                    var caculateWidth = function(){ //列宽计算
                        var avgColWidth //未指定列宽列的平均宽度
                            ,allCols = 0 //列宽（含border）总和
                            ,preCols = 0 //非用户自定义列的列（序号、复选框）宽总和，若显示，总在表格最左侧
                            ,leftCols = 0 //左侧表格中列宽总和
                            ,unAsignedCols; //组件可见区域中可分配的宽度
                        //处理列宽，计算已定义的列宽总和
                        angular.forEach(colDefs, function (col,index) {
                            // 初始化，将用户定义的列宽存入 initColsW，将未设置列宽的列索引存入 unWidthCols 以便之后的计算
                            if(isInit){
                                var initColW = col.width;
                                if(angular.isNumber(initColW)){// 数字
                                    initColsW.push(initColW);
                                }else if(angular.isString(initColW)){
                                    if( /^\s*\d+\.?\d*%\s*$/.test(initColW)){// 合法的 % 数
                                        initColsW.push(initColW);
                                    }else if(/^\s*\d+\.?\d*\s*$/.test(initColW)){// 合法 number
                                        initColW = Number(initColW);
                                        initColsW.push(initColW);
                                    }else{// 标记为未定义列宽
                                        initColW = undefined;
                                        initColsW.push(initColW);
                                        unWidthCols.push(index);
                                    }
                                }else{// 标记为未定义列宽
                                    initColW = undefined;
                                    initColsW.push(initColW);
                                    unWidthCols.push(index);
                                }
                            }
                            // 为用户初始化定义列宽的列确定宽度 - 全部转换为数字
                            var colW = initColsW[index];
                            if(angular.isString(colW)){// 已定义的 % 列
                                colW = Math.round(scope._width * Number(colW.replace('%','')) / 100);
                            }
                            if(angular.isDefined(colW)){// 已定义的列
                                col.width = colW;
                                allCols += colW;// 累加到列宽总和
                            }
                        });
                        scope.multiselect && (preCols += dgConf.leftColWidth);// 允许多选
                        scope.showno && (preCols += dgConf.leftColWidth);// 显示序号
                        allCols += preCols;

                        //剩余列宽总和 = datagrid 内容部分总宽度 - 纵向滚动条（始终存在）- 已经给定的列宽总和
                        unAsignedCols = scope._width - dgConf.scrollBarSize - allCols;
                        avgColWidth = Math.floor(unAsignedCols/unWidthCols.length);
                        if(avgColWidth < defaultColWidth) { //如果计算出出平均列宽小于默认列宽，直接定义为默认列宽
                            angular.forEach(unWidthCols,function(index){
                                colDefs[index].width = defaultColWidth;
                                allCols += defaultColWidth;
                                unAsignedCols -= defaultColWidth;
                            });
                        }else {
                            angular.forEach(unWidthCols, function(index, m){
                                if(m == unWidthCols.length - 1){
                                    colDefs[index].width = unAsignedCols;
                                    allCols += unAsignedCols;
                                    unAsignedCols = 0;
                                }else{
                                    colDefs[index].width = avgColWidth;
                                    allCols += avgColWidth;
                                    unAsignedCols -= avgColWidth;
                                }
                            });
                        }

                        // 计算左侧列宽总和
                        if(scope.lockcolumns) {
                            //锁定列占用的总宽度
                            leftCols += preCols;
                            for(var i = scope.lockcolumns-1; i>-1; i--) {
                                leftCols += Number(colDefs[i].width);
                            }
                        }
                        divStyle.leftWidth = leftCols;
                        divStyle.rightWidth = scope._width - leftCols;
                        scope.rightW = allCols - leftCols; // 修改右侧表格宽度
                    };

                    if(isInit){
                        // 初始化表格内容部分宽度和高度
                        scope._width = (angular.isString(width) ?
                            Math.round(gridParentElement.clientWidth * Number(width.replace('%', '')) / 100) : width) // 百分比:数值
                            - 2*dgConf.dgBorder;// 减去 datagrid 组件的边框
                        scope._height = (angular.isString(height) ?
                            Math.round(gridParentElement.clientHeight * Number(height.replace('%', '')) / 100) : height) // 百分比:数值
                            - 2*dgConf.dgBorder;// 减去 datagrid 组件的边框

                        // 计算列宽等
                        caculateWidth();
                        rightBottomDiv.css('overflow-x',scope.hscrollpolicy || 'auto');// 只在初始化时定义
                    }else{
                        if(angular.isString(width)){// 宽度若为字符串，转为数值后，还需重新计算列宽等
                            scope._width = Math.round(gridParentElement.clientWidth * Number(width.replace('%', '')) / 100) - 2*dgConf.dgBorder;
                            caculateWidth();
                        }
                        if(angular.isString(height)){// 高度若未字符串，只需转为数值
                            scope._height = Math.round(gridParentElement.clientHeight * Number(height.replace('%', '')) / 100) - 2*dgConf.dgBorder;
                        }
                    }

                    var topHeight = divStyle.topHeight // 存入局部变量，提高多次读取效率
                        ,leftWidth = divStyle.leftWidth
                        ,pagebarHeight = divStyle.pagebarHeight
                        ,bottomHeight = scope._height - topHeight - pagebarHeight; // bottom 高度：表格内容高度 - Top 高度 - 工具栏高度
                    leftTopDiv.css({width:leftWidth+'px',height:topHeight+'px'});
                    rightTopDiv.css({width:divStyle.rightWidth+'px',height:topHeight+'px',left:leftWidth+'px'});
                    leftBottomDiv.css({width:leftWidth+'px',height:bottomHeight+'px',top:topHeight+'px'});
                    rightBottomDiv.css({width:divStyle.rightWidth+'px',height:bottomHeight+'px',
                        top:topHeight+'px',left:leftWidth+'px'});
                    pagebarDiv.css({height:pagebarHeight+'px',lineHeight:(pagebarHeight-5)+'px',
                        top:scope._height - pagebarHeight+'px'});
                };

                // 将滚动条重置为初始位置 - getGridData, doPage 中调用
                var resetScrollbar = function(){
                    rightBottomDiv[0].scrollLeft = 0;
                    rightBottomDiv[0].scrollTop = 0;
                };
                // 设置当前页绑定所需要的数据，添加序号，将树形数据转为普通 - getGridData, doPage, sort 中调用
                var setPageData = function(deferred) {
                    var pageNum = scope.pageNum
                        ,pageSize = scope.selectedPageSize;
                    scope.pageStart = (pageNum - 1) * pageSize + 1;// 当前页中第一条数据显示的序号
                    var temp = [];
                    pagedata.length = 0;// 清空当页数据
                    if(scope.pagemode === 'none' || scope.pagemode === 'server'){// 不分页或后台分页
                        temp = griddata;
                    }
                    else{// 前台分页，从 griddata 中分离出当前页数据
                        var start = (pageNum-1) * pageSize;
                        temp = griddata.slice(start, start + pageSize);// 返回区间内的数据
                    }

                    /**
                     * 为根节点加上额外的属性，方便模板的数据绑定
                     * __level：节点行所属层级，根节点行的 level 为 0，根据层级递增
                     * 根节点属性：
                     * __index：行索引（只有根节点行显示，其余节点行是不显示的） - 应在其他位置定义，非 treefield 表格应直接跳出
                     * 子节点属性：
                     * __hide：是否显示
                     * 父节点属性：
                     * __close：是否展开子树
                     */
                    if(scope.treefield) {
                        /**
                         * 数据源由树形转普通。
                         * 节点数据存储在 children 属性中
                         *  @param data 当前层级的行数据集合
                         *  @param lvl 树型 datagrid 节点行所属层级
                         */
                        (function tempInitData(data, lvl) {
                            for (var i = 0; i < data.length; i++) {
                                var node = data[i];
                                if(isEmptyObject(node)) return;
                                if(lvl){// 子节点行
                                    node['__hide'] = scope.collapse;
                                    node['__level'] = lvl;
                                }else{// 根节点行
                                    node['__index'] = scope.pageStart + i;
                                    node['__level'] = 0;
                                }
                                pagedata.push(node);
                                if (node['children']) {
                                    node['__close'] = scope.collapse;
                                    tempInitData(node['children'], node['__level'] + 1);
                                }
                            }
                        })(temp);
                    }
                    else {
                        angular.forEach(temp, function(node, i){
                            if(isEmptyObject(node)) return;
                            node['__index'] = scope.pageStart + i;
                            node['__level'] = 0;
                            pagedata.push(node);
                        });
                    }
                    // 不进行行补白：resize 时引起 num 变化；数据源变化或翻页，引起 visibleRowCount 和 dataCount 变化；展开/关闭树节点，引起 visibleRowCount 变化；支持自动换行时，无法确定 num
                    scope.isCheckAll = dgService.allChecked(pagedata);//是否全部选中 TODO 待查验

                    /**
                     * 设置 pagedata,处理行的 rowcolorfunction
                     * 如果设置了 rowcolorfun 则对每行数据添加一个 __rowcolor 属性
                     */
                    if(attrs.rowcolorfunction){
                        // datagrid 的行颜色 function
                        var rowColorFun = scope.rowcolorfunction();
                        angular.forEach(pagedata, function(rowObj){
                            !isEmptyObject(rowObj) ?
                                rowObj.__rowcolor=rowColorFun(rowObj) :
                                null;
                        })
                    }

                    deferred && deferred.resolve('success');
                };
                // 从 dataurl 获取第 pagenum（从 1 开始）页的数据
                var getDataFromUrl = function(pagenum, deferred){
                    var pageSize = scope.selectedPageSize;
                    angular.extend(reqParams, {
                        start: pageSize * (pagenum-1) // 数据起始索引
                        ,limit: ("server" === scope.pagemode) ? // 后台分页
                            pageSize : // 当前页最多显示的数据行数
                            -1 // 前台分页或不分页，不限制行数
                    });
                    $http.post(scope.dataurl,reqParams)// 根据dataurl和参数获取列表数据
                        .success(function(result) {
                            if(result.success) {// 查询成功
                                if(reqParams.start==0) {
                                    scope.dataCount = result.data.total;// 总数据数
                                    scope.pageCount = Math.max(Math.ceil(result.data.total/pageSize),1);// 总页数
                                }
                                griddata = result.data.rows;
                                deferred.resolve('success');
                            } else {// 查询失败
                                console.error('wiDataGrid', result.msg);// 输出错误信息
                            }
                        });
                };
                // 设置 griddata，并显示首页数据（初始化、数据源变化、后台分页翻页、刷新时调用），将改变 scope.dataCount,scope.pageCount
                var getGridData = function(){
                    maskDiv.css('visibility', 'visible');// 加载过程中显示遮罩层
                    var deferred = $q.defer()
                        ,pagenum = 1;
                    griddata = undefined;
                    scope.pageNum = pagenum;
                    if(scope.dataurl){// 从 dataurl 获取数据
                        getDataFromUrl(pagenum, deferred);
                    }else{// 从 dataprovider 获取数据
                        griddata = scope.dataprovider;
                        !griddata && (griddata=[]);
                        scope.dataCount = griddata.length;
                        scope.pageCount = Math.max(Math.ceil(scope.dataCount/scope.selectedPageSize),1);// 总页数
                        deferred.resolve('success');
                    }
                    deferred.promise
                        .then(function(){
                            setPageData();
                            resetScrollbar();
                            maskDiv.css('visibility','hidden');
                        });
                };

                //刷新事件处理，刷新后跳转到首页
                scope.dorefresh = function () {
                    getGridData();
                };
                // 跳转到第 pagenum 页（不分页时不会显示触发元素，故不考虑）
                scope.doPage = function (pagenum) {
                    pagenum = Math.min(pagenum, scope.pageCount);// 跳转页码不能超过总页码
                    pagenum = Math.max(pagenum, 1);// 跳转页码不能小于 1
                    if(pagenum == scope.pageNum) return;// 当前页，不需跳转
                    maskDiv.css('visibility','visible');// 加载过程中显示遮罩层
                    scope.pageNum = pagenum;
                    var deferred = $q.defer();
                    ('server' === scope.pagemode) ?
                        getDataFromUrl(pagenum, deferred) : // 后台分页
                        deferred.resolve('success'); // 前台分页
                    deferred.promise.then(function(){
                        setPageData();
                        resetScrollbar();// 将滚动条重置为初始位置
                        maskDiv.css('visibility','hidden');
                    });
                };
                //直接跳转页面处理，对应键盘事件
                scope.gotoPage = function(event){
                    if(event.keyCode == 13){// Enter
                        scope.doPage(parseInt(angular.element(event.target).val()));
                    }
                };

                // 当前排序字段，正序or倒序
                scope.sortcolumn = {'datafield':undefined,'direction':undefined};
                /**
                 * 排序，根据 index 列排序
                 * 前台分页：griddata 排序，更新 pagedata
                 * 后台分页：对当前页（pagedata 与 griddata 相同）排序
                 * 不分页：对当前页（pagedata 与 griddata 相同）排序
                 */
                scope.sort = function(index) {
                    var columnItem = scope.columnDefs[index];
                    if(!columnItem.sortable) return;// 不可排序
                    var datafield = columnItem.datafield;
                    // 如果是当前字段，则反序
                    if(scope.sortcolumn.datafield == datafield) {
                        scope.sortcolumn.direction = -scope.sortcolumn.direction;
                    } else {
                        scope.sortcolumn.datafield = datafield;
                        scope.sortcolumn.direction = 1;
                    }
                    griddata.sort(function(x,y) {
                        var _x = x[datafield],
                            _y = y[datafield],
                            _dir = scope.sortcolumn.direction;
                        if (_x < _y)        { return -_dir; }
                        else if (_x > _y)   { return _dir; }
                        return 0;
                    });
                    setPageData();// 更新当前页的数据
                };

                // 全选checkbox的处理，仅针对当前页
                scope.checkAll = function(){
                    var chkState = scope.isCheckAll = !scope.isCheckAll;
                    for(var i=pagedata.length-1;i>-1;i--){
                        //非空对象才处理
                        !isEmptyObject(pagedata[i]) ?
                            pagedata[i].__ischecked = chkState :
                            null;
                    }
                };

                /**
                 * 向 wiid 对象添加方法
                 * 使得当组件声明了wid以后，可以使用类似 wiid.someFun() 的方式来调用 datagrid 的某些常用方法和属性
                 * 注意：datagrid必须已经显示完毕才能调用wid中的方法
                 */
                var setWiid = function(){
                    /* 开放接口，需定义双向绑定的 wiid */
                    if(scope.wiid && angular.isObject(scope.wiid)){
                        //取得选中行的行数据
                        scope.wiid.getSelectedItems=function(){
                            var selectedItems = [];
                            angular.forEach(pagedata,function(item){
                                item.__ischecked ? selectedItems.push(item) : null;
                            });
                            return selectedItems;
                        };
                        scope.wiid.getSelectedItem=function(){
                            for(var i=0;i<pagedata.length;i++){
                                if(pagedata[i].__ischecked)
                                    return pagedata[i];
                            }
                        };
                        scope.wiid.refresh = function(){
                            scope.dorefresh();
                        };
                        scope.wiid.reCompute = (staticSize) ?// 固定尺寸，不需监听 resize
                            angular.noop : function(){
                            regResizeEventListener();
                        };
                    }
                };

                /* 拖动列时的事件处理 */
                var regDragColumnEventListener = function(){
                    var miniColWidth = dgConf.miniColWidth,//拖动列时最小的列宽
                        currentTd = null,// 当前拖动的 td 对象
                        currentCol,// 当前拖拽列数据源
                        startX= 0,// 开始拖拽时的鼠标位置，鼠标按下时获取
                        isLock,// 正在移动的是锁定列
                        pleft;// datagrid 内容起始位置，鼠标按下时获取

                    var mouseMoveFun = function (e) { // datagrid 鼠标移动事件，开始拖拽后才监听
                        if(!currentTd || !currentCol) return;
                        var distance = e.clientX - startX,
                            curItemBcr = currentTd.getBoundingClientRect();
                        // 不能小于最小列宽
                        var toX = Math.max(curItemBcr.right + distance, curItemBcr.left + miniColWidth)
                            - Math.ceil(dgConf.dragDivWidth/2) - pleft;// 减去 datagrid 本身的位置，及 follow 的 宽/2
                        // 超出 datagrid 范围
                        if(toX > scope._width) return;
                        dragline.css('left',toX + 'px');// followbar 的位置
                    };
                    var mouseUpFun = function(e){
                        if(!currentTd || !currentCol) return;
                        var index = currentCol.colindex // 拖拽列 index
                            ,oldValue = colDefs[index].width // 所在原始宽度
                            ,newValue;
                        newValue = Math.max(oldValue + e.clientX - startX, miniColWidth);

                        var indexInUnCols = unWidthCols.indexOf(index);
                        if(indexInUnCols>=0){// 原始未定义列宽
                            unWidthCols.splice(indexInUnCols, 1);
                        }
                        initColsW[index] = newValue;

                        var distance = newValue - oldValue;
                        colDefs[currentCol.colindex].width = newValue;

                        if(isLock){// resize 的是左侧锁定列，需修改各 div 宽度
                            divStyle.leftWidth += distance;
                            divStyle.rightWidth -= distance;
                            leftTopDiv.css({width:divStyle.leftWidth +'px'});
                            rightTopDiv.css({width:divStyle.rightWidth+'px',left:divStyle.leftWidth+'px'});
                            leftBottomDiv.css({width:divStyle.leftWidth+'px'});
                            rightBottomDiv.css({width:divStyle.rightWidth+'px',left:divStyle.leftWidth+'px'});
                        }else{// resize 的是右侧内容列，需修改右侧 table 宽度
                            scope.rightW += distance;
                        }
                        scope.$digest();// 更新视图中 colDefs[currentCol.colindex].width 及 rightW
                        currentTd = currentCol = undefined;
                        dragline.css('display','none');
                        element.removeClass('wi-resizing wi-unselectable');
                        // 结束监听
                        element[0].removeEventListener('mousemove',mouseMoveFun);
                        document.removeEventListener('mouseup',mouseUpFun);
                    };
                    // 拖拽开始
                    scope.startColumnDrag = function(e, colItem, isLockCol) {
                        if(!currentTd) return;
                        isLock = isLockCol;
                        pleft = element[0].getBoundingClientRect().left + dgConf.dgBorder;
                        /**
                         * x:设置或者是得到鼠标相对于目标事件的父元素的外边界在x坐标上的位置。
                         * clientX:相对于客户区域的x坐标位置，不包括滚动条，就是正文区域。
                         * offsetX:设置或者是得到鼠标相对于目标事件的父元素的内边界在x坐标上的位置。
                         * screenX:相对于用户屏幕。
                         */
                        startX = e.clientX;// 开始拖拽时的鼠标位置
                        dragline.css({
                            left:(currentTd.getBoundingClientRect().right - pleft - Math.ceil(dgConf.dragDivWidth/2)) + 'px',// resizebar 的右侧显示
                            display:'block',
                            height:scope._height - divStyle.pagebarHeight + 'px'});
                        element.addClass('wi-resizing wi-unselectable');

                        currentCol = colItem;// 标记触发拖动的单元格 head 对象
                        document.addEventListener('mousemove',mouseMoveFun);// 拖拽中
                        document.addEventListener('mouseup',mouseUpFun);// 拖拽结束
                    };

                    scope.headMousemove = function(e){// 未进行拖拽，根据鼠标位置判断鼠标外观
                        if(!!currentCol) return;// 若正在拖拽，直接返回
                        var tdElem = e.target
                            ,x = e.clientX;
                        while(tdElem.tagName != 'TD'){
                            if(tdElem.tagName == 'BODY'){
                                element.removeClass('wi-resizing');
                                currentTd = undefined;
                                return; // 上层未找到 td，可能在 table 外部移动
                            }
                            tdElem = tdElem.parentNode;
                        }
                        var bcr = tdElem.getBoundingClientRect();
                        if(x > bcr.right - dgConf.dragDivWidth && x <= bcr.right){
                            element.addClass('wi-resizing');
                            currentTd = tdElem;
                        }else{
                            element.removeClass('wi-resizing');
                            currentTd = undefined;
                        }
                    };
                    scope.headMouseleave = function(){
                        if(!currentTd || !currentCol) // 未开始拖拽，移出单元格时，鼠标变回默认
                            element.removeClass('wi-resizing');
                    };
                };

                //右下方数据区域的滚动事件处理（存在锁定列时需要保持同步）
                var regScrollEventListener = function(){
                    // 记录当前数据滚动条位置
                    var scrollPosition = {'currentTop':0,'currentleft':0};
                    // 监听滚动条滚动事件
                    rightBottomDiv[0].addEventListener('scroll', function (event) {
                        var d=event.target;
                        //垂直滚动
                        if(d.scrollTop != scrollPosition.currentTop){
                            scrollPosition.currentTop = leftBottomDiv[0].scrollTop = d.scrollTop;
                        }
                        //水平滚动
                        if(d.scrollLeft != scrollPosition.currentleft){
                            scrollPosition.currentleft = rightTopDiv[0].scrollLeft = d.scrollLeft;
                        }
                    });
                };

                /**
                 * 注册行点击处理事件
                 * 将datagrid事件注册在div上，这样可以减少事件的数量，降低内存使用
                 */
                var regItemClickEventListener = function(){
                    //调整垂直滚动条位置，防止点击的数据在列表底部时，展开后数据看不到
//                    var adjustVScrollbarPosition=function(event,item){
//                        if(!item.__close){
//                            var pagebarY =pagebarDiv[0].getBoundingClientRect().top;//分页工具条的Y坐标
//                            var eventY = event.y;//事件源的Y坐标
//                            var valuedHeight=pagebarY-eventY-scope._rowheight;//可用区域高度(要减去事件源占用的行高)
//                            var needHeight=scope._rowheight*item.children.length;//显示子节点需要的高度
//                            //如果可用区域高度不够用，则将滚动条向下滚动相应的偏移量+17(滚动条高度)
//                            if(valuedHeight<needHeight){
//                                rightBottomDiv[0].scrollTop=rightBottomDiv[0].scrollTop+(needHeight-valuedHeight)+dgConf.scrollBarSize;
//                            }
//                        }
//                    };

                    /**
                     * 延迟加载时，动态添加节点
                     * addNode是一个回调函数，页面注册了itemopen方法后才会调用
                     * @param node 点击的节点
                     * @param children 新获取的子节点数据
                     */
                    var addNode = function (node, children) {
                        node['__loading'] = false;
                        if(angular.isArray(children)) {
                            var index = pagedata.indexOf(node);
                            angular.forEach(children, function (child) {
                                //如果子节点仍有子孙，则将其设置为收缩状态
                                if(child['children']) {
                                    child['__close'] = true;
                                }
                                child['__hide'] = false;//节点设置为显示
                                child['__level'] = node['__level'] ? node['__level']+1 : 1;

                                //在当前节点后加入准备好的节点数据
                                pagedata.splice(index+1, 0, child);
                                index++;
                            });

                            //将子节点数据存储在当前点击节点的children属性中
                            node['children'] = children;
                        }
                        scope.$digest();
                    };

                    /**
                     * treeGrid节点折叠展开
                     */
                    var toggleNode = function (node) {
                        node['__close'] = !node['__close'];
                        /**
                         * 子节点总数为 0，且支持延迟加载（设置了 itemopen），展开时调用 itemopen 方法
                         * 完成后通过回调 addNode 完成子节点显示
                         */
                        if(node['children'] && node['children'].length==0 && !node['__close'] && scope.itemopen()) {
                            node['__loading'] = true;
                            scope.itemopen()(node, addNode);
                        }
                        // 展开或收缩
                        else {
                            // 展开或收缩所有子孙
                            (function setChildrenHide(children, hide) {
                                angular.forEach(children, function (child) {
                                    child['__hide'] = hide || !child['__hide'];//节点是否显示取反
                                    //如果是当前操作是收缩并且子节点还有子孙是未收缩状态，则递归处理，最终将每一个节点的__close属性都设置为true
                                    if(node['__close'] && child['children'] && !child['children']['__close']) {
                                        child['__close'] = true;
                                        setChildrenHide(child['children'], true);
                                    }
                                })
                            })(node['children']);
                        }
                    };

                    var doItemClick = function (event) {
                        var ele = event.target;
                        if(!ele) return;
                        var isTreespan=((' ' + ele.className +  ' ').indexOf('treespan') >= 0);// 判断事件源，折叠/展开操作
                        while(ele.tagName != 'TR' && ele.parentElement){// 循环查找事件源的父元素直至找到 TR 元素,data-dg-pindex 属性保存了该行索引
                            ele = ele.parentElement;
                        }
                        if(ele.tagName != 'TR' || ele.getAttribute('data-dg-pindex') == null) return;// 非 tr 或无 data-dg-pindex 属性
                        var idx = Number(ele.getAttribute('data-dg-pindex'))
                            ,item = pagedata[idx];// 点击的行对应的数据
                        //空白行不处理
                        if(isEmptyObject(item)) return;
                        //如果点击的是树的展开或收缩图标则停止事件冒泡
                        if(isTreespan){
                            event.stopPropagation();
                            toggleNode(item);
                            scope.$digest();
                            //调整垂直滚动条位置，防止点击的数据在列表底部时，展开后数据看不到
//                            setTimeout(function(){//ui更新后调整，不需要刷新数据所以不用$timeout
//                                adjustVScrollbarPosition(event,item);
//                            },0);
                        }
                        else{
                            // 若不支持多选，将选中一行时，取消所有选中行
                            if(!item.__ischecked && !scope.multiselect){
                                dgService.uncheckAll(pagedata);
                            }
                            item.__ischecked = !item.__ischecked;// 切换当前行选中状态
                            scope.isCheckAll = dgService.allChecked(pagedata);// 是否全部选中
                            scope.$digest();//更新显示
                            attrs.itemclick && scope.itemclick()(item, event);
                        }
                    };

                    var doItemDblClick = function (event) {
                        var ele = event.target;
                        if(!ele) return;
                        while(ele.tagName != 'TR' && ele.parentElement){// 循环查找事件源的父元素直至找到 TR 元素,data-dg-pindex 属性保存了该行索引
                            ele = ele.parentElement;
                        }
                        if(ele.tagName != 'TR' || ele.getAttribute('data-dg-pindex') == null) return;// 非 tr 或无 data-dg-pindex 属性
                        var idx = Number(ele.getAttribute('data-dg-pindex'))
                            ,item = pagedata[idx];// 点击的行对应的数据
                        //空白行不处理
                        if(isEmptyObject(item)) return;
                        attrs.itemdoubleclick && scope.itemdoubleclick()(item);
                    };

                    if(attrs.itemdoubleclick) {
                        leftBottomDiv[0].addEventListener('dblclick',doItemDblClick);
                        rightBottomDiv[0].addEventListener('dblclick',doItemDblClick);
                    }
                    leftBottomDiv[0].addEventListener('click',doItemClick);
                    rightBottomDiv[0].addEventListener('click',doItemClick);
                };

                // 导出excel
                scope.export2excel = function(event){
                    // 获取数据测试(当前页)
                    // TODO
                    var rowdata=[],celldata=[],colwidths=[];

                    angular.forEach(scope.columnDefs, function (col) {
                        celldata.push(col.text);
                        colwidths.push(col.width);
                    });
                    rowdata.push(celldata);

                    angular.forEach(pagedata, function (data) {
                        celldata = [];
                        angular.forEach(scope.columnDefs, function (col) {
                            if(col.labfunction){
                                celldata.push(col.labfunction()(data));
                            }else{
                                celldata.push(data[col.datafield]);
                            }
                        });
                        rowdata.push(celldata);
                    });

                    // 获取需要导出的数据，当前页、某几页或全部，上限500条

                    // 调用labFunction转换数据

                    // 将数据转换成xml或csv后导出

                    // 方法一
//                window.open('data:application/vnd.ms-excel,\ufeff'
//                    + divchildren[3].innerHTML.replace(/ /g, '%20'));

                    // 方法二
                    if(navigator.userAgent.indexOf("MSIE")>0) {
                        dgService.table2excelByIE(rowdata, colwidths);
                    } else {
                        var uri = 'data:application/vnd.ms-excel;base64,';
                        event.currentTarget.href = uri + dgService.base64(dgService.table2excel(rowdata, colwidths));
                    }
                };

                //datagrid父容器或者窗口大小变化时改变datagrid大小 -- 需在模板和文档都设置完成后运行，否则 IE 等浏览器显示异常
                var regResizeEventListener = function(){
                    // 监听 datagrid 大小改变
                    wiResizeListener.addResizeListener(gridParentElement,function(){
                        scope.$evalAsync(computeStyle);// 原使用apply，可能在其他组件$watch触发的事件中，故修改
                    });
//                    wiResizeListener.addResizeListener(document, function () {
//                        scope.$apply(computeStyle);
//                    });  // TODO 是否需要删除
                };

                /** ----- link 主体流程 ----- **/
                // 若定义了 columns，获取定义的列，在 initScope 及 initHeadArray 前执行
                getColsByColumns();
                // TODO 因依赖 colDefs 及 maxLevel，必须保证在所有列定义完成后运行，以确保获得正确的 maxLevel
                divStyle.topHeight *= scope.maxLevel;// top 部分高度根据 maxLevel 调整
                // 初始化 scope
                initScope();
                var headarray = scope.headarray = initHeadArray(),//保存头部信息，长度等于最大层级数，其元素对应每一行的列数据集合
                    colIndex = 0;//记录头部的每个td在整个头部中所处的列索引位置
                // 整理datagrid的多表头信息，从第 0 行开始
                initHeads(scope.heads, 0);
                // 设置模板(左下和右下区域的模板是动态拼接的)
                setTemplate();
                // 计算并设置表格的相关样式，高、宽、列宽、行高等 - 参数 true，初始化阶段
                $timeout(function(){computeStyle(true)},0);// 若祖先元素存在自定义指令，可能造成 link 时高度未同步至DOM，延迟计算
                getGridData();// 获取数据并显示第一页
                setWiid();
                /* 拖动列时的事件处理 */
                regDragColumnEventListener();
                // 右下方数据区域的滚动事件监听（存在锁定列时需要保持同步）
                regScrollEventListener();
                // 行点击事件监听
                regItemClickEventListener();
                //datagrid父容器或者窗口大小变化时改变datagrid大小 -- 需在模板和文档都设置完成后运行，否则 IE 等浏览器显示异常
                !staticSize && regResizeEventListener();
            }
        }
    }])

/**
 * @ngdoc directive
 * @name ui.wisoft.datagrid.directive:wiDatagridColumn
 * @restrict E
 *
 * @description
 * 列
 *
 * @param {string=} headtext 标题文本.
 * @param {string=} datafield 字段名称.
 * @param {string=} itemrenderer 自定义单元格.通过 &lt;script type=&quot;text/ng-template&quot;&gt;&lt;/script&gt; 嵌入模板内容，其中 pdata 对应该行数据.
 * @param {string=} headrenderer 自定义标题.通过 &lt;script type=&quot;text/ng-template&quot;&gt;&lt;/script&gt; 嵌入模板内容.
 * @param {function=} labfunction 自定义单元格文本.labfunction(data),data 对应该行数据,返回要显示的内容.
 * @param {number|percent=} width 宽度.指令直接从属性值 attrs['height'] 获取数字(px)或百分比.
 * @param {boolean=} sortable 排序.
 * @param {string=} align 对齐方式.
 */
    .directive('wiDatagridColumn', function () {
        return {
            restrict:'E',
//            template:"<div></div>",
            scope: {
                labfunction:'&'//自定义单元格内容处理（格式化等）函数
            },
            require:'^wiDatagrid',
            link: function (scope,element,attrs,datagridCtrl) {
                var col = {// 列信息
                    text: attrs['headtext']
                    ,colspan: 1
                    ,datafield : attrs['datafield']
                    ,itemrenderer : attrs['itemrenderer']
                    ,headrenderer : attrs['headrenderer']
                    ,width : attrs['width']
                    ,sortable : attrs['sortable']
                    ,align : attrs['align']|| 'center'
                };
                attrs.labfunction ? col.labfunction = scope.labfunction:null;//设置了labfunction才放到col中，scope.labfunction永远是有值的

                /**
                 * 如果wi-datagrid-column没有放在group中，则将其加入到头部定义的数组中
                 * 不设置rowspan，其 rowspan = scope.maxLevel，需要在datagrid中进行设置
                 */
                if(element[0].parentElement.tagName != "WI-DATAGRID-COLUMN-GROUP") {
                    col.type = 'topColumn';
                    col.level = 1;
                    datagridCtrl.addHeadDef(col, 1);
                }else{
                    col.type = 'childColumn';
                    datagridCtrl.addChildCol(col);
                }
                datagridCtrl.addColumnDef(col);
            }
        };
    })

/**
 * @ngdoc directive
 * @name ui.wisoft.datagrid.directive:wiDatagridColumnGroup
 * @restrict E
 *
 * @description
 * 多表头分组
 *
 * @param {string=} text 标题文本.
 *
 */
    .directive('wiDatagridColumnGroup', function () {
        return {
            restrict:'E',
            require:'^wiDatagrid',
            link: function (scope,element,attrs,datagridCtrl) {
                // 只处理顶层的wi-datagrid-column-group,非顶层直接返回不做处理
                if(element[0].parentElement.tagName == "WI-DATAGRID-COLUMN-GROUP") return;

                var group = {
                    level: 1 //顶层group层级为1
                    ,type: 'topGroup' //标识此对象为顶层的group
                    ,text: attrs['text'] || ''
                    ,colspan: element.find('wi-datagrid-column').length //group占用的列数总是等于其所有子元素中column的数量，column总是只占用1列.
                    ,children: []//用来存储顶层group的子元素，子元素如果是group，则子元素也有children属性
                };

                var maxLevel = 1;// 最大层级，用来表示顶层 group(含本身) 的层级
                //通过递归设定每个column-group的信息，将其存储在顶层的group对象中
                var initGroup = function(children, parent){
                    angular.forEach(children, function (child) {
                        var obj;
                        // 子为 wi-datagrid-column-group
                        if(child.tagName == 'WI-DATAGRID-COLUMN-GROUP') {
                            obj = {
                                level: parent.level + 1 // 子层级为父层级+1，需在对 children 调用 initGroup 前设置
                                ,type: 'childGroup' //标识此对象为非顶层的group
                                ,text: child.getAttribute('TEXT') || ''
                                ,colspan: angular.element(child).find('wi-datagrid-column').length // -- 可能为 0
                                ,children: []//用来存储子元素信息
                            };
                            child.children && initGroup(child.children, obj);// 递归设置children
                        }
                        // 子为 wi-datagrid-column
                        else if(child.tagName == 'WI-DATAGRID-COLUMN') {
                            obj = datagridCtrl.getChildCol();// 从 临时列定义 中删除并返回第一个定义的列
                            obj.level = parent.level + 1;// 子层级为父层级+1
                        }
                        obj.parent = parent;
                        maxLevel = Math.max(maxLevel, obj.level);
                        parent.children.push(obj);
                    });
                };
                initGroup(element[0].children, group);
                group.maxLevel = maxLevel;//maxLevel 表示顶层 group 拥有的层级数
                datagridCtrl.addHeadDef(group, maxLevel);
            }
        };
    });