/**
 * @ngdoc overview
 * @name ui.wisoft.tilelist
 *
 * @description
 * Tilelist网格流布局组件
 *
 * 主要功能：<br>
 * （1）支持横向和纵向排列<br>
 * （2）支持单元格自定义<br>
 *
 */
'use strict';
angular.module('ui.wisoft.tilelist',[ 'ui.wisoft.resizelistener'])
    .constant('tilelistConf',{
        'rowHeight': 30 // 默认行高
        ,'colWidth': 100 // 默认列宽
        ,'scrollBarSize': 17 // 滚动条尺寸
    })
/**
 * @ngdoc directive
 * @name ui.wisoft.tilelist.directive:wiTilelist
 * @restrict E
 *
 * @description
 *Tilelist网格流布局组件标签
 *
 * @param {array} dataprovider 数据源
 * @param {string} itemrender 自定义单元格内容 text/ng-template 的 id，其中 data 为该单元格数据源
 * @param {string=} direction 排列方向，h为横向排列，v为纵向排列，默认为 h。
 * @param {number|length=} width 组件宽度，默认为 100%。<br />
 *   number 将自动添加单位 px。<br />
 *   length 为 number 接长度单位（相对单位和绝对单位）。<br />
 *   相对单位：em, ex, ch, rem, vw, vh, vm, %<br />
 *   绝对单位：cm, mm, in, pt, pc, px
 * @param {number|length=} height 组件高度，默认为 100%。<br />
 *   说明同 width。
 * @param {number=} colcount 列数，direction="h"时，此属性失效。
 * @param {number=} colwidth 列宽，direction="v"时，若同时定义了 colcount，且横向超出显示范围，此属性将由组件重新计算。
 * @param {number=} rowcount 行数，direction="v"时，此属性失效。
 * @param {number=} rowheight 行高，direction="h"时，若同时定义了 rowcount，且纵向超出显示范围，此属性将由组件重新计算。
 */
