angular.module('ui.wisoft.transition', [])

/**
 * @ngdoc service
 * @name ui.wisoft.transition.factory:$transition
 *
 * @description
 * $transition 提供一个接口触发 CSS3 变换（过渡 transition / 动画 animation）并在完成变换时接收通知。
 *
 * @param  {DOMElement} element  要产生动画效果的 DOM 元素
 * @param  {string|object|function} trigger  引起变换的来源：<br />
 *   - string，要加到 element 上的 class。<br />
 *   - object, 要应用到 element 上的 style 哈希表。<br />
 *   - function, 将被调用以使变化发生的函数。
 * @param {object=} options options ={ animation: true } 表示要进行的是动画变换，默认为过渡变换。
 * @return {Promise}  返回变化完成后的期望。
 *
 */
	.factory('$transition', ['$q', '$timeout', '$rootScope', function ($q, $timeout, $rootScope) {

		var $transition = function (element, trigger, options) {
			options = options || {};
			var deferred = $q.defer();// defer 对象
			var endEventName = $transition[options.animation ? 'animationEndEventName' : 'transitionEndEventName'];
			// 变换结束时删除绑定的 endEvent，并 resolve
			var transitionEndHandler = function (event) {
				$rootScope.$apply(function () {
					element.unbind(endEventName, transitionEndHandler);
					deferred.resolve(element);
				});
			};
			// 绑定 endEvent
			if (endEventName) {
				element.bind(endEventName, transitionEndHandler);
			}

			// 绑定 timeout 在变换发生前使浏览器更新 DOM
			$timeout(function () {
				if (angular.isString(trigger)) {
					element.addClass(trigger);
				} else if (angular.isFunction(trigger)) {
					trigger(element);
				} else if (angular.isObject(trigger)) {
					element.css(trigger);
				}
				// 若浏览器不支持变换，立即 resolve
				if (!endEventName) {
					deferred.resolve(element);
				}
			});

			// 自定义 cancel 事件，在执行一个会打断当前变换的新变换时调用它，原变换的 endEvent 将不会执行
			deferred.promise.cancel = function () {
				if (endEventName) {
					element.unbind(endEventName, transitionEndHandler);
				}
				deferred.reject('Transition cancelled');
			};

			return deferred.promise;
		};

		// 获取当前浏览器支持的 css 变换/动画结束时触发的事件名
		// 但使用此方法，包含多个属性变化的动画/变换，handler 将执行多次
		// 方法一：设定变换时记住改变的属性，收到事件后判断所有属性都已结束时才执行 handler
		// 方法二：Timeout，变换结束的时间点自行模拟事件
		var transElement = document.createElement('trans');
		var transitionEndEventNames = {
			'WebkitTransition': 'webkitTransitionEnd',//-webkit-transition 变换结束时，触发的事件
			'MozTransition': 'transitionend',
			'OTransition': 'oTransitionEnd',
			'transition': 'transitionend'
		};
		var animationEndEventNames = {
			'WebkitTransition': 'webkitAnimationEnd',//-webkit-animation 动画结束时，触发的事件
			'MozTransition': 'animationend',
			'OTransition': 'oAnimationEnd',
			'transition': 'animationend'//兼容部分无 anmation 的情况
		};

		function findEndEventName(endEventNames) {
			for (var name in endEventNames) {
				if (transElement.style[name] !== undefined) {
					return endEventNames[name];
				}
			}
		}

		$transition.transitionEndEventName = findEndEventName(transitionEndEventNames);
		$transition.animationEndEventName = findEndEventName(animationEndEventNames);
		return $transition;
	}]);
