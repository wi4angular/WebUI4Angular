var CarouselDemoCtrl=['$scope',function($scope) {
  $scope.myInterval = 2000;
  var slides = $scope.slides = [];
  $scope.addSlide = function() {
      var index = 1 + slides.length%5;
      slides.push({
          image: 'misc/tempimg/carousel/carousel' + index + '.jpg',
          text: ['More','Extra','Lots of','Surplus'][slides.length % 4] + ' ' +
              ['Cats', 'Kittys', 'Felines', 'Cutes'][slides.length % 4]
      });
  };
  for (var i=0; i<4; i++) {
    $scope.addSlide();
  }
}];
angular.module('ui.wisoft').controller('CarouselDemoCtrl',CarouselDemoCtrl);