.directive('wiTilelist', ['tilelistConf','wiResizeListener','$timeout',function(tilelistConf,wiResizeListener,$timeout){
    return {
        restrict: 'E',
        templateUrl: 'template/tilelist/tilelistTemplate.html',
        transclude: true,
        replace: true,
        scope: {
            dataprovider: '=',
            direction: '@',
            itemrender: '@'
        },
        controller: ['$scope',function($scope) {
        }],
        controllerAs: 'tilelistCtrl',
        link: function (scope,element,attrs) {
            var parentScope = scope.$parent;
            var direction = angular.lowercase(scope.direction || 'v');// 排列方向
            var shouldListen = false;
            (function(){
                var getSizeFromAttr = function(attr){
                    if(!attr) return;
                    var size = (/^(?:[1-9]\d*|0)(?:.\d+)?/.test(attr)) ?
                        attr : // 数字开始
                        parentScope.$eval(attr);// 非数字开始，可能是 scope 对象
                    Number(size) && (size += 'px');// 是数字则加上单位 px
                    return size;
                };
                var w=getSizeFromAttr(attrs['width'])
                    ,h=getSizeFromAttr(attrs['height']);
                element.css({
                    'width': w // 组件宽度（未设置有效值时显示为 100%）
                    ,'height': h // 组件高度（未设置有效值时显示为 100%）
                });
                shouldListen = (direction=='v'?// 标记是否需要监听
                    (!w || w.indexOf('%')>=0):// 纵向时，若width为百分比
                    (!h || h.indexOf('%')>=0));// 横向时，若height为百分比
            })();

            var userConf = {// 用户定义的参数
                'rowCount': Number(parentScope.$eval(attrs['rowcount'])) // 行数 -默认3
                ,'colCount': Number(parentScope.$eval(attrs['colcount'])) // 列数 -默认3
                ,'rowHeight': Number(parentScope.$eval(attrs['rowheight'])) // 行高 -px
                ,'colWidth': Number(parentScope.$eval(attrs['colwidth'])) // 列宽 -px
            };

            var rowCount, colCount, rowH, colW; // computeParams 及 computeStyle 中使用的临时变量
            var computeParams = (direction == 'h') ?
                function(){
                    /**
                     * 逻辑概述：横向显示滚动条，高度确定
                     * 宽度部分： cw = cw || 100
                     * 高度部分：
                     * rc,rh:  rh=(rc*rh>h)?(h/rc):rh,    rc=rc
                     * rc:     rh=h/rc,  rc=rc
                     * rh:     rh=rh,    rc=h/rc
                     * -:      rh=30     rc=h/rh
                     */
                    var elemBCR = element[0].getBoundingClientRect()
                        ,width = elemBCR.width
                        ,height = elemBCR.height;// 获取 tilelist 实际尺寸
                    colW = userConf.colWidth || tilelistConf.colWidth;// 列宽未定义则为默认值
                    if(userConf.rowCount){
                        rowCount = userConf.rowCount;
                        colCount = Math.ceil(scope.dataprovider.length / rowCount);// 根据数据源计算列数
                        var _height = (colW * colCount > width) ? // 超出宽度，内容高度减去 scrollbar 高度
                            height - tilelistConf.scrollBarSize : height;
                        rowH = (userConf.rowHeight && userConf.rowHeight * rowCount <= _height) ?// 定义了 rowH，且未超过容器高度
                            userConf.rowHeight :
                            Math.floor(_height/rowCount);
                    }else{
                        rowH = userConf.rowHeight || tilelistConf.rowHeight;
                        rowCount = Math.floor(height/rowH) || 1;
                        colCount = Math.ceil(scope.dataprovider.length / rowCount);// 根据数据源计算列数
                        if(rowCount > 1 && colCount * colW > width){// 出现滚动条，重新计算行高
                            rowCount = Math.floor((height-tilelistConf.scrollBarSize)/rowH) || 1;
                            colCount = Math.ceil(scope.dataprovider.length / rowCount);
                        }
                    }
                } :
                function(){
                    var elemBCR = element[0].getBoundingClientRect()
                        ,width = elemBCR.width
                        ,height = elemBCR.height;// 获取 tilelist 实际尺寸
                    rowH = userConf.rowHeight || tilelistConf.rowHeight;// 行高未定义则为默认值
                    if(userConf.colCount){
                        colCount = userConf.colCount;
                        rowCount = Math.ceil(scope.dataprovider.length / colCount);// 根据数据源计算行数
                        var _width = (rowH * rowCount > height) ? // 超出高度，内容宽度减去 scrollbar 宽度
                            width - tilelistConf.scrollBarSize : width;
                        colW = (userConf.colWidth && userConf.colWidth * colCount <= _width) ?// 定义了 colW，且未超过容器宽度
                            userConf.colWidth :
                            Math.floor(_width/colCount);
                    }else{
                        colW = userConf.colWidth || tilelistConf.colWidth;
                        colCount = Math.floor(width/colW) || 1;
                        rowCount = Math.ceil(scope.dataprovider.length / colCount);// 根据数据源计算行数
                        if(colCount > 1 && rowCount * rowH > height){// 出现滚动条，重新计算
                            colCount = Math.floor((width-tilelistConf.scrollBarSize)/colW) || 1;
                            rowCount = Math.ceil(scope.dataprovider.length / colCount);
                        }
                    }
                };
            function computeStyle(){
                computeParams();
                scope.colW = colW + 'px';
                scope.rowH = rowH + 'px';
                scope.tableW = colW * colCount + 'px';
                scope.tableH = rowH * rowCount + 'px';
                /* 根据行列，重置数据 */
                scope.dataTable = [];
                for (var i=0; i<rowCount; i++) {
                    var arr = [];
                    for (var j=0; j<colCount; j++) {
                        arr.push(scope.dataprovider[i*colCount+j]);
                    }
                    scope.dataTable.push(arr);
                }
            }

            //监听数据源引用变化
            scope.$watchCollection('dataprovider', function(newValue){
                if (!newValue) {
                    scope.dataTable = [];
                }else{
                    computeStyle();
                }
            });

            $timeout(computeStyle,0);// 若祖先元素存在自定义指令，可能造成 link 时高度未同步至DOM，延迟计算

            // tilelist 父容器或者窗口大小变化时重新计算行列 -- 需在模板和文档都设置完成后运行，否则 IE 等浏览器显示异常
            var regResizeEventListener = function(){
                if(shouldListen){// 需要监听 resize
                    wiResizeListener.addResizeListener(element[0], function () {// 监听元素大小改变
                        scope.$evalAsync(computeStyle);
                    });
                }
            };
            regResizeEventListener();
        }
    }
}]);
