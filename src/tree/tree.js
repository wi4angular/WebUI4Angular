'use strict';
angular.module('ui.wisoft.tree',[])

    .factory('treeService', function () {
        var treeService = {};

        /**
         * json格式转树状结构
         * @param	{json}		json数据
         * @param	{String}	id的字符串
         * @param	{String}	父id的字符串
         * @param	{String}	children的字符串
         * @return	{Array}		数组
         */
        treeService.transData = function (data, idStr, pidStr, isbranchStr, chindrenStr){
            var r = [], hash = {}, id = idStr, pid = pidStr, children = chindrenStr, isbranch = isbranchStr, i = 0, j = 0, len = data.length;
            for(; i < len; i++){
                hash[data[i][id]] = data[i];
            }
            for(; j < len; j++){
                var aVal = data[j], hashVP = hash[aVal[pid]];
                if(hashVP){
                    !hashVP[children] && (hashVP[children] = []);
                    hashVP[children].push(aVal);
                    aVal['_parent']=hashVP;
                }else{
                    r.push(aVal);
                }
            }

            // 层级
            (function setLevel(nodes) {
                angular.forEach(nodes, function (node) {
                    node['_level'] = node['_parent'] ? node['_parent']['_level']+1 : 0;
                    node[isbranch] && (node['_close'] = true);
                    node[children] && setLevel(node[children]);
                })
            })(r);

            return [hash,r];
        };

        return treeService;
    })

    .factory('RecursionHelper', ['$compile', function($compile){
        return {
            /**
             * 手动编译element，解决递归循环的问题
             * @param element
             * @param [link] post link 或者 {pre-link, post-link}
             * @returns
             */
            compile: function(element, link){

                // 规范link参数
                if(angular.isFunction(link)){
                    link = { post: link };
                }

                // 通过移除内容来打破递归循环
                var contents = element.contents().remove();
                var compiledContents;// 编译后的内容
                return {
                    pre: (link && link.pre) ? link.pre : null,

                    post: function(scope, element){
                        // 编译内容
                        if(!compiledContents){
                            compiledContents = $compile(contents);
                        }
                        // 重新添加内容
                        compiledContents(scope, function(clone){
                            element.append(clone);
                        });

                        // 如果存在post link，调用之
                        if(link && link.post){
                            link.post.apply(null, arguments);
                        }
                    }
                };
            }
        };
    }])

    .filter('treeNodeFilter', function () {
        return function (hashData, search, labelField, pidFiled, idField) {
            // 分支中只要有一个节点符合条件，则整条分支都返回；兄弟节点中不符合条件的未移除
            var hash = {},result = [];

            if(search) {
                // 根据关键字过滤出节点
                angular.forEach(hashData, function (item) {
                    if(item && -1 != item[labelField].indexOf(search)) {
                        // 找到祖先节点
                        while(item['_parent']) {
                            item = item['_parent']
                        }
                        if(!hash[item[idField]]) {
                            hash[item[idField]] = item;
                            result.push(item);
                        }
                    }
                })
            } else {
                angular.forEach(hashData, function (item) {
                    if(item && !item['_parent']) {
                        result.push(item);
                    }
                })
            }

            return result;
        }
    })

    /**
     * @ngdoc directive
     * @name ui.wisoft.tree.directive:wiTree
     * @restrict E
     *
     * @description
     * 树
     *
     * @param {array=} dataprovider 数据源.
     * @param {string=} idfield id字段，默认'id'.
     * @param {string=} pidfield parentid字段，默认'pid'.
     * @param {string=} labelfield 显示字段，默认'name'.
     * @param {boolean=} multiselect 多选，false|true.
     * @param {string=} itemrenderer 自定义节点渲染.
     * @param {string=} filterby 过滤.
     * @param {string=} orderby 排序字段，默认'id'.
     * @param {string=} isbranch 是否是分支字段，默认'isbranch'.
     * @param {object=} id 供外部操作tree.
     * @param {function=} id.addNode 增加单个节点.见示例“自定义节点操作”.
     * @param {function=} id.deleteNode 删除节点.见示例“自定义节点操作”.
     * @param {function=} id.selectedItem 获取选中节点.
     * @param {function=} itemclick 点击节点.
     * @param {function=} itemopen 节点展开.
     *
     */
    .directive('wiTree',['RecursionHelper',function (RecursionHelper) {
        return {
            restrict:'E',
            transclude:true,
            templateUrl: 'template/tree/treeTemplate.html',
            replace:true,
            scope: {
                // Properties
                dataprovider:'='// 数据源
                ,idfield:'@'// id字段，默认'id'
                ,pidfield:'@'// parentid字段，默认'pid'
                ,labelfield:'@'// 显示字段，默认'name'
                ,multiselect:'@'// 多选，false|true
                ,showroot:'@'// 是否显示根节点，true|false
                ,itemrenderer:'@'// 自定义节点渲染
                ,filterby:'='// 过滤
                ,orderby:'@'// 排序字段，默认'id'
                ,isbranch:'@'// 是否是分支字段，默认'isbranch'
                ,id:'='// 供外部操作tree
                ,labelfunction:'&'

                // Styles
                ,width:'@'
                ,height: '@'

                // Events
                ,itemclick:'&'
                ,itemopen:'&'

                // Private
                ,recursion:'@'
            },
            compile: function(element) {
                return RecursionHelper.compile(element);
            },
            controller: ['$scope','treeService','$filter', function ($scope,treeService,$filter) {

                var vm = $scope.vm = {};

                // 默认值
                vm._idfield = $scope.idfield || 'id';
                vm._pidfield = $scope.pidfield || 'pid';
                vm._labelfield = $scope.labelfield || 'name';
                vm._orderby = $scope.orderby || vm._idfield;
                vm._isbranch = $scope.isbranch || 'isbranch';

                $scope.$watch('dataprovider', function (newValue,oldValue) {
                    if(newValue) {
                        // 是否递归（只有最外层的data需要转换）
                        if(!$scope.recursion) {
                            if($scope.dataprovider) {
                                // 数据源格式转换
                                var _dataprovider = treeService.transData($scope.dataprovider,
                                    vm._idfield,
                                    vm._pidfield,
                                    vm._isbranch,
                                    'children');

                                vm._hashData = _dataprovider[0];
                                vm._data = _dataprovider[1];
                            }

                            // 过滤监听
                            $scope.$watch('filterby', function (newValue,oldValue) {
                                if(newValue != oldValue) {
                                    vm._data = $filter('treeNodeFilter')(vm._hashData,
                                        $scope.filterby,
                                        vm._labelfield,
                                        vm._pidfield,
                                        vm._idfield);
                                }
                            },false);

                            // 给id添加方法供外部调用
                            if($scope.id) {
                                // 增加单个节点
                                $scope.id.addNode = function (node, child) {
                                    if(node && angular.isObject(child)) {
                                        registerNode(node, child);
                                    }
                                };
                                // 删除节点
                                $scope.id.deleteNode = function (node) {
                                    unregisterNode(node);
//                            $scope.$apply();
                                };
                                // 获取选中节点
                                $scope.id.selectedItem = function () {
                                    //TODO
                                    var selectedItem = [];

                                    angular.forEach(vm._hashData, function (item) {
                                        if(item['isChecked']) {
                                            selectedItem.push(item);
                                        }
                                    })

                                    if($scope.multiselect) {
                                        return selectedItem;
                                    } else {
                                        return selectedItem[0];
                                    }
                                }
                            }

                        } else {
                            vm._data = $scope.dataprovider;

                            // 找到最顶层的hashData
                            var hash = vm._hashData;
                            if(!hash) {
                                hash = $scope.$parent.vm._hashData;
                            }
                            vm._hashData = hash;
                        }
                    }
                },false);


                // 节点展开/闭合
                vm._toggleNode = function (node) {
                    node['_close'] = !node['_close'];

                    if(node[vm._isbranch] && !node['children'] && !node['_close'] && $scope.itemopen()) {
                        node['_loading'] = true;
                        $scope.itemopen()(node, addNode);
                    }
                }

                // 延迟加载时，动态添加节点
                var addNode = function (node, children) {
                    node['_loading'] = false;
                    if(angular.isArray(children)) {
                        angular.forEach(children, function (child) {
                            registerNode(node, child);
                        })

                        $scope.$apply();
                    }
                }

                // 注册节点信息
                var registerNode = function (node, child) {

                    !node['children'] && (node['children']=[]);
                    node['children'].push(child);

                    child['_level'] = node['_level']+1;
                    child[vm._isbranch] && (child['_close'] = true);
                    child['_parent'] = node;

                    vm._hashData[child[vm._idfield]] = child;
                }

                // 注销节点信息
                var unregisterNode = function (node) {
                    // 从parent的children中移除node
                    var parent = node['_parent'];
                    if(parent) {
                        var children = parent['children'];
                        children.splice(children.indexOf(node), 1)
                        children.length==0 && (parent['children'] = undefined);
                    }
                    // 从hashData中移除node及其children
                    vm._hashData[node[vm._idfield]] = undefined;

                    (function removeChildren(_node) {
                        angular.forEach(_node['children'], function (child) {
                            vm._hashData[child[vm._idfield]] = undefined;
                            child['children'] && removeChildren(child);
                        })
                    })(node);

                    // 第一层更新数据源
                    if(!parent) {
                        vm._data = $filter('treeNodeFilter')(vm._hashData,
                                                             $scope.filterby,
                                                             vm._labelfield,
                                                             vm._pidfield,
                                                             vm._idfield);
                    }
                }

                // 节点单击事件
                vm._itemClick = function (node) {
                    // 多选
                    if($scope.multiselect == 'true') {
                        node['isChecked'] = !node['isChecked'];
                        node['_semi'] = false;
                        // 级联子节点
                        setChildrenCheck(node);
                        // 设置父节点状态
                        setParentCheck(node);
                    }
                    // 单选
                    else {
                        setAllCheck(vm._hashData,false);
                        node['isChecked'] = true;
                    }

                    $scope.itemclick() && $scope.itemclick()(node);
                }

                // 设置所有节点选中状态
                function setAllCheck(collections, val) {
                    angular.forEach(collections, function (data) {
                        data['isChecked'] = val;
                    })
                }

                // 设置子节点选中状态
                function setChildrenCheck (node) {
                    if(node['children']) {
                        angular.forEach(node['children'], function (child) {
                            child['isChecked'] = node['isChecked'];
                            setChildrenCheck(child);
                        })
                    }
                }

                // 设置父节点选中状态
                function setParentCheck (node) {
                    var parentNode = node['_parent'];
                    if(parentNode) {
                        var counts = getChildrenCheck(parentNode);
                        // 全选
                        if(counts[1] == 0 && counts[0] == parentNode['children'].length) {
                            parentNode['isChecked'] = true;
                            parentNode['_semi'] = false;
                        }
                        // 未选
                        else if(counts[0] == 0 && counts[1] == parentNode['children'].length) {
                            parentNode['isChecked'] = false;
                            parentNode['_semi'] = false;
                        }
                        // 半选
                        else {
                            parentNode['isChecked'] = true;
                            parentNode['_semi'] = true;
                        }

                        setParentCheck(parentNode);
                    }
                }

                // 获取子节点选中状态
                function getChildrenCheck(node) {
                    var counts = [0,0];//['已选','未选']
                    if(node['children']) {
                        angular.forEach(node['children'], function (child) {
                            child['isChecked'] && !child['_semi'] && counts[0]++;
                            !child['isChecked'] && counts[1]++;
                        })
                    }
                    return counts;
                }

                // 节点双击事件
                vm._itemDblClick = function (node) {
                    vm._toggleNode(node);
                }

                // 增加节点

                // 删除节点

            }]
        };
    }])