/**
 * @ngdoc overview
 * @name ui.wisoft.carousel
 *
 * @description
 * 图片滑动显示组件
 *
 */
angular.module('ui.wisoft.carousel', ['ui.wisoft.transition'])
    .controller('CarouselController', ['$scope', '$timeout', '$transition', function ($scope, $timeout, $transition) {
        var self = this,
            slides = self.slides = $scope.slides = [],
            currentIndex = -1,
            currentTimeout, //定时任务的promise
            isPlaying;
        self.currentSlide = null;

        var destroyed = false;
        /* direction: "prev" or "next" 即可以向左或向右滑动*/
        self.select = $scope.select = function (nextSlide, direction) {
            var nextIndex = slides.indexOf(nextSlide);
            //Decide direction if it's not given
            if (direction === undefined) {
                direction = nextIndex > currentIndex ? 'next' : 'prev';
            }
            if (nextSlide && nextSlide !== self.currentSlide) {
                if ($scope.$currentTransition) {
                    $scope.$currentTransition.cancel();
                    //Timeout so ng-class in template has time to fix classes for finished slide
                    $timeout(goNext);
                } else {
                    goNext();
                }
            }
            function goNext() {
                // Scope has been destroyed, stop here.
                if (destroyed) {
                    return;
                }
                //If we have a slide to transition from and we have a transition type and we're allowed, go
                if (self.currentSlide && angular.isString(direction) && !$scope.noTransition && nextSlide.$element) {
                    //We shouldn't do class manip in here, but it's the same weird thing wisoft does. need to fix sometime
                    nextSlide.$element.addClass('wi-slide-' + direction);
                    //强制回流(重新布局)，调用offsetWidth会处罚浏览器进行重新布局
                    var reflow = nextSlide.$element[0].offsetWidth;

                    //重新将所有的slide的各相关属性为false
                    angular.forEach(slides, function (slide) {
                        angular.extend(slide, {direction: '', entering: false, leaving: false, active: false});
                    });
                    angular.extend(nextSlide, {direction: direction, active: true, entering: true});//将下一个sclide状态设置为entering（进入）
                    angular.extend(self.currentSlide || {}, {direction: direction, leaving: true});//将当前的slide状态设置为leaving（离开）

                    $scope.$currentTransition = $transition(nextSlide.$element, {});
                    //We have to create new pointers inside a closure since next & current will change
                    (function (next, current) {
                        $scope.$currentTransition.then(
                            function () {
                                transitionDone(next, current);
                            },
                            function () {
                                transitionDone(next, current);
                            }
                        );
                    }(nextSlide, self.currentSlide));
                } else {
                    transitionDone(nextSlide, self.currentSlide);
                }
                self.currentSlide = nextSlide;
                currentIndex = nextIndex;
                //每次切换slide都重新启动定时器
                restartTimer();
            }

            //将通过设置class来实现同时只显示一张图片，一开始slide区域 display:none,参见css中.carousel-inner > .item
            function transitionDone(next, current) {
                angular.extend(next, {direction: '', active: true, leaving: false, entering: false});
                angular.extend(current || {}, {direction: '', active: false, leaving: false, entering: false});
                $scope.$currentTransition = null;
            }
        };
        $scope.$on('$destroy', function () {
            destroyed = true;
        });

        /* Allow outside people to call indexOf on slides array */
        self.indexOfSlide = function (slide) {
            return slides.indexOf(slide);
        };

        //向右滑动
        $scope.next = function () {
            var newIndex = (currentIndex + 1) % slides.length;

            //如果当前有transition尚未执行结束，则禁止触发新的transtion
            if (!$scope.$currentTransition) {
                return self.select(slides[newIndex], 'next');
            }
        };

        //向左滑动
        $scope.prev = function () {
            var newIndex = currentIndex - 1 < 0 ? slides.length - 1 : currentIndex - 1;

            //如果当前有transition尚未执行结束，则禁止触发新的transtion
            if (!$scope.$currentTransition) {
                return self.select(slides[newIndex], 'prev');
            }
        };

        $scope.isActive = function (slide) {
            return self.currentSlide === slide;
        };

        $scope.$watch('interval', restartTimer);
        $scope.$on('$destroy', resetTimer);

        function restartTimer() {
            //取消当前的任务
            resetTimer();
            var interval = +$scope.interval;
            if (!isNaN(interval) && interval >= 0) {
                currentTimeout = $timeout(timerFn, interval);
            }
        }

        //如果当前有定时任务则取消当前的任务
        function resetTimer() {
            if (currentTimeout) {
                $timeout.cancel(currentTimeout);
                currentTimeout = null;
            }
        }

        function timerFn() {
            if (isPlaying) {
                $scope.next();
                restartTimer();
            } else {
                $scope.pause();
            }
        }

        //鼠标leave的时候就开始滑动展示图片
        $scope.play = function () {
            if (!isPlaying) {
                isPlaying = true;
                restartTimer();
            }
        };

        //mouseenter时暂停滑动
        $scope.pause = function () {
            //如果允许暂停滑动
            if (!$scope.noPause) {
                isPlaying = false;
                resetTimer();
            }
        };

        //添加一个滑块
        self.addSlide = function (slide, element) {
            slide.$element = element;
            slides.push(slide);
            //if this is the first slide or the slide is set to active, select it
            if (slides.length === 1 || slide.active) {
                self.select(slides[slides.length - 1]);
                if (slides.length == 1) {
                    $scope.play();
                }
            } else {
                slide.active = false;
            }
        };

        self.removeSlide = function (slide) {
            //get the index of the slide inside the carousel
            var index = slides.indexOf(slide);
            slides.splice(index, 1);
            if (slides.length > 0 && slide.active) {
                if (index >= slides.length) {
                    self.select(slides[index - 1]);
                } else {
                    self.select(slides[index]);
                }
            } else if (currentIndex > index) {
                currentIndex--;
            }
        };

    }])

    /**
     * @ngdoc directive
     * @name ui.wisoft.carousel.directive:wiCarousel
     * @restrict EA
     *
     * @description
     * wiCarousel 是图片滑动显示的组件
     *
     * @param {number=} interval 时间间隔, 毫秒为单位, 设置两个图片滑动切换的时间间隔。.
     * @param {boolean=} noTransition 是否禁止图片切换时的动画过度效果。
     * @param {boolean=} noPause 是否禁止暂停滑动 (默认情况下，鼠标移动到图片上时就会暂停滑动图片).
     *
     *
     */
    .directive('wiCarousel', [function () {
        return {
            restrict: 'EA',
            transclude: true,
            replace: true,
            controller: 'CarouselController',
            require: 'wiCarousel',//????为什么自己require自己
            templateUrl: 'template/carousel/carousel.html',
            scope: {
                interval: '=',
                noTransition: '=',
                noPause: '='
            }
        };
    }])

    /**
     * @ngdoc directive
     * @name ui.wisoft.carousel.directive:wiSlide
     * @restrict EA
     *
     * @description
     * 创建一个slide，只能作为 wiCarousel 的子指令使用，另见：{@link ui.wisoft.carousel.directive:wiCarousel wiCarousel}.
     *
     * @param {boolean=} active 模型绑定, 设定 slide 当前是否为激活状态.
     *
     *
    */
    .directive('wiSlide', function () {
        return {
            require: '^wiCarousel',
            restrict: 'EA',
            transclude: true,
            replace: true,
            templateUrl: 'template/carousel/slide.html',
            scope: {
                active: '=?'
            },
            link: function (scope, element, attrs, carouselCtrl) {
                carouselCtrl.addSlide(scope, element);
                //destroy时将slide从slides数组中移除
                scope.$on('$destroy', function () {
                    carouselCtrl.removeSlide(scope);
                });

                scope.$watch('active', function (active) {
                    if (active) {
                        carouselCtrl.select(scope);
                    }
                });
            }
        };
    });
