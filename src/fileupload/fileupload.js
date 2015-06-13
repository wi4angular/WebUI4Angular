'use strict';
angular.module('ui.wisoft.fileupload',['ui.wisoft.position','ui.wisoft.progress'])
    .constant('fileuploadConf', {
        STARTED: 1// 文件队列正在上传
        ,STOPED: 2// 文件队列上传未开始或已结束
        ,queued: 1// 某个文件正在排队
        ,uploading: 2// 某个文件正在上传
        ,completed: 3// 某个文件上传成功
        ,failed: 4// 某个文件上传出错
    })
    .service('fileuploadSev', function(){
        var key = 0;//辅助生成唯一 id
        return{
            /**
             * 格式化文件大小：将以 b 为单位的数字串格式化为合适的单位
             * @param e 数字
             */
            formatSize: function(e) {
                function t(e, t) {
                    return Math.round(e * Math.pow(10, t)) / Math.pow(10, t)
                }
                if (e === undefined || /\D/.test(e) ) return 'NaN';
                var r = Math.pow(1024, 4);
                return e > r ?
                    t(e / r, 1) + " tb" :
                        e > (r /= 1024) ?
                    t(e / r, 1) + " gb" :
                        e > (r /= 1024) ?
                    t(e / r, 1) + " mb" :
                        e > 1024 ?
                    Math.round(e / 1024) + " kb" :
                    e + " b";
            }
            /**
             * 分析文件大小：将有单位的文件大小转换为 b 为单位的数字
             * @param e 字符串
             */
            ,parseSize: function(e) {
                if ("string" != typeof e)return e;
                var t = {t: 1099511627776, g: 1073741824, m: 1048576, k: 1024}, n;
                return e = /^([0-9]+)([mgk]?)$/.exec(e.toLowerCase().replace(/[^0-9mkg]/g, "")), n = e[2], e = +e[1], t.hasOwnProperty(n) && (e *= t[n]), e
            }
            /**
             * 根据后缀名格式化 accept 字符串
             * @param mimesJson 类似 "mp3,mp4" 的后缀名字符串
             */
            ,formatMimetype: function(mimesJson){
                var acceptStr = ''
                    ,mimegroup
                    ,_mimeList= {
                        '3g2': "video/3gpp2",
                        '3gp': "video/3gpp",
                        '3gpp': "video/3gpp",
                        'aac': "audio/aac",
                        'ac3': "audio/ac3",
                        'ai': "application/postscript",
                        'aif': "audio/aiff",
                        'aiff': "audio/aiff",
                        'asc': "text/plain",
                        'avi': "video/avi",
                        'bmp': "image/bmp",
                        'css': "text/css",
                        'csv': "text/csv",
                        'diff': "text/plain",
                        'doc': "application/msword",
                        'docx': "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                        'dot': "application/msword",
                        'dotx': "application/vnd.openxmlformats-officedocument.wordprocessingml.template",
                        'eps': "application/postscript",
                        'exe': "application/octet-stream",
                        'flac': "audio/flac",
                        'flv': "video/x-flv",
                        'gif': "image/gif",
                        'htm': "text/html",
                        'html': "text/html",
                        'jpe': "image/jpeg",
                        'jpeg': "image/jpeg",
                        'jpg': "image/jpeg",
                        'js': "application/x-javascript",
                        'json': "application/json",
                        'log': "text/plain",
                        'm2v': "video/mpeg",
                        'm4a': "audio/x-m4a",
                        'm4v': "video/x-m4v",
                        'mkv': "video/x-matroska",
                        'mov': "video/quicktime",
                        'mp2': "audio/mpeg",
                        'mp3': "audio/mpeg",
                        'mp4': "video/mp4",
                        'mpe': "video/mpeg",
                        'mpeg': "video/mpeg",
                        'mpega': "audio/mpeg",
                        'mpg': "video/mpeg",
                        'mpga': "audio/mpeg",
                        'oga': "audio/ogg",
                        'ogg': "audio/ogg",
                        'ogv': "video/ogg",
                        'otf': "application/vnd.oasis.opendocument.formula-template",
                        'pdf': "application/pdf",
                        'pgp': "application/pgp-signature",
                        'png': "image/png",
                        'pot': "application/vnd.ms-powerpoint",
                        'potx': "application/vnd.openxmlformats-officedocument.presentationml.template",
                        'pps': "application/vnd.ms-powerpoint",
                        'ppsx': "application/vnd.openxmlformats-officedocument.presentationml.slideshow",
                        'ppt': "application/vnd.ms-powerpoint",
                        'pptx': "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                        'ps': "application/postscript",
                        'psd': "image/photoshop",
                        'qt': "video/quicktime",
                        'rtf': "text/rtf",
                        'rv': "video/vnd.rn-realvideo",
                        'svg': "image/svg+xml",
                        'svgz': "image/svg+xml",
                        'swf': "application/x-shockwave-flash",
                        'swfl': "application/x-shockwave-flash",
                        'text': "text/plain",
                        'tif': "image/tiff",
                        'tiff': "image/tiff",
                        'txt': "text/plain",
                        'wav': "audio/x-wav",
                        'webm': "video/webm",
                        'wma': "audio/x-ms-wma",
                        'wmv': "video/x-ms-wmv",
                        'xhtml': "text/html",
                        'xlb': "application/vnd.ms-excel",
                        'xls': "application/vnd.ms-excel",
                        'xlsx': "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                        'zip': "application/zip"
                    };
                mimesJson && angular.forEach(mimesJson, function(mime){
                    mimegroup = mime.extensions.replace(' ','').split(',');
                    angular.forEach(mimegroup, function(m){
                        acceptStr += _mimeList[m] + ',';
                    })
                });
                return acceptStr.length ? ' accept="' + acceptStr.slice(0,-1) + '"' : '';
            }
            /**
             * 生成并返回唯一 id
             * @param t 生成的唯一 id 的前缀
             */
            ,getUid: function (t) {
                var n = (new Date).getTime().toString(32), i;
                for (i = 0; 5 > i; i++)n += Math.floor(65535 * Math.random()).toString(32);
                return(t || "o_") + n + (key++).toString(32)
            }
            /**
             * 返回对应的文件类型用以选择显示图标
             * @param t accept 类型字符串
             */
            ,getType: function(t){
                if(t.indexOf('image')==0) {
                    return 'picture';
                } else if(t.indexOf('video')==0) {
                    return 'film';
                } else if(t.indexOf('audio')==0) {
                    return 'music';
                } else {
                    return 'file';
                }
            }
        }
    })

