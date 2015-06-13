/**
 * Created by QianQi on 2014/9/1.
 */
angular.module('ui.wisoft.dividedbox', ['ui.wisoft.transition']).
    constant('dividedboxConf', {
        boxMinSize: 100, // box 最小尺寸
        collapseSize: 28, // 折叠时的尺寸
        barSize: 4 // resizebar 的尺寸，与 css 中统一
    }).
    factory('dividedboxService', ['dividedboxConf','$compile', function (dividedboxConf, $compile) {
        return{
            dividedboxProductor: function (type) {
                var eventPosName, followbarStr;
                if(type == 'h'){
                    eventPosName = 'clientX';
                    followbarStr = '<span class="wi-dividedbox-followbar" ng-style="{left: \'calc(\' + resizeConf.preSizes + \' + \' + resizeConf.preResizes + \'px)\'}"></span>';
                }
                else{
                    eventPosName = 'clientY';
                    followbarStr = '<span class="wi-dividedbox-followbar" ng-style="{top : \'calc(\' + resizeConf.preSizes + \' + \' + resizeConf.preResizes + \'px)\'}"></span>';
                }
                return {
                    restrict: 'E',
                    templateUrl: function () {
                        return  'template/dividedbox/wi-dividedbox.html';
                    },
                    transclude: true,
                    replace: true,
                    scope: {},
                    controller: ['dividedboxConf', '$scope', '$transition', function (dividedboxConf, $scope, $transition) {
                        var ctrl = this;
                        $scope.type = type;
                        var to0 = type == 'h' ? 'left' : 'up', toN = type == 'h' ? 'right' : 'down';
                        //注册Box
                        var boxes = $scope.boxes = [];//子 box 的 scope 列表
                        var unDefBoxes = [],// 用户未定义的 box 的 index 的集合
                            unDefSize = '100%',// 未分配的尺寸
                            lastCollapseto = false;// 记录上个 box 是否修改折叠方向
                        // 将 box (子块的 scope) 添加到 boxes 数组中
                        ctrl.addBox = function (box) {
                            var index = $scope.boxes.length;
                            box.initBox(index);// 获取用户定义的 size，并设置 index 和 type
                            boxes.push(box);
                            /* 自适应 box 尺寸定义 */
                            box.dividedboxG.user === '' ?
                                unDefBoxes.push(index) :
                                (unDefSize += ' - ' + box.dividedboxG.user);//未指定 user，加入 unDefBoxes，否则从 unDefSize 减去
                            var avgUnDefSize = '(' + unDefSize + ') / ' + unDefBoxes.length.toString();// 未定义尺寸的子块的平均尺寸
                            angular.forEach(unDefBoxes, function (boxIndex) {//未定义尺寸的子块赋值
                                boxes[boxIndex].dividedboxG.user = boxes[boxIndex].dividedboxG.size = avgUnDefSize;
                            });
                            /* 规范折叠方向 */
                            if (index == 0) {// 第一项，未知是否有后项，禁止折叠
                                lastCollapseto = box.dividedboxG.collapseto ? true : false;
                                box.dividedboxG.collapseto = undefined;
                                box.dividedboxG.collapsed = false;
                            } else {
                                if (lastCollapseto) {// 若前一项 collapseto 曾被修改（原始值为“向前”，或第一项只能“向前”），改回“向前”折叠
                                    boxes[index - 1].dividedboxG.collapseto = to0;
                                    lastCollapseto = false;
                                }
                                if (box.dividedboxG.collapseto == to0) {// 未知是否有后项，不得“向前折叠”
                                    box.dividedboxG.collapseto = toN;
                                    lastCollapseto = true;
                                }
                                /* 初始化折叠状态 */
                                angular.forEach(boxes, function(box){
                                    box.dividedboxG.collapsed = false;// 展开所有子块
                                    box.dividedboxG.resize = 0;
                                    if(box.dividedboxG.user){
                                        box.dividedboxG.size = box.dividedboxG.user;
                                    }
                                });
                                angular.forEach(boxes, function(box, i){
                                    if(box.dividedboxG.collapseto && box.dividedboxG._collapsed){// 处理用户定义初始时折叠的子块
                                        initCollapse(i);
                                    }
                                });
                            }
                        };
                        ctrl.removeBox = function (index) {
                            if (index !== -1) {
                                boxes.splice(index, 1);
                                for (var i = index; i < boxes.length; i++) {
                                    boxes[i].index--;
                                }
                            }
                        };

                        // 处理用户定义初始时折叠的子块
                        function initCollapse(index) {
                            var box = boxes[index],
                                changeSign = (box.dividedboxG.collapseto == 'left' || box.dividedboxG.collapseto == 'up') ? 1 : -1,
                                nearbox = boxes[index + changeSign];
                            // 影响的 box 已折叠
                            if (nearbox.dividedboxG.collapsed == true) return;
                            var chargeBox = boxes[index - changeSign];// 反向相邻容器
                            // 无反向 chargeBox，或其未折叠，或其折叠方向与 box 相反时，可以折叠
                            if (chargeBox && chargeBox.dividedboxG.collapsed == true && chargeBox.dividedboxG.collapseto == box.dividedboxG.collapseto) return;
                            var str = ' + ' + box.dividedboxG.user,//折叠时附加的 size
                                currentSize = (index == $scope.boxes.length - 1) ?
                                    dividedboxConf.collapseSize - dividedboxConf.barSize :
                                    dividedboxConf.collapseSize;// 最后一行 box 无 resizebar
                            // begin to collapse
                            box.dividedboxG.size = '0px';
                            box.dividedboxG.resize = currentSize;
                            nearbox.dividedboxG.size  += str;
                            nearbox.dividedboxG.resize = 0 - currentSize;
                            box.dividedboxG.collapsed = !box.dividedboxG.collapsed;
                        }

                        //begin to resize
                        ctrl.startResize = function (index) {
                            if ($scope.resizeConf.resizable && $scope.resizeConf.resizing == false) {
                                if ($scope.boxes[index].dividedboxG.collapsed === true || $scope.boxes[index + 1].dividedboxG.collapsed === true) return;//当前 box 或影响 box 折叠时禁止 resize
                                $scope.resizeConf.resizing = true;
                                $scope.resizeConf.index = index;
                            }
                        };

                        //collapse
                        var transCollCount = 0;// 正在执行折叠动画的数量
                        ctrl.doCollapse = function (index) {
                            if (transCollCount != 0) return;// 正在进行 collapse 或 expand 操作
                            var box = boxes[index],
                                changeSign = (box.dividedboxG.collapseto == 'left' || box.dividedboxG.collapseto == 'up') ? 1 : -1,
                                nearbox = boxes[index + changeSign];
                            // 影响的 box 已折叠
                            if (nearbox.dividedboxG.collapsed == true) return;
                            var chargeBox = boxes[index - changeSign];// 反向相邻容器
                            // 无反向 chargeBox，或其未折叠，或其折叠方向与 box 相反时，可以折叠
                            if (chargeBox && chargeBox.dividedboxG.collapsed == true && chargeBox.dividedboxG.collapseto == box.dividedboxG.collapseto) return;
                            var str = ' + ' + box.dividedboxG.user,//折叠时附加的 size
                                currentSize = (index == $scope.boxes.length - 1) ?
                                    dividedboxConf.collapseSize - dividedboxConf.barSize :
                                    dividedboxConf.collapseSize;// 最后一行 box 无 resizebar
                            // begin to collapse
                            box.dividedboxG.preResize = box.dividedboxG.resize;
                            transCollCount += 2;
                            // TODO 两个动画之间的延时误差
                            collTransition(box.getElem(), function () {
                                box.dividedboxG.size = '0px';
                                box.dividedboxG.resize = currentSize;
                                box.dividedboxG.collapsed = !box.dividedboxG.collapsed;
                            });
                            collTransition(nearbox.getElem(), function () {
                                nearbox.dividedboxG.size = nearbox.dividedboxG.size + str;
                                nearbox.dividedboxG.resize = nearbox.dividedboxG.resize + box.dividedboxG.preResize - currentSize;
                            });
                        };
                        ctrl.doExpand = function (index) {
                            if (transCollCount != 0) return;// 正在进行 collapse 或 expand 操作
                            var box = boxes[index],
                                changeSign = (box.dividedboxG.collapseto == 'left' || box.dividedboxG.collapseto == 'up') ? 1 : -1,
                                str = ' + ' + box.dividedboxG.user,//折叠时附加的 size
                                nearbox = boxes[index + changeSign],
                                currentSize = (index == $scope.boxes.length - 1) ?
                                    dividedboxConf.collapseSize - dividedboxConf.barSize :
                                    dividedboxConf.collapseSize;// 最后一行 box 无 resizebar
                            // begin to expand
                            transCollCount += 2;
                            box.dividedboxG.collapsed = !box.dividedboxG.collapsed;
                            collTransition(box.getElem(), function () {
                                box.dividedboxG.size = box.dividedboxG.user;
                                box.dividedboxG.resize = box.dividedboxG.preResize;
                            });
                            collTransition(nearbox.getElem(), function () {
                                var i = nearbox.dividedboxG.size.indexOf(str);
                                nearbox.dividedboxG.size = nearbox.dividedboxG.size.slice(0, i).concat(nearbox.dividedboxG.size.slice(i + str.length));
                                nearbox.dividedboxG.resize = nearbox.dividedboxG.resize - box.dividedboxG.preResize + currentSize;
                            });
                        };
                        function collTransition(elem, change) {// 折叠动画：过渡到 change ( class 名、函数、style 集合)
                            function transitionDone() {// transition 完成后执行
                                transCollCount--;
                                elem.removeClass('wi-dividedbox-collapsing');
                            }
                            if (!!window.ActiveXObject || "ActiveXObject" in window) {// ie 不支持绑定数据触发动画
                                change();
                                transCollCount--;
                            } else {
                                elem.addClass('wi-dividedbox-collapsing');
                                var transition = $transition(elem, change);
                                transition.then(transitionDone, transitionDone);//transition （成功，失败）时执行回调函数，返回新的 promise 对象
                                return transition;
                            }
                        }
                    }],
                    link: function (scope, elem, attrs) {
                        var parentScope = scope.$parent;
                        // 尺寸类型的属性处理方法（其他组件中也存在类似方法，依赖于 scope），可接受的值：数字、数字开头、scope 对象（数字、数字开头）
                        var getSizeFromAttr = function(attr){
                            if(!attr) return;
                            var size;
                            if(/^(?:[1-9]\d*|0)(?:.\d+)?/.test(attr)){// 数字开始
                                size = attr;
                            }else{// 非数字开始，可能是 scope 对象
                                size = parentScope.$eval(attr);
                            }
                            Number(size) && (size += 'px');// 是数字则加上单位 px
                            return size;
                        };
                        var followbar = $compile(followbarStr)(scope);
                        elem.prepend(followbar);// 将 resize 时跟随的 bar 添加到 elem 中
                        elem.addClass('wi-'+ type +'dividedbox');// 添加对应方向的 class
                        elem.css({
                            'width': getSizeFromAttr(attrs['width']) || ''
                            ,'height': getSizeFromAttr(attrs['height']) || ''
                        });
                        scope.$on('$destroy', function(){
                            followbar && followbar.remove();
                        });
                        //resize
                        scope.resizeConf = {
                            resizable: (attrs['resizable'] != 'false'),// 用户定义是否可以 resizable
                            resizing: false,// 是否正在 resize
                            index: -1,// 触发 resize 的 box 的索引
                            preSizes: '0px', preResizes: -1 * dividedboxConf.barSize// resizingBar 的位置
                        };

                        /* resizing 事件处理 */
                        if(scope.resizeConf.resizable){
                            var startPos, lastPos, limit0, limit1;//初始鼠标位置，上次鼠标位置，resize 范围（limit0 ~ limit1）
                            elem.on('mousedown', function (e) {//鼠标按下 begin to resize
                                if (scope.resizeConf.resizing === true) {
                                    var index = scope.resizeConf.index;
                                    lastPos = startPos = e[eventPosName];
                                    limit0 = startPos - scope.boxes[index].chargeDiff(dividedboxConf.boxMinSize);
                                    limit1 = startPos + scope.boxes[index + 1].chargeDiff(dividedboxConf.boxMinSize);
                                    for (var i = 0; i <= scope.resizeConf.index; i++) {// 获取鼠标位置尺寸拼接串 - 即 followbar 的位置
                                        scope.resizeConf.preSizes += ' + ' + scope.boxes[i].dividedboxG.size;
                                        scope.resizeConf.preResizes += scope.boxes[i].dividedboxG.resize;
                                    }
                                    elem.on('mousemove', mousemove)
                                        .on('mouseup', stopResizing)
                                        .on('mouseleave', stopResizing);
                                }
                            });
                        }
                        function mousemove(e) {//鼠标移动 resizing
                            var current = e[eventPosName];
                            if (current >= limit0 && current <= limit1) {
                                scope.resizeConf.preResizes += current - lastPos;//坐标差值
                                lastPos = current;
                                scope.$digest();
                            }
                        }
                        function stopResizing() {//stop resizing
                            var changePos = lastPos - startPos;
                            var index = scope.resizeConf.index;
                            scope.boxes[index].dividedboxG.resize += changePos;
                            scope.boxes[index + 1].dividedboxG.resize -= changePos;
                            scope.resizeConf.resizing = false;
                            scope.resizeConf.preSizes = '0px';
                            scope.resizeConf.preResizes = -1 * dividedboxConf.barSize;
                            scope.$digest();
                            scope.boxes[index].$digest();
                            scope.boxes[index + 1].$digest();
                            elem.unbind('mousemove', mousemove)
                                .unbind('mouseup', stopResizing)
                                .unbind('mouseleave', stopResizing);
                        }
                    }
                }
            },
            dividedboxGroupProductor: function (type) {
                var require, sizeType, collapsetoRegex, domSizeName;
                if (type == 'h') {
                    require = '^wiHdividedbox';
                    sizeType = 'width';
                    collapsetoRegex = new RegExp('left|right');
                    domSizeName = 'clientWidth';
                }
                else {
                    require = '^wiVdividedbox';
                    sizeType = 'height';
                    collapsetoRegex = new RegExp('up|down');
                    domSizeName = 'clientHeight';
                }
                return {
                    restrict: 'E',
                    templateUrl: function () {
                        return  'template/dividedbox/wi-dividedbox-group.html';
                    },
                    transclude: true,
                    replace: true,
                    scope: {},
                    require: require,
                    link: function (scope, elem, attrs, divboxCtrl) {
                        var _size = (function(attr){
                            if(!attr) return;
                            if(/^(?:[1-9]\d*|0)(?:.\d+)?/.test(attr)){// 数字开始
                                var size = attr;
                                Number(size) && (size += 'px');// 是数字则加上单位 px
                                return size;
                            }
                        })(attrs[sizeType]) || '';// 用户通过 width/height 定义的值，未定义时为 ''

                        // 初始化，在 divboxCtrl.addBox(scope) 中调用，获取用户自定义属性，并使属性值合法
                        scope.initBox = function (index) {
                            scope.dividedboxG = {
                                index: index// 在 dividedbox 组中的索引
                                ,type: type// h 为横向，v 为纵向
                                ,user: _size// 用户通过 width/height 定义的值，未定义时为 ''
                                ,size: _size// string 的部分 - 模板中绑定
                                ,resize: 0// 要变化的值，单位 px - 模板中绑定
                                ,preResize: 0// collapse 前的 resize
                                ,title: attrs['wiTitle']// head 部分文字
                                ,icon: attrs['wiIcon'] || ''// head 部分图标的 url
                                ,collapseto: (attrs['collapseto'] && collapsetoRegex.test(attrs['collapseto'])) ?
                                    attrs['collapseto'].match(collapsetoRegex)[0] :
                                    undefined// 折叠方向
                                ,collapsed: (attrs['collapsed'] == 'true')// 折叠状态
                                ,_collapsed: (attrs['collapsed'] == 'true')// 初始化时，用户自定义的折叠状态
                            };
                            elem.addClass('wi-' + type + 'dividedbox-group' +
                                ((scope.dividedboxG.collapseto || scope.dividedboxG.title!== undefined) ?
                                    ' wi-dividedbox-showhead' : ''));// 未定义折叠方向及标题文字，不显示head
                        };
                        /* 注册 */
                        divboxCtrl.addBox(scope);//在 divbox 中注册
                        scope.$on('$destroy', function () {
                            divboxCtrl.removeBox(scope.dividedboxG.index);
                        });

                        /* resize：开始 resize，通知所在的 divbox 容器 */
                        scope.startResize = function () {
                            divboxCtrl.startResize(scope.dividedboxG.index);
                        };

                        /* collapse：切换当前折叠状态 */
                        scope.doCollapse = function () {
                            scope.dividedboxG.collapsed == true ?
                                divboxCtrl.doExpand(scope.dividedboxG.index) :
                                divboxCtrl.doCollapse(scope.dividedboxG.index);
                        };

                        // 返回 box 当前尺寸与指定值的差值（若差值为 负，返回 0）-在 resize 时计算可用空间时使用
                        scope.chargeDiff = function (size) {
                            return Math.max(elem[0][domSizeName] - size, 0);
                        };

                        // 获取当前 elem，折叠操作中 $transition 使用
                        scope.getElem = function () {
                            return elem;
                        }
                    }
                }
            }
        }
    }]).
