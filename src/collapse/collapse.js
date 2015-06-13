angular.module('ui.wisoft.collapse', ['ui.wisoft.transition'])
/**
 * @ngdoc directive
 * @name ui.wisoft.collapse.directive:wiCollapse
 * @restrict A
 *
 * @description
 * wiCollapse 用于实现元素的折叠展开操作，若元素需指定高度，请在 style 中定义 height，否则无法获取，将默认为 auto。<br />
 * IE9 及以下版本不支持动画；此外，若将 height 设置为 'calc(……)'，切换时将跳过动画。
 *
 * @param {boolean} wiCollapse true 时折叠，false 时展开。
 */
    .directive('wiCollapse', ['$transition', function ($transition) {
        return {
            link: function (scope, element, attrs) {
                var initialAnimSkip = true // 初始化时，是否跳过动画
                    ,currentTransition
                    ,oldCssH;// 记录原始定义的 css 中的 height

                function doTransition(change) {// 过渡到 change ( class 名、函数、style 集合)
                    var newTransition = $transition(element, change);
                    if (currentTransition) {// 取消正在执行的 transition
                        currentTransition.cancel();
                    }
                    currentTransition = newTransition;
                    newTransition.then(newTransitionDone, newTransitionDone);//transition （成功，失败）时执行回调函数，返回新的 promise 对象
                    return newTransition;

                    function newTransitionDone() {// transition 完成后执行
                        if (currentTransition === newTransition) {
                            currentTransition = undefined;
                        }
                    }
                }

                function getCssH(){
                    var h = element[0].style.height;
                    (h=='' || h=='0px') && (h='auto');// 未定义初始高度则为 auto
                    return h;
                }

                function expand() {// 展开
                    !oldCssH && (oldCssH = getCssH());
                    if (initialAnimSkip || oldCssH.indexOf('calc')>=0) {//calc 在IE中无法识别并进行动画，直接跳过
                        initialAnimSkip = false;
                        expandDone();
                    } else {
                        element.removeClass('wi-collapse').addClass('wi-collapsing');// 过渡效果
                        doTransition({ height: oldCssH=='auto'?element[0].scrollHeight + 'px':oldCssH }).then(expandDone);
                    }
                }

                function expandDone() {// 展开动作完成时的状态
                    element.removeClass('wi-collapsing wi-collapse');
                    element.css({height: oldCssH});
                }
                function collapse() {// 折叠
                    !oldCssH && (oldCssH = getCssH());
                    if (initialAnimSkip || oldCssH.indexOf('calc')>=0) {//calc 在IE中无法识别并进行动画，直接跳过
                        initialAnimSkip = false;
                        collapseDone();
                    } else {
                        // transitions 对 height: auto 无效，需要指定初始 height
                        (oldCssH=='auto') && element.css({ height: element[0].scrollHeight + 'px' });
                        // 触发 reflow，使 height 更新 —— 上一步似乎已经达到这个效果
                        var x = element[0].offsetWidth;// 去掉后折叠时 360 中不出现动画
                        element.addClass('wi-collapsing');
                        doTransition({ height: 0 }).then(collapseDone);
                    }
                }

                function collapseDone() {// 折叠动作完成时的状态
                    element.removeClass('wi-collapsing').addClass('wi-collapse');
                    element.css({height: 0});
                }

                scope.$watch(attrs.wiCollapse, function (shouldCollapse) {// 监听 collapse 属性，true 则折叠，false 则展开
                    if (shouldCollapse) {
                        collapse();
                    } else {
                        expand();
                    }
                });
            }
        };
    }]);
