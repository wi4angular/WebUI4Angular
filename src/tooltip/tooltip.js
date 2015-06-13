/**
 * @ngdoc overview
 * @name ui.wisoft.tooltip
 *
 * @description
 * 提示标签
 *
 * 主要功能：<br>
 * （1）支持标签内容自定义<br>
 * （2）支持标签内容动态修改<br>
 */
'use strict';
angular.module('ui.wisoft.tooltip', [ 'ui.wisoft.position', 'ui.wisoft.bindHtml' ])

    .provider('$tooltip', function () {
        var defaultOptions = {
            placement: 'top',
            animation: true,
            popupDelay: 0
        };

        var triggerMap = {
            'mouseenter': 'mouseleave',
            'click': 'click',
            'focus': 'blur'
        };

        var globalOptions = {};

        /**
         * `options({})` 允许全局配置 app 中所有 tooltip 的默认参数。
         * var app = angular.module( 'App', ['ui.bootstrap.tooltip'], function( $tooltipProvider ) {
         *   // 默认弹出位置由 top 改为 left
         *   $tooltipProvider.options( { placement: 'left' } );
         * });
         */
        this.options = function(value) {
            angular.extend(globalOptions, value);
        };

        /**
         * `setTriggers({})` 允许扩展 trigger 集合。
         *   $tooltipProvider.setTriggers( 'openTrigger': 'closeTrigger' );
         */
        this.setTriggers = function(triggers) {
            angular.extend(triggerMap, triggers);
        };

        /**
         * 这个方法将驼峰式命名（js 中的指令名）转换为链式（DOM 中的指令字符串）。
         */
        function snake_case(name) {
            var regexp = /[A-Z]/g;
            var separator = '-';
            return name.replace(regexp, function (letter, pos) {
                return (pos ? separator : '') + letter.toLowerCase();
            });
        }

        /**
         * 返回 $tooltip 服务的实际接口
         */
        this.$get = [ '$window', '$compile', '$timeout', '$parse', '$document', '$position', function ($window, $compile, $timeout, $parse, $document, $position) {
            /**
             * @param {string} type 指令的驼峰字符串
             * @param {string} 属性前缀
             * @param {string} defaultTriggerShow 触发显示 ttPopup 的事件名
             */
            return function $tooltip(type, prefix, defaultTriggerShow) {

                var options = angular.extend({}, defaultOptions, globalOptions);

                /**
                 * 返回 ttPopup 的切换事件名：{show: '..', hide: '..'}
                 *
                 * 若提供了 trigger，将在此事件触发时显示 ttPopup，否则使用 `$tooltipProvider.options({})` 定义的 trigger，若也未定义，则使用创建指令定义时设置的默认值。
                 * hide 事件名根据 show 事件名获取，若 triggerMap 中有该事件对的定义，直接获取 hide，否则直接定义为 show。
                 */
                function getTriggers(trigger) {
                    var show = trigger || options.trigger || defaultTriggerShow;
                    var hide = triggerMap[show] || show;
                    return {
                        show: show,
                        hide: hide
                    };
                }

                var directiveName = snake_case(type);// 根据 type 获取指令在 DOM 中的字符串
                var template =
                    '<div ' + directiveName + '-popup ' +
                    'content="{{tt_content}}" ' +
                    'placement="{{tt_placement}}" ' +
                    'animation="tt_animation" ' +
                    'is-open="tt_isOpen"' +
                    '></div>';// 弹出部分的 DOM 字符串

                // tooltip 指令主体
                return {
                    restrict: 'EA',
                    scope: true,
                    compile: function () {
                        var tooltipLinker = $compile(template);
                        return function link(scope, element, attrs) {
                            var ttPopup; // 弹出项 DOM 元素
                            var showTimeout, hideTimeout; // 弹出项显示/隐藏计时器
                            var hasEnableExp = angular.isDefined(attrs[prefix + 'Enable']);// 是否定义了启用属性
                            var appendToBody = angular.isDefined(attrs[prefix +'AppendToBody']) ? // 是否将弹出项添加到 body 节点下
                                $parse(attrs[prefix +'AppendToBody'])(scope):
                                angular.isDefined(options['appendToBody']) ? // 服务中的配置
                                    options['appendToBody']:
                                    false;
                            var triggers = getTriggers(undefined);// {show: defaultTriggerShow, hide: 对应的隐藏方法名}
                            bindTriggers();
                            var animation = scope.$eval(attrs[prefix + 'Animation']);

                            scope.tt_placement = angular.isDefined(attrs[prefix + 'Placement']) ? attrs[prefix + 'Placement'] : options.placement;
                            scope.tt_animation = angular.isDefined(animation) ? !!animation : options.animation;
                            // 默认 ttPopup 关闭 - TODO 支持初始化时打开
                            scope.tt_isOpen = false;

                            // 用于绑定的切换事件
                            function toggleBind() {
                                if (!scope.tt_isOpen) {
                                    showBind();
                                } else {
                                    hideBind();
                                }
                            }

                            // 用于绑定的显示事件：指定的延迟时间后显示 ttPopup，若未指定则立即显示
                            function showBind() {
                                if (hasEnableExp && !scope.$eval(attrs[prefix + 'Enable'])) {// 未启用
                                    return;
                                }
                                if (scope.tt_popupDelay) {
                                    if (!showTimeout) {// 此前已指定延迟显示（多次触发切换），不进行操作
                                        showTimeout = $timeout(show, scope.tt_popupDelay, false);
                                    }
                                } else {
                                    show();
                                }
                            }

                            // 用于绑定的隐藏事件
                            function hideBind() {
                                scope.$apply(function () {
                                    hide();
                                });
                            }

                            // 显示 ttPopup 弹出项
                            function show() {
                                showTimeout = null;// 清除弹出定时器
                                if (hideTimeout) {// 若已经有一个删除的过渡等待执行，必须先删除它
                                    $timeout.cancel(hideTimeout);
                                    hideTimeout = null;
                                }
                                if (!scope.tt_content) {// 无内容
                                    return;
                                }
                                if (!ttPopup) {// 若此时未定义弹出项 DOM 元素 ttPopup，创建
                                    ttPopup = tooltipLinker(scope, function () {});// 获取 DOM 元素 ttPopup
                                    if (appendToBody) {// 将 ttPopup 添加到 DOM 中，以获取一些信息（宽、高等）
                                        angular.element($window.top.document.body).append(ttPopup);
                                    } else {
                                        element.after(ttPopup);
                                    }
                                }
                                scope.$digest();// 使需通过属性传递到 ttPopup 的参数生效

                                /* 计算弹出位置 */
                                var targetBCR = ttPopup[0].getBoundingClientRect()
                                    ,ttPosition
                                    ,ttStyle = {};
                                if(appendToBody){
                                    ttPosition = $position.adaptElements(element, targetBCR.width, targetBCR.height, scope.tt_placement+'-center', false, true);
                                    ttStyle = angular.extend(ttStyle, {'zIndex': $position.getZIndex()}, ttPosition[0]);
                                    //scope.tt_placement = ttPosition[1].split('-')[0]; // TODO 支持调节弹出方向 - 需获取实际弹出尺寸，可能因换行发生变化
                                }else{
                                    ttPosition = $position.positionTooltip(element, targetBCR.width, targetBCR.height, scope.tt_placement+'-center');
                                    ttStyle = angular.extend(ttStyle, ttPosition);
                                }
                                ttPopup.css(ttStyle);
                                scope.tt_isOpen = true;// 显示
                                scope.$digest();
                            }

                            // 隐藏 ttPopup 弹出项
                            function hide() {
                                scope.tt_isOpen = false;
                                // 若定义了延迟显示，取消定时
                                $timeout.cancel(showTimeout);
                                showTimeout = null;

                                // 从 DOM 中移除，若支持动画，延迟以确保动画结束后才移除
                                // FIXME: transition 库接口占位
                                if (scope.tt_animation) {// 支持切换的动画，延迟 .5s 等待动画完成（样式中 .wi-fade 暂为 .15s）
                                    if (!hideTimeout) {
                                        hideTimeout = $timeout(removeTooltip, 500);
                                    }
                                } else {
                                    removeTooltip();
                                }
                            }

                            function removeTooltip() {
                                hideTimeout = null;
                                if (ttPopup) {
                                    ttPopup.remove();
                                    ttPopup = null;
                                }
                            }

                            // Observe:弹出内容
                            attrs.$observe(type, function (val) {
                                scope.tt_content = val;
                                if (!val && scope.tt_isOpen) {// 弹出内容未定义，直接隐藏
                                    hide();
                                }
                            });

                            // Observe:延迟显示的时间
                            attrs.$observe(prefix + 'PopupDelay', function (val) {
                                var delay = parseInt(val, 10);
                                scope.tt_popupDelay = !isNaN(delay) ? delay : options.popupDelay;
                            });

                            function unbindTriggers() { // 解绑 trigger 事件
                                element.unbind(triggers.show, showBind);
                                element.unbind(triggers.hide, hideBind);
                            }
                            function bindTriggers(){ // 绑定 trigger 事件
                                if (triggers.show === triggers.hide) {
                                    element.bind(triggers.show, toggleBind);
                                } else {
                                    element.bind(triggers.show, showBind);
                                    element.bind(triggers.hide, hideBind);
                                }
                            }
                            attrs.$observe(prefix + 'Trigger', function (val) {
                                var newTriggers = getTriggers(val);// 获取最新的触发方式
                                if(newTriggers.show != triggers.show){// 发生变化时才需要重绑事件
                                    unbindTriggers();// 解绑原有的事件监听
                                    triggers = newTriggers;
                                    bindTriggers();
                                }
                            });

                            if (appendToBody) {
                                scope.$on('$locationChangeSuccess', function closeTooltipOnLocationChangeSuccess() {// 切换路由时隐藏 ttPopup
                                    if (scope.tt_isOpen) {
                                        hide();
                                    }
                                });
                            }

                            // 确保销毁并移除 ttPopup
                            scope.$on('$destroy', function onDestroyTooltip() {
                                $timeout.cancel(hideTimeout);
                                $timeout.cancel(showTimeout);
                                unbindTriggers();
                                removeTooltip();
                            });
                        };
                    }
                };
            };
        }];
    })

    .directive('tooltipPopup', function () {
        return {
            restrict: 'EA',
            replace: true,
            scope: { content: '@', placement: '@', animation: '&', isOpen: '&' },
            templateUrl: 'template/tooltip/tooltip-popup.html',
            link: function(scope, elem){
                elem.on('$destroy', function(){
                    scope.$destroy();
                });
            }
        };
    })

