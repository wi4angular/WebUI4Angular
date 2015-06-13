/**
 * @ngdoc overview
 * @name ui.wisoft.tabset
 *
 * @description
 * Tab标签组件
 */
'use strict';
angular.module('ui.wisoft.tabset', [])
    .constant('tabsetConf',{
        'liBefore': 2 // li: margin-right: 2px
    })
    .controller('TabsetController', ['$scope','$attrs','$timeout','tabsetConf', function($scope,$attrs,$timeout,tabsetConf) {
        // 是否是纵向 tabset - tab 添加需知道 tabset 的方向，故在 controller 中判断
        $scope.vertical = $attrs.hasOwnProperty('vertical') && $attrs['vertical']!='false';
        // 是否允许关闭，对所有非固定 tab 生效
        $scope.closeable = !$attrs.hasOwnProperty('closeable') || $attrs['closeable']!='false';

        var ctrl = this
            ,attrNames = ctrl.attrNames = $scope.vertical ? // 确定横向、纵向要操作的 DOM 属性
            { offset: 'offsetHeight', pos: 'top', size:'height'}:// offsetHeight 包括边框
            { offset: 'offsetWidth', pos: 'left', size:'width'}
            ,tabs = $scope.tabs = [] //tab 的 scope 集合
            ,tabSizes = ctrl.tabSizes = [] // tab 的 size 集合
            ,closeFun = $scope.onClose() // 关闭 tab 时的回调函数
            ,autotabid = 'auto-tab-id-' // -------------------------
            ,autotabnum = 0; // -------------------------
        ctrl.sumSize = 0; // 记录应显示的 li 的总 size
        ctrl.rightClickTab = undefined;//右击时选中的tab对象

        ctrl.selectFun = $scope.onSelect(); // 选中后的回调方法
        ctrl.deselectFun = $scope.onDeselect(); // 取消选中后的回调方法

        // 取消选中其他 tab 页
        ctrl.deselectOthers = function(selectedTab) {
            angular.forEach(tabs, function(tab) {
                if (tab.active && tab !== selectedTab) {
                    tab.active = false;
                }
            });
        };

        // 新增标签页 - 当前 tab 的 scope 和 jqlite 元素
        ctrl.addTab = function(tab, elm) {
            var liBefore = 0;
            if (tabs.length > 0) {// 不是第一项，附加相邻 tab 间的 margin
                liBefore += tabsetConf.liBefore;
            }
            tabs.push(tab);
            if($scope.closeable){// 允许关闭时，不可禁用，disabled=false；禁止关闭时，disabled=undef
                tab.disabled = false;
            }
            if (tab.active && !tab.disabled) {// tab 是选中项
                ctrl.deselectOthers(tab);
            }
            $timeout(function(){
                // 延迟以确保 wi-tabset 指令中 $scope.scrollChange 已定义，判断防止获取不到新 tab 的尺寸
                var size = elm[0].getBoundingClientRect()[attrNames.size]; // 获取精确 size - chrome 中精确显示
                if(size == 0) return; // TODO 初始时若未显示，无法获取 size，是否需要监听 - 重要
                tabSizes.push(size);
                ctrl.sumSize += liBefore + size;
                $scope.scrollChange && $scope.scrollChange();
            });
        };

        // 关闭 tab
        ctrl.removeTab = function(tab) {
            var index = tabs.indexOf(tab);
            // 当前项被选中，先修改选中项
            if(tab.active && tabs.length > 1) {
                tabs[index == tabs.length - 1 ? //当前项为最后一项
                    index - 1: index + 1].active = true;
            }
            // 移除 tab
            tab.active = false;
            tabs.splice(index, 1);
            tabs.length && (ctrl.sumSize -= tabsetConf.liBefore);
            ctrl.sumSize -= tabSizes[index];
            tabSizes.splice(index, 1);
            tab.$destroy();// 销毁 - 触发 tab 中定义的 $destroy 监听，移除 dom
            if(closeFun) {// 删除后有回调函数的调用回调函数
                closeFun(tab['wiid']);
            }
            $scope.scrollable = false;// 删除后可能无需翻页，先置为 false 再计算显示空间
            $timeout(function() {
                // 延迟以等待 scrollable 生效，以获得最大的 stage 尺寸
                $scope.scrollChange && $scope.scrollChange();
            });
            return true;
        };

        // 关闭所有标签页 - closeable 的项
        ctrl.closeAllTab = function() {
            var i = 0;
            while(i<tabs.length){
                (tabs[i].closeable) ?
                    ctrl.removeTab(tabs[i]) :
                    i++;
            }
        };
        // 关闭除 tab 外的所有标签页 - 非 regular 项
        ctrl.closeOtherTab = function(tab) {
            var i = 0;
            while(i<tabs.length){
                (tabs[i] != tab && tabs[i].closeable) ? // 不是 tab 且可删除，移除，否则索引向后
                    ctrl.removeTab(tabs[i]) :
                    i++;
            }
        };

        ctrl.calcUlOffset = function(){
            $scope.calcUlOffset();
        };

        // ---------------------------------
        ctrl.getAutoTabId = function getAutoTabId() {
            autotabnum++;
            return autotabid+autotabnum;
        };
    }])

