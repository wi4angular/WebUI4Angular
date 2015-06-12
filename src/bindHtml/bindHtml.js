angular.module('ui.wisoft.bindHtml', [])

/**
 * @ngdoc directive
 * @name ui.wisoft.bindHtml.directive:bindHtmlUnsafe
 * @restrict A
 *
 * @description
 * bindHtmlUnsafe 可以指定该元素中的内容。
 *
 * @param {string} bindHtmlUnsafe 绑定了该元素内容的 scope 中的对象名（其值可以为 html 代码段的字符串，或 jqlite 元素）
 *
 */
    .directive('bindHtmlUnsafe', function () {
        return function (scope, element, attr) {
            element.addClass('ng-binding').data('$binding', attr.bindHtmlUnsafe);
            scope.$watch(attr.bindHtmlUnsafe, function bindHtmlUnsafeWatchAction(value) {
                if(!value) return;
                if(typeof value == 'string')
                    element.html(value || '');
                else{
                    element.empty().append(value);
                }
            });
        };
    });