/**
 * @ngdoc directive
 * @name ui.wisoft.dividedbox.directive:wiHdividedbox
 * @restrict E
 * @scope
 *
 * @description
 * wiHdividedbox 是横向分屏容器，内含若干个 wiHdividedboxGroup 子块。
 *
 * @param {boolean=} resizable 其中的 wiHdividedboxGroup 子块是否可以进行 resize，默认为 true。
 * @param {number|length=} width 宽度，从属性字符串直接读取，默认为 100%。<br />
 *   number 将自动添加单位 px。<br />
 *   length 为 number 接长度单位（相对单位和绝对单位）。<br />
 *   相对单位：em, ex, ch, rem, vw, vh, vm, %<br />
 *   绝对单位：cm, mm, in, pt, pc, px
 * @param {number|length=} height 高度，从属性字符串直接读取，默认为 100%。<br />
 *   说明同 width。
 */
    directive('wiHdividedbox', ['dividedboxService', function (dividedboxService) {
        return dividedboxService.dividedboxProductor('h');
    }]).
/**
 * @ngdoc directive
 * @name ui.wisoft.dividedbox.directive:wiVdividedbox
 * @restrict E
 * @scope
 *
 * @description
 * wiVdividedbox 是纵向分屏容器，内含若干个 wiVdividedboxGroup 子块。
 *
 * @param {boolean=} resizable 其中的 wiVdividedboxGroup 子块是否可以进行 resize，默认为 true。
 * @param {number|length=} width 宽度，从属性字符串直接读取，默认为 100%。<br />
 *   number 将自动添加单位 px。<br />
 *   length 为 number 接长度单位（相对单位和绝对单位）。<br />
 *   相对单位：em, ex, ch, rem, vw, vh, vm, %<br />
 *   绝对单位：cm, mm, in, pt, pc, px
 * @param {number|length=} height 高度，从属性字符串直接读取，默认为 100%。<br />
 *   说明同 width。
 */
    directive('wiVdividedbox', ['dividedboxService', function (dividedboxService) {
        return dividedboxService.dividedboxProductor('v');
    }]).
