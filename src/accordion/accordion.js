angular.module('ui.wisoft.accordion', ['ui.wisoft.collapse','ui.wisoft.resizelistener'])
    .constant('accordionConfig', {
        emptyHeight: 2//空的 accordion 高度（上下边框）
        ,headHeight: 32// 标题栏默认高度，32px
    })
    .controller('AccordionController', ['$scope', '$attrs','$element','$log','accordionConfig', function ($scope, $attrs,$elem,$log,accordionConfig) {
        var ctrl = this;
        /* 尺寸处理 */
        var ac_height = undefined;// $scope.ac_height 的临时变量，用户定义的高度字符串
        (function(){
            // 尺寸类型的属性处理方法（其他组件中也存在类似方法，依赖于 scope），可接受的值：数字、数字开头、scope 对象（数字、数字开头）
            var getSizeFromAttr = function(attr){
                if(!attr) return;
                var size;
                if(/^(?:[1-9]\d*|0)(?:.\d+)?/.test(attr)){// 数字开始
                    size = attr;
                }else{// 非数字开始，可能是 scope 对象
                    size = $scope.$eval(attr);
                }
                Number(size) && (size += 'px');// 是数字则加上单位 px
                return size;
            };
            $scope.ac_width = getSizeFromAttr($attrs['width'],'warn: accordion 的 width="'+ $attrs['width'] +'"定义不合法!');
            // controller 中需使用 ac_height 计算内容部分高度，若未定义高度，则由 accordionGroup 内容撑开
            ac_height = $scope.ac_height
                = getSizeFromAttr($attrs['height'],'warn: accordion 的 height="'+ $attrs['height'] +'"定义不合法!');// accordion 的 height
            if(ac_height && ac_height.indexOf('%')>0)// 若高度为 %，设置当前容器实际高度，需要监听 resize，修改容器高度
                $scope.ac_hIsPCT = true;
        })();
        ctrl.headHeight = $scope.$eval($attrs['headheight']);// 标题栏高度
        !angular.isNumber(ctrl.headHeight) && (ctrl.headHeight = accordionConfig.headHeight);
        // 是否限制只打开一个 accordionGroup，若定义了 height，只能为 true
        var oneOpen = ac_height ? true : $scope.$eval($attrs['oneopen']) || false;

        // accordion groups，所有面板的 scope
        ctrl.groups = [];
        ctrl.panelStyle = {};//设置每个accordion body的高度等样式
        var openedGroups = [];//临时保存设置为打开的accordionGroup，但每次执行addGroup()后它只保留最后一个设置为打开的accordionGroup

        //判断是否需要关闭其他 accordionGroup，需要时关闭
        ctrl.closeOthers = function (openGroup) {
            if(!oneOpen || openGroup.byOther==true) return;
            angular.forEach(ctrl.groups, function (group) {
                if (group !== openGroup && group.isOpen) {
                    group.isOpen = false;
                    group.byOther = true;
                }
            });
        };

        // 若 accordion 定义了高度，当所有 accordionGroup 都已关闭，则打开 closeScope 相邻的 accordionGroup
        ctrl.adjust = function(closeScope){ // closeScope 是正在关闭的 accordionGroup 的 scope
            if(!ac_height) return;
            var index = ctrl.groups.indexOf(closeScope);
            if(index == ctrl.groups.length-1){// 关闭的是最后一项
                if(!ctrl.groups[index-1].isOpen){
                    ctrl.groups[index-1].isOpen=true;
                    ctrl.groups[index-1].byOther=true;
                }
            }else{
                if(!ctrl.groups[index+1].isOpen){
                    ctrl.groups[index+1].isOpen=true;
                    ctrl.groups[index+1].byOther=true;
                }
            }
        };

        // wi-accordion-group 指令调用该方法将自己保存到this.groups中
        ctrl.addGroup = function (groupScope, _index) {
            groupScope.panelStyle = ctrl.panelStyle;
            if(angular.isDefined(_index)){ //_index 有值时，将 groupScope 插入到指定位置，因 ng-repeat 等影响可能导致 addGroup 的顺序与 DOM 不一致，故引入 _index
                ctrl.groups.splice(_index, 0, groupScope);
            }else{
                ctrl.groups.push(groupScope);
            }
            /* 开始设置各 accordionGroup 的打开状态 */
            if(groupScope.isOpen){
                openedGroups.push(groupScope);
            }
            if(oneOpen && openedGroups.length > 1){// 至多打开一个，超过时关闭前一个
                if(openedGroups[0].isOpen){
                    openedGroups[0].isOpen = false;
                    openedGroups[0].byOther = true;
                }
                openedGroups.shift();
            }
            if(ac_height && openedGroups.length == 0){// 设置了高度，至少打开一个，无打开时打开第一个
                if(!ctrl.groups[0].isOpen){
                    ctrl.groups[0].isOpen = true;
                    (ctrl.groups.length>1) && (ctrl.groups[0].byOther = true);
                }
                openedGroups.push(ctrl.groups[0]);
            }
            calcCHeight();
        };

        // accordionGroup 销毁时，在其指令中监听调用
        ctrl.removeGroup = function (group) {
            var index = ctrl.groups.indexOf(group);
            if (index !== -1) {
                ctrl.groups.splice(index, 1);
            }
            calcCHeight();
        };

        /* 内容部分高度设置（前提：定义了整体高度） */
        var calcCHeight = (ac_height) ? function(){
            var times = ctrl.groups.length;
            // 设置每个accordionGroup的高度,宽度自动撑满不需要设置
            if($scope.ac_hIsPCT){// %，设置当前容器实际高度
                var trueHeight=parseInt(ac_height)*0.01*$elem[0].parentElement.clientHeight;
                ctrl.panelStyle.cheight = trueHeight-(times*ctrl.headHeight+accordionConfig.emptyHeight)+'px';
            }else{
                ctrl.panelStyle.cheight = 'calc('+ac_height+' - '+(times*ctrl.headHeight+accordionConfig.emptyHeight)+'px)';
            }
        } : angular.noop;
        ctrl.resizeH = function(){
            calcCHeight();
            ctrl.groups.map(function(group){
                group.panelStyle.cheight=ctrl.panelStyle.cheight;
            });
        }
    }])

