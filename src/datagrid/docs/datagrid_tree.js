var DataGridDemoTreeCtrl=['$scope',function($scope) {

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

        var children = obj.children = [];
        if(i!=2) {
            for (var j = 0; j < 3; j++) {
                var child={};
                child.username='#child'+j;
                child.address='#address'+j;
                child.date='2014-07-'+pad((j+1),2);
                child.num = (j+1)*100;
                children.push(child);
                if(i==1 && j==1) {
                    var cr = child.children = [];
                    for (var k = 0; k < 3; k++) {
                        var c={};
                        c.username='##child'+k;
                        c.address='##address'+k;
                        c.date='2014-07-'+pad((k+1),2);
                        c.num = (k+1)*100;
                        cr.push(c);

                        if(k==1 && j==1) {
                            var cr2 = c.children = [];
                            for (var m = 0; m < 3; m++) {
                                var c2={};
                                c2.username='###child'+m;
                                c2.address='###address'+m;
                                c2.date='2014-07-'+pad((m+1),2);
                                c2.num = (m+1)*100;
                                cr2.push(c2);
                            }
                        }
                    }
                }
            }
        }
        dgData.push(obj);
    }

    $scope.dgData = dgData;

    // 节点展开
    $scope.itemOpenHandler = function (data, callback) {
        setTimeout(function () {
            console.log('itemOpenHandler......')
            var children = [];

            for (var j = 0; j < 4; j++) {
                var child={};
                child.sex=j%2;
                child.zw=j%2==0?'危险':'作业';
                child.username='@child'+j;
                child.address='address'+j;
                child.date='2014-07-'+pad((j+1),2);
                child.num = (j+1)*100;
                if(j==0) {
                    child.isbranch='true';
                }
                children.push(child);
            }

            callback(data, children);
        },1000)
    }
}];
angular.module('ui.wisoft').controller('DataGridDemoTreeCtrl',DataGridDemoTreeCtrl);