/**
 * @ngdoc directive
 * @name ui.wisoft.dividedbox.directive:wiHdividedboxGroup
 * @restrict E
 * @scope
 *
 * @description
 * wiHdividedboxGroup 是纵向分屏子块，其中为用户自定义内容。
 *
 * @param {string=} wiTitle 当前分屏子块的标题，可以为空字符串。
 * @param {string=} wiIcon 当前分屏字块的标题栏图标的 url，若未设置 wiTitle 属性，此属性无效。
 * @param {length=} width 当前分屏子块的宽度，从属性字符串直接读取，未定义宽度的子块将均分。<br />
 *   length 为 number 接长度单位（相对单位和绝对单位）。<br />
 *   相对单位：em, ex, ch, rem, vw, vh, vm, %<br />
 *   绝对单位：cm, mm, in, pt, pc, px
 * @param {string=} collapseto 当前分屏子块的折叠方向，未定义则默认不可折叠。<br />
 *   可选值为"left"/"right"。
 * @param {boolean=} collapsed 当前分屏子块若定义了 collapseto 属性，则此属性表示初始的折叠状态，未定义则默认未折叠。
 *
 */
    directive('wiHdividedboxGroup', ['dividedboxService', function (dividedboxService) {
        return dividedboxService.dividedboxGroupProductor('h');
    }]).
