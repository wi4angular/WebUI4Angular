/**
 * Created by QianQi on 2014/11/10.
 */

angular.module('ui.wisoft.button', [])
/**
 * @ngdoc directive
 * @name ui.wisoft.button.directive:wiButton
 * @restrict E
 *
 * @description
 * wiButton 是按钮。
 *
 * @param {string=} label 按钮文字内容。
 * @param {number|length=} width 按钮的宽度，未定义时根据文字自适应，若同时指定 width,height 内容溢出时将隐藏。<br />
 *   number 将自动添加单位 px。<br />
 *   length 为 number 接长度单位（相对单位和绝对单位）。<br />
 *   相对单位：em, ex, ch, rem, vw, vh, vm, %<br />
 *   绝对单位：cm, mm, in, pt, pc, px
 * @param {number|length=} height 按钮的高度，未定义时为默认高度，若同时指定 width,height 内容溢出时将隐藏。<br />
 *   说明同 width。
 * @param {string=} iconl 左 icon 图片路径。
 * @param {string=} iconr 右 icon 图片路径。
 * @param {string=} witype 按钮类型，可选项：'submit','reset','button'，默认：'button'
 * @param {boolean=} disabled 禁用。
 *
 */
    .directive('wiButton', [function(){
        return{
            restrict: 'E',
            templateUrl: 'template/button/wi-button.html',
            replace: true,
            transclude: true,
            scope: {},
            link: function(scope, elem, attrs){
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

                scope.btnOptions = {
                    label: attrs['label'] || '',
                    width: getSizeFromAttr(attrs['width']) || null,
                    height: getSizeFromAttr(attrs['height']) || null,
                    iconl: attrs['iconl'] || '',
                    iconr: attrs['iconr'] || '',
                    type: attrs['witype'] || 'button'
                };
                if(scope.btnOptions.width && scope.btnOptions.height){
                    elem.css('overflow','hidden');
                }
                if(attrs.hasOwnProperty('disabled') && attrs['disabled'] != 'false'){// 是否禁用
                    elem[0].disabled = true;
                }
                elem[0].setAttribute('type',scope.btnOptions.type);
            }
        }
    }]);