/**
 * @ngdoc directive
 * @name ui.wisoft.accordion.directive:wiAccordion
 * @restrict EA
 *
 * @description
 * wiAccordion是一个折叠面板，如果给定显示区域比较小，就可以考虑使用这个组件。
 *
 * @param {object=} wiid 若定义了此属性，可供调用接口。<br />
 *   .element() 获取当前 accordion 对应的 jqlite 元素，<br />
 *   .options() 获取当前用户设置：{ width,height }，<br />
 *   .panels() 获取所有面板对应的 scope 集合。<br />
 *   .getSelect() 获取选中的面板对应的 scope。<br />
 *   .getGroup(which) 获取指定 heading或index 的面板对应的 scope。<br />
 *   .toggle(which) 切换指定 heading或index 的面板的选中状态。<br />
 *   .reCompute() 重新适应尺寸（当其祖先元素由隐藏改为显示时，可能需要手动调用此方法，以重新计算尺寸）。
 * @param {number|length=} width 宽度，用来设定整个accordion的宽度，不指定宽度则面板的宽度是父容器的100%。<br />
 *   number 将自动添加单位 px。<br />
 *   length 为 number 接长度单位（相对单位和绝对单位）。<br />
 *   相对单位：em, ex, ch, rem, vw, vh, vm, %<br />
 *   绝对单位：cm, mm, in, pt, pc, px
 * @param {number|length=} height 高度, 指定此属性后，每个折叠面板都拥有同样的高度，不指定则每个面板的高度是根据内容自适应的。<br />
 *   说明同 width。
 * @param {number=} headheight 标题栏高度的数值。不带单位“px”，默认为 32。
 * @param {boolean=} oneopen 是否只能打开一个 accordion，默认为 false，若定义了 height，此属性默认为 true，且用户设置不生效。
 * @param {function=} onselect 打开面板后的回调方法，参数：index(当前面板索引位置),scope(面板对应的 scope)。
 * @param {function=} onunselect 关闭面板后的回调方法，参数：index(当前面板索引位置),scope(面板对应的 scope)。
 */
    .directive('wiAccordion', ['wiResizeListener','$timeout',function (wiResizeListener,$timeout) {
        return {
            restrict: 'EA',
            controller: 'AccordionController',
            transclude: true,
            replace: true,
            scope:{
                wiid: '='
                ,onselect: '&'
                ,onunselect: '&'
            },
            templateUrl: 'template/accordion/wi-accordion.html',
            link: function (scope, elem, attrs, accordionCtrl) {
                //console.log(accordionCtrl.groups.length)？？？？？为什么带ng-repeat的group获取不到？？？？？？
                //-----因为使用了ng-repeat后先执行accordion的link后执行accordionGroup的link，执行顺序改变了
                /* 事件监听 */
                accordionCtrl.onSelect = scope.onselect();
                accordionCtrl.onUnselect = scope.onunselect();

                scope.ac_width && elem.css('width', scope.ac_width);// 已在 ctrl 中计算
                $timeout(accordionCtrl.resizeH, 0);// 若祖先元素存在自定义指令，可能造成 link 时高度未同步至DOM，延迟计算
                var regResizeEventListener = function(){
                    wiResizeListener.addResizeListener(elem[0].parentElement, function(){
                        scope.$evalAsync(accordionCtrl.resizeH);
                    });
                };
                // accordion 父容器或者窗口高度变化时重新计算内容高度 -- 需在模板和文档都设置完成后运行，否则 IE 等浏览器显示异常
                if(scope.ac_hIsPCT){// 需要监听 resize
                    regResizeEventListener();
                }

                /* 开放接口，需定义双向绑定的 wiid */
                if(attrs.wiid && angular.isObject(scope.wiid)){
                    angular.extend(scope.wiid, {
                        element: function(){// 返回对应的 DOM
                            return elem;
                        }
                        ,options: function(){
                            return {
                                width: scope.ac_width // 组件实际宽度
                                ,height: scope.ac_height // 组件实际高度
                            };
                        }
                        ,panels: function(){ // 返回所有 accordion-group 对应的 scope 集合
                            return accordionCtrl.groups;
                        }
                        ,getSelect: function(){ // 返回选中项的 scope
                            var groups=accordionCtrl.groups;
                            for(var i=0;i<groups.length;i++){
                                if(groups[i].isOpen) return groups[i];
                            }
                        }
                        ,getGroup: function(which){ // 返回指定 heading/index 对应的 scope
                            var groups=accordionCtrl.groups;
                            if(angular.isNumber(which)){
                                return groups[which];
                            }
                            for(var i=0;i<groups.length;i++){
                                if(groups[i].heading==which) return groups[i];
                            }
                        }
                        ,toggle: function(which){ // 选中指定项
                            var groups=accordionCtrl.groups;
                            if(angular.isNumber(which)){
                                groups[which].isOpen = !groups[which].isOpen;
                                return;
                            }
                            for(var i=0;i<groups.length;i++){
                                if(groups[i].heading==which){
                                    groups[i].isOpen = !groups[i].isOpen;
                                    return;
                                }
                            }
                        }
                        ,reCompute: (scope.ac_hIsPCT) ?// 需要监听 resize
                            function(){
                                regResizeEventListener();
                            } : angular.noop
                    });
                }

                // 标识是否完成 link，此后 link 的 accordionGroup （ng-repeat 等造成）需判断在 DOM 中的位置
                accordionCtrl.acLinked = true;
            }
        };
    }])