/**
 * @ngdoc directive
 * @name ui.wisoft.dividedbox.directive:wiVdividedboxGroup
 * @restrict E
 * @scope
 *
 * @description
 * wiVdividedboxGroup 是纵向分屏子容器，其中为用户自定义内容。
 *
 * @param {string=} wiTitle 当前分屏子块的标题，可以为空字符串。
 * @param {string=} wiIcon 当前分屏字块的标题栏图标的 url，若未设置 wiTitle 属性，此属性无效。
 * @param {length=} height 当前分屏子块的高度，从属性字符串直接读取，未定义高度的子块将均分。<br />
 *   length 为 number 接长度单位（相对单位和绝对单位）。<br />
 *   相对单位：em, ex, ch, rem, vw, vh, vm, %<br />
 *   绝对单位：cm, mm, in, pt, pc, px
 * @param {string=} collapseto 当前分屏子块的折叠方向，未定义则默认不可折叠。<br />
 *   可选值为"up"/"down"。
 * @param {boolean=} collapsed 当前分屏子块若定义了 collapseto 属性，则此属性表示初始的折叠状态，未定义则默认未折叠。
 *
 */
    directive('wiVdividedboxGroup', ['dividedboxService', function (dividedboxService) {
        return dividedboxService.dividedboxGroupProductor('v');
    }]);