var AccordionDemoCtrl1=['$scope',function ($scope) {
  $scope.items = ['Item 1', 'Item 2', 'Item 3'];
  $scope.addItem = function() {
    var newItemNo = $scope.items.length + 1;
    $scope.items.push('Item ' + newItemNo);
  };
}];
angular.module('ui.wisoft').controller('AccordionDemoCtrl1',AccordionDemoCtrl1);