/**
 * @ngdoc directive
 * @name ui.wisoft.tabset.directive:wiTabset
 * @restrict E
 *
 * @description
 * 标签页组件标签，内部可包含wiTab标签页定义
 *
 * @param {number|length=} width 组件宽度，默认为 100%。<br />
 *   number 将自动添加单位 px。<br />
 *   length 为 number 接长度单位（相对单位和绝对单位）。<br />
 *   相对单位：em, ex, ch, rem, vw, vh, vm, %<br />
 *   绝对单位：cm, mm, in, pt, pc, px
 * @param {number|length=} height 组件高度，默认由内容撑开。<br />
 *   说明同 width。
 * @param {boolean=} vertical 标签页是否纵向排列，默认为 false。
 * @param {pixels=} tabheadsize 标签页头高度（纵向为宽度）(不含单位：px)，默认为 36。
 * @param {boolean=} closeable 所有标签（非固定）支持关闭，默认为 true，此时不支持禁用标签（wi-tab 中 disabled 属性失效）。
 * @param {boolean=} enablerightmenu 是否启用标签页右键菜单，默认为 false。若 closeable=false，此属性失效。
 * @param {function=} close 关闭标签页时的回调方法，参数为标签标识 wiid。
 * @param {string=} select 标签选中回调方法，参数为标签对应的 scope。
 * @param {string=} deselect 标签取消选中的回调方法，参数为标签对应的 scope。
 */
    .directive('wiTabset', ['$timeout', 'tabsetConf',function($timeout, tabsetConf) {
        return {
            restrict: 'E',
            transclude: true,
            replace: true,
            scope: {
                onClose: '&close',
                onSelect: '&select',
                onDeselect: '&deselect'
            },
            controller: 'TabsetController',
            templateUrl: 'template/tebset/tabsetTemplate.html',
            link: function(scope, element, attrs, tabsetCtrl) {
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
                scope._width = getSizeFromAttr(attrs['width']);
                scope._height = getSizeFromAttr(attrs['height']);
                scope._tabheadsize = Number(attrs['tabheadsize']) || 36;
                scope.scrollable = false;// 初始默认不翻页
                scope.enablerightmenu = scope.closeable ?
                    attrs.hasOwnProperty('enablerightmenu') && attrs['enablerightmenu']!='false'
                    : false;// 是否支持右键菜单，若禁止关闭，则禁用右键菜单
                scope.ulOffset = 0;// ul 默认偏移
//                var closeFun = scope.onClose();// 关闭 tab 时的回调函数
                var menudata = [
                        {id:1,label:'关闭当前页'},
                        {id:2,label:'关闭其他'},
                        {id:3,label:'关闭所有'}
                    ] // 非 regular 项弹出菜单
                    ,menudataRegular = [
                        {id:1,label:'关闭当前页', enabled: false},
                        {id:2,label:'关闭其他'},
                        {id:3,label:'关闭所有'}
                    ] // regular 项弹出菜单
                    ,menudataOut =[
                        {id:3,label:'关闭所有'}
                    ]; // 非 tab 项弹出菜单
                var attrNames = tabsetCtrl.attrNames
                    ,tabSizes = tabsetCtrl.tabSizes;

                var stageNode; // wi-tabstage 对应的 DOM 元素
                angular.forEach(angular.element(element.children()[0]).children(),function(child){
                    if((' ' + child.className +  ' ').indexOf('wi-tabstage') >= 0){
                        stageNode = child;
                        // 根据右击的 tab 修改菜单数据源 - 会在 menu 中绑定的右击事件前触发
                        angular.element(child).on('contextmenu', function(){
                            if(tabsetCtrl.isTab){// 右击的是 tab 页
                                var rightTab = tabsetCtrl.rightClickTab && tabsetCtrl.rightClickTab.scope;// 右击的 tab 的 scope
                                scope.menudata = rightTab.closeable ? menudata : menudataRegular;
                            }else{
                                scope.menudata = menudataOut;
                            }
                            scope.$digest();// 引起 menu 组件中数据源变化
                            tabsetCtrl.isTab = false;
                        });
                    }
                });

                // 判断并修改 scrollable，置为 true 后还需根据 active 的项调整 ulOffset
                scope.scrollChange = function(){// 判断 scrollable
                    var stageSize = stageNode[attrNames.offset];
                    if(stageSize < tabsetCtrl.sumSize){// 空间不足
                        scope.scrollable = true;
                        $timeout(function(){
                            scope.calcUlOffset();
                        });
                    }else{
                        scope.ulOffset = 0;// 清空 ul 定位
                        scope.scrollable = false;
                    }
                };

                // 根据 active 的 tab 调整 ulOffset - 只有翻页状态下需要判断
                scope.calcUlOffset = function(){
                    if(!scope.scrollable) return;
                    var preSizes = 0 // 已显示的总 size
                        ,activeSize = 0;// active 的 tab 的 size
                    for(var i= 0,tab;i<tabSizes.length;i++){
                        tab = scope.tabs[i];
                        if(tab.active){// 选中项
                            activeSize = tabSizes[i];
                            break;
                        }else{
                            preSizes += tabSizes[i] + tabsetConf.liBefore;
                        }
                    }
                    // 若 stage 中有留白，处理 oldPos
                    var oldPos = scope.ulOffset
                        ,stageSize = stageNode[attrNames.offset];
                    if(oldPos > 0){// 前部有留白
                        oldPos = 0;
                    }else if(Math.ceil(tabsetCtrl.sumSize) < stageSize - oldPos){// 后部有留白
                        oldPos = Math.ceil(tabsetCtrl.sumSize) - stageSize;
                    }
                    // 若 active 项被遮挡，调整
                    if(Math.ceil(preSizes) < 0 - oldPos){// active 项前部被遮挡
                        scope.ulOffset = 0 - Math.ceil(preSizes);
                    }else if(Math.ceil(preSizes + activeSize) > stageSize - oldPos){// active 项后部被遮挡
                        scope.ulOffset = stageSize - Math.ceil(preSizes + activeSize);
                    }else{
                        scope.ulOffset = oldPos;
                    }
                };

                scope.resize = function(){
                    console.log(11);
                };
                // 右键菜单选中事件，选中项为 val
                scope.rightmenuselect = function(val) {
                    var tab = tabsetCtrl.rightClickTab;
                    if(val){
                        if (val.id == 1) {// 关闭当前项
                            tab && tabsetCtrl.removeTab(tab.scope);
                        } else if (val.id == 2) {// 关闭其他项
                            tab && tabsetCtrl.closeOtherTab(tab.scope);
                        } else if (val.id == 3) {// 关闭所有
                            tabsetCtrl.closeAllTab();
                        }
                    }
                };

                // 向前显示一个 tab
                scope.backward = function() {
                    var oldPos = scope.ulOffset;
                    if(oldPos >= 0) return; // 左/上未被隐藏项，直接返回
                    var backSize = 0 // 隐藏的总 size
                        ,backLastSize = 0; // 将显示的 tab 的 size
                    for(var i=0;i<tabSizes.length;i++){
                        backLastSize = tabSizes[i] + tabsetConf.liBefore;
                        if(Math.ceil(backSize + backLastSize) >= 0 - oldPos){// 最后一个被遮挡项 - 进1法
                            scope.ulOffset = Math.floor(0 - backSize);// 向下取整 - 以免因小数误差导致新标签显示不全
                            break;
                        }
                        backSize += backLastSize;
                    }
                };
                // 向后显示一个 tab
                scope.forward = function() {
                    var oldPos = scope.ulOffset;
                    var currentSize = 0 // 已显示的总 size
                        ,forFirstSize = 0 // 将显示的 tab 的 size
                        ,stageSize = stageNode[attrNames.offset] - oldPos;
                    if(stageSize >= tabsetCtrl.sumSize) return; // 右/下未被隐藏项，直接返回
                    for(var i=0;i<tabSizes.length;i++){
                        forFirstSize = i==0 ?
                            tabSizes[i]:
                            tabSizes[i] + tabsetConf.liBefore;// 非第一项需加上 margin-right
                        currentSize += forFirstSize;
                        if(Math.ceil(currentSize) > stageSize){// 最后一个被遮挡项
                            scope.ulOffset = Math.floor(oldPos - (currentSize - stageSize));// 向下取整
                            break;
                        }
                    }
                };
            }
        };
    }])