/**
 * @ngdoc directive
 * @name ui.wisoft.accordion.directive:wiAccordionGroup
 * @restrict EA
 *
 * @description
 * wiAccordionGroup是wiAccordion的一个面板，wiAccordionGroup只能作为wiAccordion的子指令来使用，不能单独使用。
 *
 * @param {string=} heading 头部显示文字, heading是单向绑定的，你可以设置为一个确定的字符串，或者设置为scope中的一个变量。
 * @param {boolean=} isOpen 是否展开，设定 wiAccordionGroup 是否展开，isOpen 是双向绑定的，所以应设置为 scope 中的一个变量，而不能直接是 true 或者 false。<br />
 * 初始化时若未定义，默认为false
 */
    .directive('wiAccordionGroup', function () {
        return {
            require: '^wiAccordion',         // 必须在 wi-accordion 组件中
            restrict: 'EA',
            transclude: true,
            replace: true,
            templateUrl: 'template/accordion/wi-accordion-group.html',
            scope: {
                heading: '@'
                ,isOpen: '=?'
//                ,isDisabled: '=?'//去除该属性，基本不会用
            },
            controller: function () {
                var ctrl = this;
                ctrl.setHeading = function (element) {
                    ctrl.heading = element;
                };
            },
            link: function (scope, element, attrs, accordionCtrl) {
                angular.isUndefined(scope.isOpen) && (scope.isOpen = false); // 若未定义 isOpen，默认为关闭
                scope.byOther = false;// 是否是受别的 accordionGroup 影响而改变了状态
                scope.style = {
                    headheight: accordionCtrl.headHeight ? accordionCtrl.headHeight + 'px': undefined // 从 controller 中获取标题高度
                };
                var _index = undefined;
                if(accordionCtrl.acLinked){// accordion 指令 link 完成，后 link 的 accordionGroup 需判断 DOM 索引
                    angular.forEach(element[0].parentElement.children, function(child, index){
                        if(child == element[0])
                            _index = index;
                    });// 可用于判断 group 的索引
                }
                accordionCtrl.addGroup(scope, _index);

                scope.$watch('isOpen', function (value, oldValue) {
                    var index=accordionCtrl.groups.indexOf(scope);
                    if(value){
                        accordionCtrl.onSelect && accordionCtrl.onSelect(index,scope);
                    }else{
                        accordionCtrl.onUnselect && accordionCtrl.onUnselect(index,scope);
                    }
                    if(scope.byOther){
                        scope.byOther = false;
                    }else if(value !== oldValue){
                        if (value) {//打开，在 accordionCtrl 中判断是否需要关闭其他 accordionGroup
                            accordionCtrl.closeOthers(scope);
                        }else{// 关闭，需判断是否需要打开其他 accordionGroup，从 toggleOpen 中移过来，外部可能会直接修改 isOpen
                            accordionCtrl.adjust(scope);
                        }
                    }
                });

                scope.toggleOpen = function () {
//                    if (!scope.isDisabled) {
                        scope.isOpen = !scope.isOpen;
//                    }
                };

                scope.$on('$destroy', function () {
                    accordionCtrl.removeGroup(scope);
                });
            }
        };
    })

