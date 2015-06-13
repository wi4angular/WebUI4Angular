'use strict';
angular.module('ui.wisoft.camerascanner',['ui.wisoft.alert', 'ui.wisoft.dialog', 'ui.wisoft.imageview'])

    /**
     * @ngdoc directive
     * @name ui.wisoft.camerascanner.directive:wiCamerascanner
     * @restrict E
     *
     * @description
     * 拍照上传
     *
     * @param {string=} url 上传地址.
     * @param {boolean=} toPdf 是否转pdf，默认为true.
     * @param {function=} uploadComplete 上传完成回调.
     *
     */
    .directive('wiCamerascanner',['wiAlert', 'wiDialog', function (wiAlert, wiDialog) {
        return {
            restrict:'E',
            transclude:true,
            templateUrl: 'template/camerascanner/camerascannerTemplate.html',
            replace:true,
            scope: {
                url:'@'// 上传地址
                ,uploadcomplete:'&'// 上传完成回调
                ,topdf:'@'// 是否转pdf，默认为true
            },
            link: function (scope,element,attrs) {

                var cam = element.find('OBJECT')[0];// 摄像头
                var photoMain = document.querySelector('.wi-camerascanner-main');
                var photo = angular.element(document.querySelector('.wi-camerascanner'));
                var photoList = document.querySelector('.wi-camerascanner-list');// 图片列表div
                var headSelect = document.querySelector('.wi-camerascanner-head-select');// 视频设备选择
                var divLoad = document.createElement("div");// 正在生产图片...
                divLoad.setAttribute('class', 'wi-camerascanner-photo wi-camerascanner-wait');
                var captureBtn = document.querySelector('.wi-camerascanner-btn');// 拍照按钮

                // 供as调用
                window["_webcam_"] = {
                    "debug": function(type, message) {
                        if(type === 'cams') {
                            createSelector(message);
                        } else {
                            scope.debug(type, message)
                        };
                    }
                }

                var sl;
                // 设备选择下拉框
                function createSelector(str) {
                    sl=document.createElement("select");
                    for(var i=str.length-1; i>=0; i--){
                        var name = str[i];
                        name = name.substring(0, name.indexOf(' ('));
                        var item=new Option(name,i);
                        sl.add(item);
                    }
                    sl.onchange = function(){
                        var val = sl.options[sl.options.selectedIndex].value;
                        cam['selectCamera'](val);
                    }
                    headSelect.appendChild(sl);
                    headSelect.style.visibility = 'visible';
                }

                // 调试信息
                scope.debug = function(type, message) {

                    switch (type) {
                        case 1:// 未检测到摄像头
                            wiAlert.error(message);
                            break;
                        case 2:// 无法连接到摄像头
                            wiAlert.error(message);
                            break;
                        case 3:// 上传失败
                            wiAlert.error(message);
                            break;
                        case 4:// 正在生成pdf

                            break;
                        case 5:// 上传成功
                            scope.close();
                            wiAlert.success('上传成功')
                                .yes(function(){
                                    scope.uploadcomplete() && scope.uploadcomplete()(message);
                                })
                            break;
                        case 6:// 连接到摄像头
                            break;
                        default:
                            console.log(type + ": " + message);
                    }
                }

                // 打开摄像头
                scope.open = function() {
                    var docHeight = document.documentElement.clientHeight;
                    photoMain.style['margin-top'] = (docHeight > 592 ? (docHeight-592)/2 : 2) + 'px';
                    photo.removeClass('wi-camerascanner-hide')
                    var val;
                    if(sl) {
                        val = sl.options[sl.options.selectedIndex].value;
                    }
                    cam['openCamera'](val);
                }

                // 关闭摄像头
                scope.close = function() {
                    cam['closeCamera'] && cam['closeCamera']();
                    while (photoList.hasChildNodes()) {
                        photoList.removeChild(photoList.lastChild);
                    }
                    photo.addClass('wi-camerascanner-hide');
                    _index = 0;
                }

                // 旋转
                scope.rotate = function(degree) {
                    cam['rotate'](degree);
                }

                // 重置裁剪区域
                scope.resetCut = function() {
                    cam['resetCut']();
                }

                scope.camResolution = '1200*1600';
                // 切换分辨率
                scope.resolution = function() {
                    var arr = scope.camResolution.split('*');
                    cam['resolution'](arr[0], arr[1]);
                }

                // 拍照
                captureBtn.addEventListener('click', capture, false);

                function capture() {
                    if(_index===20) {
                        wiAlert.warn('不能超过20张，请分批操作');
                    } else {
                        // 正在生成图片
                        var arr = cam['prepareCapture']();
                        divLoad.style.width = '222px';
                        divLoad.style.height = 220/arr[0]*arr[1]+2+'px';
                        photoList.insertBefore(divLoad, photoList.firstChild);

                        setTimeout(function(){
                            show(cam['capture'](null, null, 100));
                        }, 0)
                    }
                }

                var _index = 0, currentIndex;
                // 显示缩略图
                function show(data) {

                    photoList.removeChild(divLoad);

                    var div = document.createElement('div');
                    div.setAttribute('class', 'wi-camerascanner-photo');
                    div.setAttribute('index', _index+'');
                    div.setAttribute('id', '_cam_list_div_'+_index);
                    div.setAttribute('_width', data[1]);
                    div.setAttribute('_height', data[2]);

                    var canvas = document.createElement('canvas'),
                        context = canvas.getContext("2d");

                    canvas.setAttribute('width', data[1]);
                    canvas.setAttribute('height', data[2]);

                    var img = new Image();

                    img.onload = function() {
                        context.drawImage(img, 0, 0, data[1], data[2]);

                        canvas.style.width = '220px';
                        canvas.style.height = 220/data[1]*data[2]+'px';

                        div.style.width = '222px';
                        div.style.height = 220/data[1]*data[2]+2+'px';

                        context.drawImage(context.canvas,0,0);

                        // 双击查看
                        canvas.onclick = function () {
                            scope.$apply(function(){
                                currentIndex = Number(div.getAttribute('index'));
                                getImage(data[1], data[2]);
                                cam.style.visibility = 'hidden';
                            })
                        }

                        div.appendChild(canvas);

                        var a = document.createElement('a');
                        a.setAttribute('href', 'javascript:void(0);');
                        a.setAttribute('class', 'icon-remove');

                        // 移除
                        a.onclick = function () {
                            scope.$apply(function(){

                                var idx = Number(div.getAttribute('index'));
                                cam['removeImg'](idx);

                                photoList.removeChild(div);

                                var brother = photoList.children[idx];
                                while(brother) {
                                    brother.setAttribute('index', idx);
                                    brother.setAttribute('id', '_cam_list_div_'+idx);
                                    brother = photoList.children[++idx];
                                }

                                _index--;
                            })
                        }

                        div.appendChild(a);

                        var txt = document.createElement('div');
                        txt.innerHTML = 'img'+_index;
                        txt.setAttribute('contenteditable', true);

                        div.appendChild(txt);

                        div.onmouseover = function(){
                            txt.style.display = 'block';
                        }

                        div.onmouseout = function(){
                            txt.style.display = 'none';
                        }


                        photoList.insertBefore(div, photoList.firstChild);

                        _index++;
                    }

                    img.src = 'data:image/jpg;base64,' + data[0];

                }

                // 上一个
                scope.previous = function() {
                    if(currentIndex > 0) {
                        currentIndex--;
                    } else {
                        currentIndex = _index-1;
                    }
                    getImage();
                }

                // 下一个
                scope.next = function() {
                    if(currentIndex < _index-1) {
                        currentIndex++;
                    } else {
                        currentIndex = 0;
                    }
                    getImage();
                }

                // 图片查看关闭
                scope.viewClose = function() {
                    cam.style.visibility = 'visible';
                }

                // 获取image数据
                function getImage() {
                    var div = document.getElementById('_cam_list_div_'+currentIndex);
                    var w = Number(div.getAttribute('_width'));
                    var h = Number(div.getAttribute('_height'));
                    scope.imagedata = photoList.children[currentIndex].children[0].getContext("2d").getImageData(0, 0, w, h);
                }

                // 上传
                scope.upload = function() {
                    cam.style.visibility = 'hidden';
                    wiDialog.openConfirm({
                        template: 'cameraScannerConfirm',
                        width:300,
                        title:'请输入文件名'
                    }).then(function (value) {
                        // TODO 文件名不能为空 需加入表单验证
						// 是否转PDF，由第三个参数控制boolean，默认为true
                        if(value) {
                            cam['upload'] && cam['upload'](scope.url, value, !scope.topdf || 'false' != scope.topdf);
                        } else {
                            cam.style.visibility = 'visible';
                        }
                    }, function () {
                        cam.style.visibility = 'visible';
                    });
                }
            }
        };
    }])
