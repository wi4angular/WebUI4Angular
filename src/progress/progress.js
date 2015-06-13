'use strict';
angular.module('ui.wisoft.progress',['ui.wisoft.bindHtml'])
    .constant('progressConf', {
        initH: 9 // 进度条默认高度
    })
/**
 * @ngdoc directive
 * @name ui.wisoft.progress.directive:wiProgress
 * @restrict E
 *
 * @description
 * wiProgress 进度条组件。
 *
 * @param {string=} 进度条样式（'wave','stage'），默认为 'nomal'，其中 'wave' IE9 不支持。
 * @param {string=} label 提示文本，若定义了 labelelem，此属性失效。
 * @param {string|object=} labelelem 提示内嵌 jqlite 元素，定义后不支持修改。
 * @param {string=} labelplacement 提示的显示位置（'left'、'right'、'top'、'bottom'），默认为 'right'，定义后不支持修改。
 * @param {number=} value 进度数值，默认为 0。
 * @param {number=} maxvalue 进度最大数值，默认为 100，定义后不支持修改。
 * @param {pixels=} width 进度条宽度(不含单位：px)，默认为 100。
 * @param {pixels=} height 进度条宽度(不含单位：px)，默认为 9。
 *
 */
    .directive('wiProgress', ['progressConf','$parse','$compile','$interval', function(progressConf,$parse, $compile,$interval){
        return {
            restrict: 'E'
            ,templateUrl: 'template/progress/wi-progress.html'
            ,replace: true
            ,scope: {}
            ,link: function(scope, elem, attrs){
                var parentScope = scope.$parent;
                var barElem = angular.element(elem.children()[0]);// bar 对应的 jqlite 元素

                /* 外观 */
                var barStyle = {};
                var width = parentScope.$eval(attrs['width']);// bar 宽度
                (angular.isNumber(width)) && (barStyle.width = width + 'px');
                var height = parentScope.$eval(attrs['height']);// bar 高度
                (angular.isNumber(height)) && (barStyle.height = height + 'px');
                barElem.css(barStyle);
                var type = parentScope.$eval(attrs['type']);
                if(type && type!='normal') barElem.addClass('wi-progress-bar-'+type);

                var stageTimer, stageStep = 0;
                if(type == 'stage'){// 阶段动画
                    var remainElem = angular.element(barElem.children()[1]);// remain 对应的 jqlite 元素，stage 型需改变其长度，css3 控制 background-size 仅谷歌支持较好
                    remainElem.css('display','block');
                    stageTimer = $interval(function(){
                        if(stageStep > 100 - scope.percent){
                            stageStep = 0;
                            remainElem.css('width',stageStep + '%');
                        }
                        else{
                            stageStep += 5;
                            remainElem.css('width',stageStep + '%');
                        }
                    },40);
                }

                scope.animation = (type=='normal');

                /* 提示部分内容 */
                var labelElem
                    ,labelPlacement = parentScope.$eval(attrs['labelplacement']);
                if(attrs['labelelem']){// 嵌入 html
                    scope.labelelem = parentScope.$eval(attrs['labelelem']);
                    labelElem = $compile('<div bind-html-unsafe="labelelem"></div>')(scope);
                }
                else if (attrs['label']) {// 有 label 属性，添加文字显示节点，并监听 label
                    var _setLabel
                        ,_getLabel = $parse(attrs.label);
                    _setLabel = _getLabel.assign;
                    scope.label = _getLabel(parentScope);
                    _setLabel && parentScope.$watch(_getLabel, function(val, wasVal) {
                        if(val !== wasVal) scope.label = val;
                    });
                    labelElem = $compile('<div ng-bind="label"></div>')(scope);
                }
                // 若要显示提示，判断位置
                if(labelElem){
                    if(labelPlacement == 'top' || labelPlacement == 'left'){
                        labelElem.addClass('wi-progress-'+labelPlacement);
                        elem.prepend(labelElem);
                    }else{
                        if(labelPlacement == 'center'){
                            labelElem.css('line-height',(barStyle.height || progressConf.initH + 'px'));
                        }else if(labelPlacement != 'bottom'){
                            labelPlacement = 'right';
                        }
                        labelElem.addClass('wi-progress-'+labelPlacement);
                        elem.append(labelElem);
                    }
                }

                /* 进度计算 */
                var ratio = 100 / (parentScope.$eval(attrs['maxvalue']) || 100);// 100 与 maxvalue 的比率，用于通过 value 计算进度
                if (attrs['value']) {// 有 value 属性，监听
                    var _setValue
                        ,_getValue = $parse(attrs.value);
                    _setValue = _getValue.assign;
                    scope.percent = _getValue(parentScope) * ratio;
                    _setValue && parentScope.$watch(_getValue, function(val, wasVal) {
                        if(val !== wasVal) {
                            scope.percent = val * ratio;
                        }
                    });
                }

                scope.$on('$destroy', function() {// 销毁
                    labelElem && labelElem.remove();
                    stageTimer && $interval.cancel(stageTimer);
                    stageTimer = undefined;
                });
            }
        }
    }]);