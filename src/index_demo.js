var mainCtrl=['$scope', '$http', '$timeout', '$q',function ($scope, $http, $timeout, $q) {
    $scope.themes=[{name:'default'},{name:'blue'}];
    $scope.selectedTheme={name:'default'};
    //样式切换
    $scope.themeChangeHandler=function(data){
        document.getElementById('themeLink').href='themes/'+data.name+'/wi-all.css';
    }
    $scope.actives = {active1:true,active2:false};
    $http.get('demo/alldemo.json').success(function (data) {
        var demos = [];
        for (var key in data) {
            if(data[key].cname==="accordion"){
                data[key].isOpen=true;
            }else{
                data[key].isOpen=false;
            }
            demos.push(data[key]);
        }
        $scope.demosInfo = demos;
    });

    $scope.changeDemo = function (demo) {
        $scope.actives.active2 = true;
        $('.prettyprinted').removeClass('prettyprinted');
        if(demo.html){
            $scope.demoSrc = "demo/" + demo.html;
            $http.get($scope.demoSrc)
                .success(function (data) {
                    document.getElementById("htmlCode").innerText = data;
                    if(demo.js){
                        $http.get("demo/" + demo.js).success(function (data1) {
                            document.getElementById("jsCode").innerText = data1;
                            $timeout(function () {
                                prettyPrint();//代码样式美化
                            })
                        });
                    }else{
                        document.getElementById("jsCode").innerText = '';
                    }
                });
        }else{
            document.getElementById("htmlCode").innerText = '';
            document.getElementById("jsCode").innerText = '';
        }
    }
}];
angular.module('ui.wisoft').controller('mainCtrl',mainCtrl);