/**
 * @ngdoc directive
 * @name ui.wisoft.tabset.directive:wiTab
 * @restrict E
 *
 * @description
 * 单个标签页定义标签，只能在wiTabset标签内使用
 *
 * @param {string=} wiid 标签标识id，如果没有设置，会自动创建一个 wiid
 * @param {string=} heading 标签头内容，可以是一个字符串或一段HTML
 * @param {boolean=} active 标签初始时是否被选中，默认为 false，若要通过其他方式改变 active 的值，需为 active 指定有意义的初始值
 * @param {boolean=} disabled 标识标签是否禁用，默认为 false。<br />wi-tabset 若未定义 closeable=false，此属性失效。
 * @param {boolean=} regular 是否是固定标签，默认为false。添加此属性且不设置为 false，则为固定 tab，不可关闭。<br />wi-tabset 若定义 closeable=false，此属性失效。
 * @param {string=} icon 标签页图标的 url
 * @param {string=} src 标签页内容链接地址，若定义此属性，wi-tabset 中原有的
 * @param {number|length=} size 组件宽度（纵向 tabset 为高度），默认由内容撑开。<br />
 *   number 将自动添加单位 px。<br />
 *   length 为 number 接长度单位（相对单位和绝对单位）。<br />
 *   相对单位：em, ex, ch, rem, vw, vh, vm, %<br />
 *   绝对单位：cm, mm, in, pt, pc, px
 */
    // TODO wiid 是否应该是必须项？
    .directive('wiTab', ['$parse', function($parse) {
        return {
            require: '^wiTabset',
            restrict: 'E',
            replace: true,
            templateUrl: 'template/tebset/tabTemplate.html',
            transclude: true,
            scope: {
                heading: '@'
            },
            controller: function() {
            },
            compile: function(elm, attrs, transclude) {
                return function postLink(scope, elm, attrs, tabsetCtrl) {
                    scope.$transcludeFn = transclude;
                    var parentScope = scope.$parent;

                    scope.wiid = attrs.wiid ? attrs.wiid : tabsetCtrl.getAutoTabId();// ----------------------
                    attrs.src && (scope.src = attrs.src);
                    attrs.icon && (scope.icon = attrs.icon);
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
                    elm.css(tabsetCtrl.attrNames.size, getSizeFromAttr(attrs['size']));

                    var _setActive;
                    if (attrs.active) {// 有 active 属性，监听
                        var _getActive = $parse(attrs.active);
                        _setActive = _getActive.assign;
                        scope.active = _getActive(parentScope);
                        _setActive && parentScope.$watch(_getActive, function(val, wasVal) {
                            if(val !== wasVal) scope.active = val;
                        });
                    }else{
                        scope.active = false;
                    }
                    // 监听选中状态
                    scope.$watch('active', function(active, wasActive) {
                        if(active === wasActive) return;
                        if(_setActive){
                            _setActive(parentScope, active);// 同时修改数据源
                        }
                        if (active) {
                            tabsetCtrl.deselectOthers(scope);// 关闭其他 tab
                            tabsetCtrl.calcUlOffset();
                            tabsetCtrl.selectFun && tabsetCtrl.selectFun(scope);
                        }else{
                            tabsetCtrl.deselectFun && tabsetCtrl.deselectFun(scope);
                        }
                    });

                    /* ----- 向 tabset 中添加 ----- */
                    tabsetCtrl.addTab(scope, elm);
                    // addTab 之后执行
                    if(scope.disabled === false){// tabset 中 closeable=true 时，此 tab 可以关闭，不可禁用
                        if (attrs.regular) {// 有 regular 属性，监听，非 regular 的标签可关闭
                            var _getRegular = $parse(attrs.regular);
                            scope.closeable = !_getRegular(parentScope);
                            _getRegular.assign && parentScope.$watch(_getRegular, function(val, wasVal) {
                                if(val !== wasVal) scope.closeable = !val;
                            });
                        }else{
                            scope.closeable = true;
                        }
                    }
                    else{// tabset 中 closeable=false 时，不可关闭，可以禁用
                        scope.closeable = false;
                        scope.disabled = false;
                        if(attrs.disabled){
                            var _getDisabled = $parse(attrs.disabled);
                            _getDisabled.assign && parentScope.$watch(_getDisabled, function(value) {
                                scope.disabled = !! value;
                            });
                        }
                    }

                    scope.select = function() {
                        if ( !scope.disabled ) {
                            scope.active = true;
                        }
                    };

                    scope.close = function(event) {
                        tabsetCtrl.removeTab(scope, elm);
                        event.stopPropagation();// 防止触发 tab 的 click 事件
                    };

                    scope.$on('$destroy', function() {
                        elm && elm.remove();
                    });

                    // 捕捉右键菜单弹出的 tab
                    elm.on('contextmenu', function(){
                        tabsetCtrl.rightClickTab = {
                            scope: scope
                            ,elm: elm
                        };
                        tabsetCtrl.isTab = true;// 标识右击了 tab
                    });
                };
            }
        };
    }])
