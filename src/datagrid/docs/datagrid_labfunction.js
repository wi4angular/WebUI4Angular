var DataGridDemoLabFunCtrl=['$scope',function ($scope) {

    $scope.dg={};

    function pad(num, n) {
        return (Array(n).join(0) + num).slice(-n);
    }

    var dgData=[];

    for(var i=0;i<50;i++){
        var obj={};
        obj.username='username'+i;
        obj.address='address'+i;
        obj.date='2014-07-'+pad((i+1),2);
        obj.num = (i+1)*100;

        dgData.push(obj);
    }

    $scope.dgData = dgData;

    $scope.usenameLabFun = function (data){
        if(data){
            if(data.username=='username1'){
                    return '<span style="color: red">'+data.username+'</span>';
            }else{
                return '<span style="color: #0000db">'+data.username+'</span>';
            }
        }
        else{
            //清空数据（必须要写为空的判断处理，否则不能清空数据）
            return " ";//空字符串
        }
    }
}]
angular.module('ui.wisoft').controller('DataGridDemoLabFunCtrl',DataGridDemoLabFunCtrl);