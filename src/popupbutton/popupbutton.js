'use strict';
angular.module('ui.wisoft.popupbutton',['ui.wisoft.popup'])

    /**
     * @ngdoc directive
     * @name ui.wisoft.popupbutton.directive:wiPopupbutton
     * @restrict E
     *
     * @description
     * 弹出按钮
     *
     * @param {string=} label 按钮名称.
     * @param {boolean=} isopen 是否展开.
     * @param {number|length=} width popupbutton 的宽度.<br />
     *   number 将自动添加单位 px。<br />
     *   length 为 number 接长度单位（相对单位和绝对单位）。<br />
     *   相对单位：em, ex, ch, rem, vw, vh, vm, %<br />
     *   绝对单位：cm, mm, in, pt, pc, px
     */
    .directive('wiPopupbutton',[function () {
        return {
            restrict:'E',
            templateUrl: 'template/popupbutton/popupbuttonTemplate.html',
            replace:true,
            transclude:true,
            scope: {
                //Properties
                label:'@' // 按钮名称
                ,isopen:'=' // 是否展开
            },
            require: 'wiPopup',
            link: function (scope,element,attrs,popupCtrl) {
                var parentScope = scope.$parent;
                var _width = function(attr){
                    if(!attr) return;
                    var size;
                    if(/^(?:[1-9]\d*|0)(?:.\d+)?/.test(attr)){// 数字开始
                        size = attr;
                    }else{// 非数字开始，可能是 scope 对象
                        size = parentScope.$eval(attr);
                    }
                    Number(size) && (size += 'px');// 是数字则加上单位 px
                    return size;
                }(attrs['width']);
                _width && element.css('width', _width);

                // 点击弹出项不自动关闭 - 因为 popup 指令后绑定先执行，所以 popupCtrl.popupOptions.elem 已存在
                popupCtrl.popupOptions.elem.on('click', function (event) {
                    event.stopPropagation();
                })
            }
        };
    }]);