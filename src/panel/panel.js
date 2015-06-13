/**
 * Created by QianQi on 2014/11/10.
 */

angular.module('ui.wisoft.panel', ['ui.wisoft.collapse'])
    .constant('panelConf',{
        'headHeight': 30//定义了面板高度时，head 部分的指定高度
    })
/**
 * @ngdoc directive
 * @name ui.wisoft.panel.directive:wiPanel
 * @restrict E
 *
 * @description
 * wiPanel 是基本的布局组件，可以自定义标题和按钮，并内置了一些工具按钮。
 *
 * @param {object=} wiid 若定义了此属性，可供调用接口。<br />
 *   .options() 获取当前设置：{ heading，isOpen，isCollapse }，<br />
 *   .element() 获取当前 panel 对应的 jqlite 元素，<br />
 *   .toggle() 切换当前面板的折叠状态，并返回切换后的状态，true 为折叠。
 * @param {number|length=} width 面板宽度，默认为 100%。<br />
 *   number 将自动添加单位 px。<br />
 *   length 为 number 接长度单位（相对单位和绝对单位）。<br />
 *   相对单位：em, ex, ch, rem, vw, vh, vm, %<br />
 *   绝对单位：cm, mm, in, pt, pc, px
 * @param {number|length=} height 面板高度，默认为自适应。若定义了此属性，head 部分高度将自动设置为 30px。
 *   说明同 width。
 * @param {string=} heading 头部显示文字, heading是单向绑定的，可以设置为一个确定的字符串，或者设置为scope中的一个变量。
 * @param {string=} headicon 头部左侧显示图标的 url。
 * @param {string|array=} headtools 头部右侧的工具，系统工具：'close'（关闭），collapse'（折叠）。<br />
 *   string：用“,”连接的系统工具字符串，定义时需加引号，如：headTools="'close,collapse'"或"'close'"。<br />
 *   array：数组的每一个元素代表一个工具，系统工具为 string，自定义工具为 Object。如：['collapse','close',{name:'save',cls:'icon-save',opt:saveFun}]。<br />
 *   其中自定义工具对象的属性说明：name-操作名称,cls-class名称,opt-click的操作（值为函数引用，参数：事件源 event）。
 * @param {boolean=} center true 时居中显示，默认为 false
 * @param {boolean=} isOpen true 时面板显示，双向绑定，应设置为scope中的一个变量。
 * @param {boolean=} collapsible true 时可以通过点击头部进行折叠展开操作，默认为 false。
 * @param {boolean=} collapsed true 时折叠，默认为 false。
 * @param {function=} onopened 打开面板后的回调方法，参数：无。
 * @param {function=} onclosed 关闭面板后的回调方法，参数：无。
 * @param {function=} oncollapse 折叠面板时的回调方法，参数：无。
 * @param {function=} onexpand 展开面板时的回调方法，参数：无。
 */
    .directive('wiPanel', ['panelConf',function (panelConf) {
        return {
            restrict: 'E',
            transclude: true,
            replace: true,
            templateUrl: 'template/panel/wi-panel.html',
            scope: {
                wiid: '='
                ,heading: '@'
                ,isOpen: '=?'
                ,onopened: '&'
                ,onclosed: '&'
                ,oncollapse: '&'
                ,onexpand: '&'
            },
            controller: function () {
                this.setHeading = function (element) {
                    this.headingEl = element;
                };
            },
            link: function (scope, element, attrs) {
                var onOpened = scope.onopened()
                    ,onClosed = scope.onclosed()
                    ,onCollapse = scope.oncollapse()
                    ,onExpand = scope.onexpand();
                var parentScope = scope.$parent;
                /* width、height */
                (function(){
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
                    scope.width = getSizeFromAttr(attrs['width']) || '';// panel 宽度
                    var height = getSizeFromAttr(attrs['height']);
                    if(height){
                        element.addClass('wi-panel-h').css('height', height);
                        if(height.indexOf('px')>0){
                            angular.element(element.children()[1]).css('height',(parseInt(height)-panelConf.headHeight)+'px');
                        }else{ // collapse 中只能获取 style 中定义的高度
                            angular.element(element.children()[1]).css('height','calc('+height+' - '+panelConf.headHeight+'px)');
                        }
                    }
                })();

                /* 标题栏 */
                (function(){
                    scope.headicon = attrs.headIcon;// 图标
                    if(attrs.hasOwnProperty('center') && attrs['center']!='false'){// 内容居中
                        angular.element(angular.element(element.children()[0]).children()[0]).css('text-align','center');
                    }
                    // 是否能通过点击头部折叠
                    scope.collbyHead = attrs.hasOwnProperty('collapsible') ? function(){
                        toggleColl();
                    } : angular.noop;
                    /* 工具栏 */
                    scope.headTools = {};
                    if(attrs.headTools){
                        try{
                            var tools=parentScope.$eval(attrs.headTools);
                            if(angular.isString(tools)){// 字符串，逗号分隔，转换为 array
                                tools = tools.replace(/\s*/g,'').split(',');
                            }
                            if(angular.isArray(tools)){
                                /* 系统工具 */
                                var findSysTool=function(name){
                                    var index=tools.indexOf(name);
                                    if(index>=0){
                                        tools.splice(index,1);
                                        scope.headTools[name]=true;
                                    }
                                };
                                findSysTool('collapse');// 折叠
                                findSysTool('close');// 关闭
                                /* 自定义工具 */
                                if(tools.length>0) scope.headTools.custom = tools;
                            }
                            if(Object.getOwnPropertyNames(scope.headTools).length>0){// 存在要显示的工具
                                scope.headTools.visible = true;
                            }
                        }catch(e){
                            console.warn('wi-panel 的 headTools 属性定义不合法!');
                        }
                    }
                    scope.collbyTool = function(e){
                        toggleColl();
                        e.stopPropagation();
                    };
                })();

                /* 折叠状态 */
                scope.collapsed = attrs.hasOwnProperty('collapsed') && attrs['collapsed']!='false';// 默认展开
                if(scope.collapsed){// onCollapse
                    onCollapse && onCollapse();
                }else{// onExpand
                    onExpand && onExpand();
                }
                var toggleColl = function () {
                    scope.collapsed = !scope.collapsed;
                    if(scope.collapsed){// onCollapse
                        onCollapse && onCollapse();
                    }else{// onExpand
                        onExpand && onExpand();
                    }
                };

                /* 打开状态 */
                scope.isOpen = (scope.isOpen != false);
                scope.closebyTool = function(e){
                    scope.isOpen = false;
                    e.stopPropagation();
                };
                // 若定义了打开、关闭回调函数，监听 is-open
                if(onOpened || onClosed){// 可能由外部修改 is-open
                    scope.$watch('isOpen',function(val){
                        if(val){// onOpened
                            onOpened && onOpened();
                        }else{// onClose
                            onClosed && onClosed();
                        }
                    })
                }

                /* 开放接口，需定义双向绑定的 wiid */
                if(attrs.wiid){
                    if(angular.isObject(scope.wiid)){
                        scope.wiid.options = function(){
                            return {
                                heading: scope.heading
                                ,isOpen: scope.isOpen
                                ,isCollapse: scope.collapsed
                            };
                        };
                        scope.wiid.element = function(){
                            return element;
                        };
                        scope.wiid.toggle = function(){
                            toggleColl();
                            return scope.collapsed;
                        };
                    }
                }
            }
        };
    }])

/**
 * @ngdoc directive
 * @name ui.wisoft.panel.directive:wiPanelHeading
 * @restrict E
 *
 * @description
 * wiPanelHeading 只能作为 wiwiPanel 的子指令来使用，它可以使用一个 html 片段来设定 panel 的头部显示。如果你希望头部显示的不仅仅是简单的文字，
 * 比如还有图片，按钮等更复杂的显示，就需要使用到这个子指令。
 *
 */
    .directive('wiPanelHeading', function () {
        return {
            restrict: 'E',
            transclude: true,
            template: '',
            replace: true,
            require: '^wiPanel',
            link: function (scope, element, attr, panelGroupCtrl, transclude) {
                panelGroupCtrl.setHeading(transclude(scope, function () {
                }));
            }
        };
    })

    .directive('wiPanelTransclude', function () {
        return {
            require: '^wiPanel',
            link: function (scope, element, attrs, controller) {
                scope.$watch(function () {
                    return controller[attrs.wiPanelTransclude];
                }, function (heading) {
                    if (heading) {
                        element.html('');
                        //设置 Panel 的 head 的时候，可以直接设置 html，当需要设置图片和文字样式的时候会比较有用
                        element.append(heading);
                    }
                });
            }
        };
    });
