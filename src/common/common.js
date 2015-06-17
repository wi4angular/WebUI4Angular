'use strict';
/**
 * 解决使用$http.post时,springmvc后台获取不到参数的问题。
 * angularjs的$http.post不同于jquery，需要进行处理以便springmvc后台可以正常获得参数值。
 */
var wiResetHttpProvider = ['$httpProvider', function($httpProvider) {
    // Use x-www-form-urlencoded Content-Type
    $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';

    /**
     * The workhorse; converts an object to x-www-form-urlencoded serialization.
     * @param {Object} obj
     * @return {String}
     */
    var param = function(obj) {
        var query = '', name, value, fullSubName, subName, subValue, innerObj, i;

        for(name in obj) {
            value = obj[name];

            if(value instanceof Array) {
                for(i=0; i<value.length; ++i) {
                    subValue = value[i];
                    fullSubName = name + '[' + i + ']';
                    innerObj = {};
                    innerObj[fullSubName] = subValue;
                    query += param(innerObj) + '&';
                }
            }
            else if(value instanceof Object) {
                for(subName in value) {
                    subValue = value[subName];
                    fullSubName = name + '[' + subName + ']';
                    innerObj = {};
                    innerObj[fullSubName] = subValue;
                    query += param(innerObj) + '&';
                }
            }
            else if(value !== undefined && value !== null)
                query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
        }

        return query.length ? query.substr(0, query.length - 1) : query;
    };

    // Override $http service's default transformRequest
    $httpProvider.defaults.transformRequest = [function(data) {
        return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
    }];
}];

angular.module('ui.wisoft.common', [])
    .config(wiResetHttpProvider)//解决使用$http.post时,springmvc后台获取不到参数的问题。
    .factory('wiCommonSev',[function(){
        return{
            // 尺寸类型的属性处理方法（其他组件中也存在类似方法，依赖于 scope），可接受的值：数字、数字开头、scope 对象（数字、数字开头）
            getSizeFromAttr :function(attr, scope){
                if(!attr) return;
                var size;
                if(/^(?:[1-9]\d*|0)(?:.\d+)?/.test(attr)){// 数字开始
                    size = attr;
                }else if(scope){// 非数字开始，可能是 scope 对象
                    size = scope.$eval(attr);
                }
                Number(size) && (size += 'px');// 是数字则加上单位 px
                return size;
            }
        };
    }]);