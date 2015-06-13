var ComboBoxDemoNoEditCtrl=['$scope',function($scope) {

    var vm = $scope;

    vm.mydata = [];

    var seed = new Array('A','B','C','D','E','F','G','H','I','J','K','L','M','N','P','Q','R','S','T','U','V','W','X','Y','Z',
        'a','b','c','d','e','f','g','h','i','j','k','m','n','p','q','r','s','t','u','v','w','x','y','z',
        '1','2','3','4','5','6','7','8','9','0',
        '一','二','三','四','五','六','七','八','九','十'
    );

    function randomWord() {
        var createPassword = '', m,n;
        for(m=0;m<10;m++) {
            n = Math.floor(Math.random()*seed.length);
            createPassword += seed[n];
        }
        return createPassword;
    }

    for(var i=0;i<100;i++) {
        var obj = {};
        obj.id = i;
        obj.name = randomWord();
        vm.mydata.push(obj)
    }

    vm.itemChangeHandler = function (data){
        vm.selected = data;
    }

}];
angular.module('ui.wisoft').controller('ComboBoxDemoNoEditCtrl',ComboBoxDemoNoEditCtrl);