/**
 * @ngdoc directive
 * @name ui.wisoft.accordion.directive:wiAccordionHeading
 * @restrict EA
 *
 * @description
 * wiAccordionHeading只能作为wiAccordionGroup的子指令来使用，它可以使用一个html片段来设定面板的头部显示。如果你希望头部显示的不仅仅是简单的文字，
 * 比如还有图片，按钮等更复杂的显示，就需要使用到这个子指令。使用方法见<a href="index_demo.html" target="_blank">demo</a>文档。
 *
 */
    .directive('wiAccordionHeading', function () {
        return {
            restrict: 'EA',
            transclude: true,   // 获取内容作为 heading
            template: '',       // 移除定义时的 element
            replace: true,
            require: '^wiAccordionGroup',
            link: function (scope, element, attr, accordionGroupCtrl, transclude) {
                // 将 heading 传递到 accordionGroup 的控制器，使自定义内容载入到模板中正确的位置
                // transclude 方法的第二个参数将克隆 elements，使其在 ng-repeat 中不出现异常
                accordionGroupCtrl.setHeading(transclude(scope, function () {}));
            }
        };
    })

    // 在 accordionGroup 模板中使用，标识引用 heading 的位置，必须提供 accordionGroup 控制器，以获得引入的 element
    // <div class="accordion-group">
    //   <div class="accordion-heading" ><a ... accordion-transclude="heading">...</a></div>
    //   ...
    // </div>
    .directive('wiAccordionTransclude', function () {
        return {
            require: '^wiAccordionGroup',
            link: function (scope, element, attr, controller) {
                scope.$watch(function () {
                    return controller[attr.wiAccordionTransclude];
                }, function (heading) {
                    if (heading) {
                        element.html('');
                        //设置accordion group的head的时候，可以直接设置html，当需要设置图片和文字样式的时候会比较有用
                        element.append(heading);
                    }
                });
            }
        };
    });