var PanelDemoToolsCtrl = ['$scope', function($scope) {
    var saveFun=function(e){
        alert('save event...');
        e.stopPropagation();
    };
    $scope.headtools = ['collapse',
        {name:'save',cls:'icon-save',opt:saveFun}
    ];
}];
angular.module('ui.wisoft').controller('PanelDemoToolsCtrl',PanelDemoToolsCtrl);