/**
 * @ngdoc directive
 * @name ui.wisoft.tabset.directive:wiTabHeading
 * @restrict E
 *
 * @description
 *用于自定义标签页头，只能用于wiTab标签内<br>
 *示例：<br>
 * &lt;wi-tab&gt;<br>
 *     &lt;wi-tab-heading&gt;&lt;b style="color:red;"&gt;自定义标签名称&lt;/b&gt;&lt;/wi-tab-heading&gt;<br>
 *      ......<br>
 *&lt;/wi-tab&gt;<br>
 *
 */
    .directive('wiTabHeadingTransclude', [function() {
        return {
            restrict: 'A',
            require: '^wiTab',
            link: function(scope, elm) {
                scope.$watch('headingElement', function updateHeadingElement(heading) {
                    if (heading) {
                        elm.html('');
                        elm.append(heading);
                    }
                });
            }
        };
    }])

    .directive('wiTabContentTransclude', function() {
        return {
            restrict: 'A',
            require: '^wiTabset',
            link: function(scope, elm, attrs) {
                var tab = scope.$eval(attrs.wiTabContentTransclude);
                tab.$transcludeFn(tab.$parent, function(contents) {
                    angular.forEach(contents, function(node) {
                        if (isTabHeading(node)) {
                            //通知tabHeadingTransclude
                            tab.headingElement = node;
                        } else if (tab.src == undefined) {
                            elm.append(node);
                        }
                    });
                });
            }
        };
        function isTabHeading(node) {
            return node.tagName &&  (
                node.hasAttribute('wi-tab-heading') ||
                node.tagName.toLowerCase() === 'wi-tab-heading'
                );
        }
    })
;