/**
 * @ngdoc directive
 * @name ui.wisoft.tooltip.directive:tooltip
 * @restrict A
 *
 * @description
 * 提示标签
 *
 * @param {string} tooltip 提示内容
 * @param {boolean=} tooltip-enable 是否启用 tooltip 功能，默认为 true
 * @param {string=} tooltip-placement 弹出方向，可选值：top,bottom,left,right，默认为 top。
 * @param {number=} tooltip-popup-delay 提示延迟显示时间（毫秒）
 * @param {string=} tooltip-trigger 提示触发方式，可选值：mouseenter,click,focus，默认为 mouseenter
 * @param {boolean=} tooltip-animation 显示/隐藏时是否执行动画，默认为 true。
 * @param {boolean=} tooltip-append-to-body 是否在 body 中弹出，默认为 false。
 */
    .directive('tooltip', [ '$tooltip', function ($tooltip) {
        return $tooltip('tooltip', 'tooltip', 'mouseenter');
    }])

    .directive('tooltipHtmlUnsafePopup', function () {
        return {
            restrict: 'EA',
            replace: true,
            scope: { content: '@', placement: '@', animation: '&', isOpen: '&' },
            templateUrl: 'template/tooltip/tooltip-html-unsafe-popup.html',
            link: function(scope, elem){
                elem.on('$destroy', function(){
                    scope.$destroy();
                });
            }
        };
    })

/**
 * @ngdoc directive
 * @name ui.wisoft.tooltip.directive:tooltipHtmlUnsafe
 * @restrict A
 *
 * @description
 * 提示标签 - 弹出项为自定义内容。
 *
 * @param {string} tooltipHtmlUnsafe 提示内容（html 字符串）。
 * @param {boolean=} tooltip-enable 是否启用 tooltip 功能，默认为 true
 * @param {string=} tooltip-placement 弹出方向，可选值：top,bottom,left,right，默认为 top。
 * @param {number=} tooltip-popup-delay 提示延迟显示时间（毫秒）
 * @param {string=} tooltip-trigger 提示触发方式，可选值：mouseenter,click,focus，默认为 mouseenter
 * @param {boolean=} tooltip-animation 显示/隐藏时是否执行动画，默认为 true。
 * @param {boolean=} tooltip-append-to-body 是否在 body 中弹出，默认为 false。
 */
    .directive('tooltipHtmlUnsafe', [ '$tooltip', function ($tooltip) {
        return $tooltip('tooltipHtmlUnsafe', 'tooltip', 'mouseenter');
    }]);