/**
 * @ngdoc directive
 * @name ui.wisoft.fileupload.directive:wiFileupload
 * @restrict E
 *
 * @description
 * wiFileupload 文件上传组件，用于显示文件上传的进度和状态（IE9 暂未实现）。
 *
 * @param {string} wiUrl 用于处理上传的 url（若此 url 与当前页面不在同一个域名范围且未在服务端设置 Access-Control-Allow-Origin，可能会被浏览器拦截）。
 * @param {string} wiTrigger 触发文件选择弹窗的元素 id。
 * @param {string|number=} wiMaxSize 允许上传的文件的最大 size，可以为形如“4mb，4k”的字符串，也可以为以“b”为单位的数字。
 * @param {string=}  wiMimeTypes 允许上传的文件的后缀名，不设置则不限制，格式为：[{ title: 'music', extensions: 'mp3,mp4' },{ title: 'text', extensions: 'txt' }]。
 * @param {boolean=}  wiMultisel 支持多选时需设置此属性，默认不支持。
 * @param {boolean=}  wiModal 设置此属性时上传进度及状态将模态显示，上传过程中不能进行其他操作。
 * @param {string=}  wiResponse 父 scope 中用于获取返回值的变量名。
 * @param {string=}  wiSwf 对不支持 html5 上传方式的浏览器使用 flash 上传的 swf 的路径（暂未实现）。
 * @param {string=} removeFun 取消上传某个文件后执行的方法名，此方法传入一个参数 f, f 为被取消的文件的信息对象。
 *
 */
    .directive('wiFileupload',['$position', 'fileuploadSev', 'fileuploadConf', '$timeout', '$parse', '$document', 'wiDialog', function ($position, fileuploadSev, fileuploadConf, $timeout, $parse, $document, wiDialog) {
        return {
            restrict:'E',
            templateUrl: 'template/fileupload/wi-fileupload.html',// 模态时调用 dialog 处需将模板以字符串形式传入
            scope: {},
            replace: true,
            link: function (scope,elem,attrs) {
                // 自定义配置
                var options = scope.fileULOptions = {
                    url: attrs['wiUrl'] || ''
                    ,multi_selection: attrs.hasOwnProperty('wiMultisel') && attrs['wiMultisel'] != 'false'// 是否允许多选，默认不支持
                    ,browse_button: document.getElementById(attrs['wiTrigger'])// 触发选择文件弹窗的按钮
                    ,modal: !!attrs.hasOwnProperty('wiModal')// 是否模态显示上传状态，默认非模态
                };
                scope.files = [];// 要上传的文件对应的信息 - 通过 id 与 要上传的 file 关联
//                options.url = "http://192.10.110.174:8804/NewFrame/CommonServlet?bean=FileManagerPO&path=D:\\wisoft\\&sid=408aee4e3bacd24f013bb0ec0e650030&isUploadMore=true&uploadMaxSize=8000000"; // 服务器测试
                if(!options.browse_button || !options.url) return;// 未定义触发按钮

                /* 上传文件的后缀名限制 */
                var extensions;
                // 若定义了 wi-mime-types，将其格式化为 json 对象
                attrs['wiMimeTypes'] && (options.mime_types = (new Function("return " + attrs['wiMimeTypes']))());
                // 分析获得的 json 对象，将所有 后缀名存入 extensions 数组
                options.mime_types && (extensions = []) && angular.forEach(options.mime_types, function(o){
                    extensions = extensions.concat(o.extensions.split(','));
                });

                // 每个上传文件的最大值
                attrs['wiMaxSize'] && (options.max_file_size = fileuploadSev.parseSize(attrs['wiMaxSize']));
                // ie9 下打开的 swf 路径
                attrs['wiSwf'] && (options.flash_swf_url = attrs['wiSwf']);

                // 移除上传文件时用户自定义的操作 - 在父 scope 中
                scope.removeFun = attrs['removefun'] && scope.$parent ? $parse(attrs['removefun'])(scope.$parent): angular.noop;

                var uploadFiles = []// 上传队列中的文件
                    ,modalDialogId// 关闭模态对话框的方法，打开 dialog 时获取
                    ,lengthWatch;// 显示模态对话框时，用于取消对上传 队列长度监听的方法

                // 根据用户定义的属性，拼接 input[type='file'] 元素
                var triggerPos = $position.position(angular.element(options.browse_button))
                    ,elemStr = {
                        pos: 'top:' + triggerPos.top + 'px; left:' + triggerPos.left + 'px; width:' + triggerPos.width + 'px; height:' + triggerPos.height + 'px;'
                        ,multiple: options.multi_selection ? ' multiple' : ''
                        ,accept: fileuploadSev.formatMimetype(options.mime_types)
                    }
                    ,triggerbtn = angular.element('<input type="file" class="wi-fileupload-btn"' + elemStr.multiple + elemStr.accept + ' />')
                    ,triggerDiv = angular.element('<div class="wi-fileupload-btndiv" style="' + elemStr.pos + '"></div>');
                // 获取选中的文件
                triggerbtn.on('change',function g(){
                    if(!xhr) return;
                    this.files && angular.forEach(this.files, function(file){
                        addFile(file);// 根据用户设置的限制筛选文件，将符合要求的文件添加到上传队列，并与 scope.files 中的对象关联
                    });
                    try{// 清空控件中的值 - 确保下次选择文件后肯定触发 change
                        this.files = [];
                        this.value = '';
                    }catch(e){// 兼容处理，部分浏览器不支持 对 this.files 及 this.value 赋值
                        var n = triggerbtn.clone(true);
                        n.on('change', g);
                        triggerbtn.replaceWith(n);
                        triggerbtn = n;
                    }
                    scope.$digest();
                    // 模态处理 - 调用 wi-dialog 在模态窗口中显示上传状态
                    if(options.modal && scope.files.length > 0){
                        modalDialogId = wiDialog.open({
                            template:
                                '<ul class="wi-fileupload" ng-if="files.length>0">\
                                    <li ng-repeat="file in files track by file.id">\
                                        <span class="wi-fileupload-info" ng-style="{cursor: file.stat==3 ? \'pointer\': \'\'}" ng-click="getResponse(file)">\
                                            <span class="wi-fileupload-icon icon-{{file.type}}"></span>\
                        {{file.name}}\
                                            <span class="wi-fileupload-tip">({{file.size}})</span>\
                                        </span>\
                                        <span class="wi-fileupload-completed" ng-style="{display: file.stat==3 ? \'\' : \'none\'}">完成</span>\
                                        <span class="wi-fileupload-queued" ng-style="{display: file.stat==1 ? \'\' : \'none\'}">等待上传</span>\
                                        <wi-progress ng-style="{display: file.stat==2 ? \'\' : \'none\'}" label="file.progressLabel" value="file.percent"></wi-progress>\
                                        <span class="wi-fileupload-error" ng-style="{display: file.stat==4 ? \'\' : \'none\'}">上传失败</span>\
                                        <span class="wi-fileupload-del" ng-click="removeFile(file)">删除</span>\
                                    </li>\
                                </ul>',
                            plain: true,
                            title: '上传进度',
                            scope: scope,
                            width: 380
                        }).id;
                        if(!lengthWatch){
                            lengthWatch = scope.$watch('files.length',function(val){
                                if(val <= 0 && modalDialogId){
                                    wiDialog.closeOne(modalDialogId);
                                    lengthWatch();// 取消监听
                                    modalDialogId = undefined;
                                    lengthWatch = undefined;
                                }
                            });
                        }
                    }
                    queueCtrl();// 上传队列处理
                });
                triggerDiv.append(triggerbtn);
                options.browse_button.parentNode.appendChild(triggerDiv[0]);

                scope.$on('$destroy', function() {
                    if(xhr){// 销毁
                        (xhr.readyState != XMLHttpRequest.UNSENT) && xhr.abort();
                        xhr = null;
                    }
                    triggerbtn.remove();// 移除
                    triggerDiv.remove();
                    triggerbtn = null;// 销毁
                    triggerDiv = null;
                });
                /* --------- 上传配置 --------- */
                var xhr,
                    scopef,// 正在传输的文件对应在 scope 中的对象
                    uploadStat = fileuploadConf.STOPPED,
                    formdata;
                window.XMLHttpRequest && (xhr = new XMLHttpRequest());
                if(xhr){
                    // 传输状态改变
//                    xhr.addEventListener('readystatechange',function(){
//                        console.log('==readystatechange');
//                    });
                    // 传输结束(status > 399 失败) 4
                    xhr.addEventListener('loadend',function(){
                        if(xhr.status > 399){// 出错
                            scopef.stat = fileuploadConf.failed;
                        }else if(scopef.stat == fileuploadConf.uploading){
                            scopef.stat = fileuploadConf.completed;
                            scopef.responseText = xhr.responseText;
                        }
                        scope.$digest();
                        scopef = null;
                        queueCtrl();
                    });
                    //传输开始 1
//                    xhr.addEventListener('loadstart',function(e){
//                        console.log('==loadstart' + '    ' + xhr.readyState);
//                    });
                    // 进度改变 1
                    xhr.upload && xhr.upload.addEventListener('progress',function(evt){
                        if(!evt.lengthComputable) return;
                        scopef.percent = parseInt( evt.loaded / evt.total * 100);
                        scopef.progressLabel = scopef.percent + '%';
                        scope.$digest();
                    }, false);
                    // 传输出错
                    xhr.addEventListener('error',function(){
                        scopef && (scopef.stat = fileuploadConf.failed) && (scope.$digest());
                    });
                    // 传输取消
//                    xhr.addEventListener("abort", function(){
//                        console.log('==abort' + '    ' + xhr.readyState);
//                    });
                }

                function queueCtrl(){// 调用前需先判断是否支持 xhr
                    for(var index=0; index<uploadFiles.length; index++ ){
                        scopef = scope.files[index];
                        if(scopef.stat == fileuploadConf.uploading){// 正在上传
                            break;
                        }else if(scopef.stat == fileuploadConf.queued){// 开始上传
                            (uploadStat == fileuploadConf.STOPPED) && (uploadStat = fileuploadConf.STARTED);
                            scopef.stat = fileuploadConf.uploading;
                            scope.$digest();
                            formdata = new FormData();
                            formdata.append('file', uploadFiles[index]);
                            xhr.wiId = scopef.id;
                            xhr.open('post', options.url);
//                                xhr.setRequestHeader("Content-Type","multipart/form-data;");// 设置此项上传失败？？-因为以 formdata 上传的原因？？
                            xhr.send(formdata);
                            break;
                        }
                    }
                    // 全部处理完毕，文件队列上传结束
                    (index == scope.files.length) && (uploadStat = fileuploadConf.STOPPED);
                }

                // 添加文件
                function addFile(file){
                    if(extensions && extensions.indexOf(file.name.slice(file.name.lastIndexOf('.') + 1, file.name.length)) < 0) return;// 后缀名判断
                    if(options.max_file_size && file.size > options.max_file_size) return;// size 判断
                    var f = {
                        id: fileuploadSev.getUid('wif_')
                        ,name: file.name
                        ,type: fileuploadSev.getType(file.type)
                        ,size: fileuploadSev.formatSize(file.size)
                        ,percent: 0
                        ,progressLabel: '0%'
                        ,stat: fileuploadConf.queued // 等待上传
                    };
                    file.wiId = f.id;
                    scope.files.push(f);
                    uploadFiles.push(file);// 将文件添加到上传队列
                }
                // 删除文件
                scope.removeFile = function(f){
                    var id = f.id;
                    if(xhr.wiId == id){// 要删除的文件正在传输，取消当前正在传输的项目
                        xhr.abort();
                    }
                    scope.files.splice(scope.files.indexOf(f), 1);
                    for(var i=0; i< uploadFiles.length; i++){
                        (uploadFiles[i].wiId == f.id) && uploadFiles.splice(i, 1);
                    }
                    scope.removeFun(f);// 用户自定义的事件
                };
                // 获取返回数据
                if(attrs.hasOwnProperty('wiResponse')){
                    var responseName = attrs['wiResponse'],
                        parent = scope.$parent;
                    if(parent.hasOwnProperty(responseName)){
                        scope.getResponse = function(f){
                            if(f.stat != fileuploadConf.completed)return;
                            parent[responseName] = f.responseText;
                        }
                    }
                }
            }
        };
    }]);