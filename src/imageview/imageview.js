/**
 * @ngdoc overview
 * @name ui.wisoft.imageview
 *
 * @description
 * 图片查看组件
 *
 * 主要功能：<br>
 * （1）支持多图片查看<br>
 * （2）支持图片旋转、缩放、拖动等功能<br>
 * （3）支持两种数据源;普通图片url和图像数据对象ImageData
 */
'use strict';
angular.module('ui.wisoft.imageview', [])
/**
 * @ngdoc directive
 * @name ui.wisoft.imageview.directive:wiImageview
 * @restrict E
 *
 * @description
 *图片查看组件
 *
 * @param {pixels} width 组件宽度(不含单位：px)。
 * @param {pixels} height 组件高度(不含单位：px)。
 * @param {boolean=} adaptive 第一次打开图片时是否自适应大小，默认值false
 * @param {array} imageurls 支持的第一种数据源：图片地址数组，如果数组中只有一张图片，则没有上一张和下一张按钮
 * @param {object} imagedata 支持的第二种数据源：图片数据对象，类型为ImageData
 * @param {number=} openindex 初始打开图片序号(数据源为imageurls时)，未绑定此属性，则默认值为0
 * @param {function=} previous 点击上一张图片按钮时回调方法，可与imagedata数据源结合实现上一页功能；如果未设置该回调方法，则无上一页按钮
 * @param {function=} next 点击下一张图片按钮时回调方法，可与imagedata数据源结合实现下一页功能；如果未设置该回调方法，则无下一页按钮
 * @param {function=} close 关闭时的回调方法
 *
 */
    .directive('wiImageview', function () {
        return {
            restrict: 'E',
            templateUrl: function (element, attr) {
                return 'template/imageview/imageviewTemplate.html';
            },
            transclude: true,
            replace: true,
            scope: {
                width: '@',
                height: '@',
                adaptive: '@',
                imageurls: '=',
                imagedata: '=',
                openindex: '=',
                onPrevious: '&previous',
                onNext: '&next',
                onClose: '&close'
            },
            controller: ['$scope', function ($scope) {
            }],
            link: function (scope, element, attrs) {
                scope._width = scope.width;
                scope._height = scope.height;
                scope._imageurls = scope.imageurls == undefined ? [] : scope.imageurls;//图片数组
                scope._openindex = scope.openindex == undefined ? 0 : scope.openindex;//打开图片的序号
                scope._adaptive = scope.adaptive == undefined? false:scope.adaptive;
                scope.isopen = false;//是否显示
                scope.isfull = false;

                scope._show_save = true;//保存按钮是否显示标志
                scope._show_previous = true;//上一页按钮是否显示标志
                scope._show_next = true;//下一页按钮是否显示标志

                var _model_url = scope._imageurls.length==0?false:true;//数据源模式
                var _radian = 0;//旋转变换参数
                var _zoom = 1;//缩放比率
                var img_center_x = scope._width / 2;//中心的x坐标
                var img_center_y = scope._height / 2;//中心点y坐标
                //初始大小
                var init_width = scope._width;
                var init_height = scope._height;
                //初始定位
                var init_top = 0;
                var init_left = 0;

                //初始化画布和图像
                var _canvas = document.createElement('canvas');
                _canvas.width = scope._width;// 只能是像素值
                _canvas.height = scope._height;
                var _canvas_context = _canvas.getContext('2d');

                //图片数据源，url或ImageData
                var _image;

                if (_model_url) {
                    initImage();
                    if (scope._imageurls.length==1) {
                        scope._show_previous = false;
                        scope._show_next = false;
                    }
                } else {
                    scope._show_save = false;
                    if (scope.onPrevious == undefined) {
                        scope._show_previous = false;
                    }
                    if (scope.onNext == undefined) {
                        scope._show_next = false;
                    }
                }

                //监测打开图片的序号
                scope.$watch('openindex', function (newValue, oldValue) {
                    if (newValue != undefined && newValue != -1) {
                        scope._openindex = scope.openindex;
                        scope.open();
                    }
                }, false);

                //监测图片数组数据源
                scope.$watch('imageurls', function (newValue, oldValue) {
                    if (newValue != undefined) {
                        scope._imageurls = scope.imageurls;
                    }
                }, false);

                //监测图片数据源
                scope.$watch('imagedata', function (newValue, oldValue) {
                    if (newValue != undefined && newValue != null && newValue != oldValue) {
                        scope.isopen = true;
                        if (scope.imagedata == undefined || scope.imagedata == null) {
                            scope.img_exclass = 'wi-imageview-pic-error';
                        } else {
                            //ImageData对象直接绘制在Canvas上不支持自定义原点和旋转缩放
                            //所以先将数据对象绘制到临时画布上，在将临时画布绘制到真实画布上
                            _image = document.createElement('canvas');
                            _image.width = scope.imagedata.width;
                            _image.height = scope.imagedata.height;
                            var _image_context = _image.getContext('2d');
                            _image_context.putImageData(scope.imagedata,0,0);
                            scope.open();
                        }
                    }
                }, false);

                function initImage() {
                    _image = new Image();
                    _image.onload = img_onload;
                    _image.onerror = img_onerror;
                }

                //图像添加加载成功、失败监听
                function img_onload(e) {
                    scope.img_exclass = null;
                    scope.$apply('img_exclass');
                    initAdaptiveZoom();
                    redrawImage();
                }
                function img_onerror(e) {
                    //显示错误图片
                    scope.img_exclass = 'wi-imageview-pic-error';
                    scope.$apply('img_exclass');

                    //清除画布内容
                    clearcanvas();

                    //重新初始化图像，IE10、IE9 BUG，加载错误后必须重新初始化
                    _image = new Image();
                    _image.onload = img_onload;
                    _image.onerror = img_onerror;
                }

                //清除画布内容
                function clearcanvas() {
                    _canvas_context.save();
                    _canvas_context.clearRect(0, 0, scope._width, scope._height);//清空内容
                    _canvas_context.restore();
                }

                //初始化图片参数
                function initimg() {
                    _radian = 0;
                    _zoom = 1;
                    img_center_x = scope._width / 2;
                    img_center_y = scope._height / 2;
                }

                //重新加载图片
                function reloadimg() {
                    initimg();
                    scope.img_exclass = "wi-imageview-pic-loading";
                    if (_model_url) {
                        _image.src = scope._imageurls[scope._openindex];
                    } else {
                        clearcanvas();
                    }
                }

                //打开
                scope.open = function () {
                    document.documentElement.style.overflow = "hidden";
                    init_left = scope.left = (document.documentElement.clientWidth - scope._width) / 2 + "px";
                    init_top = scope.top = (document.documentElement.clientHeight - scope._height) / 2 + "px";
                    scope.isopen = true;
                    if (_model_url) {
                        initImage();
                        _image.src = scope._imageurls[scope._openindex];
                        scope.img_exclass = "wi-imageview-pic-loading";
                    } else {
                        initimg();
                        initAdaptiveZoom();
                        redrawImage();
                    }
                };

                //重绘画布
                function redrawImage() {
                    _canvas_context.save();
                    _canvas_context.clearRect(0, 0, scope._width, scope._height);//清空内容
                    _canvas_context.translate(img_center_x, img_center_y);//中心坐标
                    _canvas_context.rotate(_radian);//旋转
                    _canvas_context.scale(_zoom, _zoom);//缩放
                    _canvas_context.drawImage(_image, -_image.width / 2, -_image.height / 2);
                    _canvas_context.restore();
                }

                //图像大小自适应时计算缩放比率
                function initAdaptiveZoom() {
                    if (scope._adaptive && (_image.width>scope._width || _image.height>scope._height)) {
                        var ws = scope._width/_image.width;
                        var hs = scope._height/_image.height;
                        _zoom = Math.floor(Math.min(ws, hs)*10)/10;
                    }
                }

                //获取canvas父容器对象，并将canvas添入其中
                var dom_divs = element.find('div');
                var canvas_div;
                for (var i = 0; i < dom_divs.length; i++) {
                    if (dom_divs[i].className == 'wi-imageview-pic') {
                        canvas_div = dom_divs[i];
                        canvas_div.appendChild(_canvas);
                        break;
                    }
                }

                //关闭
                scope.close = function () {
                    if (_model_url) {
                        scope._openindex = scope.openindex = -1;
                    }
                    scope.isfull = false;
                    scope.isopen = false;
                    scope.img_exclass = null;
                    scope.top = init_top;
                    scope.left = init_left;
                    scope._width = init_width;
                    scope._height = init_height;
                    initimg();
                    clearcanvas();
                    document.documentElement.style.overflow = "auto";

                    if (scope.onClose) {
                        scope.onClose();//调用回调
                    }
                };

                //上一张
                scope.previous = function () {
                    if (_model_url) {
                        if (scope._openindex == 0) {
                            scope._openindex = scope._imageurls.length - 1;
                        } else {
                            scope._openindex -= 1;
                        }
                    }
                    reloadimg();

                    if (scope.onPrevious) {
                        scope.onPrevious();//调用回调
                    }
                };

                //下一张
                scope.next = function () {
                    if (_model_url) {
                        if (scope._openindex == scope._imageurls.length - 1) {
                            scope._openindex = 0;
                        } else {
                            scope._openindex += 1;
                        }
                    }
                    reloadimg();

                    if (scope.onNext) {
                        scope.onNext();//调用回调
                    }
                };

                //顺时针旋转
                scope.toleft = function () {
                    _radian += Math.PI / 2;
                    redrawImage();
                };

                //逆时针旋转
                scope.toright = function () {
                    _radian -= Math.PI / 2;
                    redrawImage();
                };

                //缩小
                scope.zoomin = function () {
                    if (_zoom > 0.2) {
                        _zoom -= .1;
                        redrawImage();
                    }
                };

                //放大
                scope.zoomout = function () {
                    _zoom += .1;
                    redrawImage();
                };

                //重置
                scope.reset = function () {
                    initimg();
                    redrawImage();
                };

                //全屏
                scope.full = function () {
                    scope.top = 0;
                    scope.left = 0;
                    scope._width = _canvas.width = document.documentElement.clientWidth;
                    scope._height = _canvas.height = document.documentElement.clientHeight;
                    img_center_x = scope._width / 2;
                    img_center_y = scope._height / 2;
                    redrawImage();
                    scope.isfull = true;
                };

                //退出全屏
                scope.origin = function() {
                    scope.top = init_top;
                    scope.left = init_left;
                    scope._width = init_width;
                    scope._height = init_height;
                    img_center_x = scope._width / 2;
                    img_center_y = scope._height / 2;

                    //chrome BUG,变为初始化大小时需要新建一个画布
                    canvas_div.removeChild(_canvas);
                    _canvas = document.createElement('canvas');
                    _canvas.width = scope._width;
                    _canvas.height = scope._height;
                    _canvas_context = _canvas.getContext('2d');
                    canvas_div.appendChild(_canvas);

                    scope.reset();
                    scope.isfull = false;
                }

                //滚轮放大缩小
                //由于angularjs没有鼠标滚轮事件，所以采用监听图片容器鼠标移入移出事件来实现
                scope.mouseenter = function () {
                    element.bind('mousewheel', function (e) {
                        if (e.wheelDelta > 0 || (e.originalEvent != undefined && e.originalEvent.wheelDelta > 0)) {
                            _zoom += .1;
                        } else if (_zoom > 0.2) {
                            _zoom -= .1;
                        } else {
                            return;
                        }
                        redrawImage();
                        e.preventDefault();
                    });
                };
                scope.mouseleave = function () {
                    element.unbind('mousewheel');
                };

                //图片拖动
                var start_x;
                var start_y;
                scope.mousedown = function (e) {
                    start_x = e.clientX;
                    start_y = e.clientY;
                    document.onmousemove = movemouse;
                    document.onmouseup = mouseup;
                };
                function mouseup(e) {
                    document.onmousemove = null;
                    document.onmouseup = null;
                    return false;
                }
                function movemouse(e) {
                    img_center_x += e.clientX - start_x;
                    img_center_y += e.clientY - start_y;
                    start_x = e.clientX;
                    start_y = e.clientY;
                    redrawImage();
                    return false;
                }
            }
        }
    });
