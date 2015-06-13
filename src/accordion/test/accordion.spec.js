describe('wi-accordion', function () {
    var $scope;

    beforeEach(module('ui.wisoft.accordion'));
    beforeEach(module('template/accordion/wi-accordion.html'));
    beforeEach(module('template/accordion/wi-accordion-group.html'));

    beforeEach(inject(function ($rootScope) {
        $scope = $rootScope;
    }));

    describe('controller', function () {

        var ctrl, $element, $attrs;
        beforeEach(inject(function ($controller) {
            $attrs = {};
            $element = [];
            $element[0]={};
//            $element[0].parentElement={};
            ctrl = $controller('AccordionController', { $scope: $scope, $element: $element, $attrs: $attrs });
        }));

        describe('addGroup', function () {
            it('adds a the specified panel to the collection', function () {
                var group1, group2;
                ctrl.addGroup(group1 = $scope.$new());
                ctrl.addGroup(group2 = $scope.$new());
                expect(ctrl.groups.length).toBe(2);
                expect(ctrl.groups[0]).toBe(group1);
                expect(ctrl.groups[1]).toBe(group2);
            });
            it('初始设置全部为关闭时默认打开第一个accordionGroup', function () {
                var group1, group2, group3;
                group1 = $scope.$new();
                group2 = $scope.$new()
                group3 = $scope.$new()
                group1.isOpen = false;
                group2.isOpen = false;
                group3.isOpen = false;
                ctrl.addGroup(group1);
                ctrl.addGroup(group2);
                ctrl.addGroup(group3);
                expect(ctrl.groups.length).toBe(3);
                expect(ctrl.groups[0].isOpen).toBe(true);
                expect(ctrl.groups[1].isOpen).toBe(false);
                expect(ctrl.groups[2].isOpen).toBe(false);
            });
            it('初始只设置1个accordionGroup打开时该设置生效', function () {
                var group1, group2, group3;
                group1 = $scope.$new();
                group2 = $scope.$new()
                group3 = $scope.$new()
                group1.isOpen = false;
                group2.isOpen = true;
                group3.isOpen = false;
                ctrl.addGroup(group1);
                ctrl.addGroup(group2);
                ctrl.addGroup(group3);
                expect(ctrl.groups.length).toBe(3);
                expect(ctrl.groups[0].isOpen).toBe(false);
                expect(ctrl.groups[1].isOpen).toBe(true);
                expect(ctrl.groups[2].isOpen).toBe(false);
            });
            it('初始设置为打开多个accordionGroup时最后一个设为打开的设置生效', function () {
                var group1, group2, group3;
                group1 = $scope.$new();
                group2 = $scope.$new()
                group3 = $scope.$new()
                group1.isOpen = false;
                group2.isOpen = true;
                group3.isOpen = true;
                ctrl.addGroup(group1);
                ctrl.addGroup(group2);
                ctrl.addGroup(group3);
                expect(ctrl.groups.length).toBe(3);
                expect(ctrl.groups[0].isOpen).toBe(false);
                expect(ctrl.groups[1].isOpen).toBe(false);
                expect(ctrl.groups[2].isOpen).toBe(true);
            });
        });

        describe('closeOthers', function () {
            var group1, group2, group3;
            beforeEach(function () {
                ctrl.addGroup(group1 = { isOpen: true, $on: angular.noop });
                ctrl.addGroup(group2 = { isOpen: true, $on: angular.noop });
                ctrl.addGroup(group3 = { isOpen: true, $on: angular.noop });
            });
            it('should close other panels', function () {
//        delete $attrs.closeOthers;
                //addGroup后全是open，则最后第一个生效
                expect(group1.isOpen).toBe(false);
                expect(group2.isOpen).toBe(false);
                expect(group3.isOpen).toBe(true);
                group2.isOpen = true;
                ctrl.closeOthers(group2);
                expect(group1.isOpen).toBe(false);
                expect(group2.isOpen).toBe(true);
                expect(group3.isOpen).toBe(false);

            });

        });

        describe('removeGroup', function () {
            it('should remove the specified panel', function () {
                var group1, group2, group3;
                ctrl.addGroup(group1 = $scope.$new());
                ctrl.addGroup(group2 = $scope.$new());
                ctrl.addGroup(group3 = $scope.$new());
                ctrl.removeGroup(group2);
                expect(ctrl.groups.length).toBe(2);
                expect(ctrl.groups[0]).toBe(group1);
                expect(ctrl.groups[1]).toBe(group3);
            });
            it('should ignore remove of non-existing panel', function () {
                var group1, group2;
                ctrl.addGroup(group1 = $scope.$new());
                ctrl.addGroup(group2 = $scope.$new());
                expect(ctrl.groups.length).toBe(2);
                ctrl.removeGroup({});
                expect(ctrl.groups.length).toBe(2);
            });
        });
    });

    describe('wi-accordion', function () {

        var scope, $compile,$document;
        var element, groups,accordionConfig;
        var findGroupHead = function (index) {
            return groups.eq(index).find('.wi-accordion-head');
        }
        var findGroupBody = function (index) {
            return groups.eq(index).find('.wi-accordion-panel');
        };
        var findAccordion=function(){
            return element.find('.wi-accordion');
        }
        //面板内容部分
        var findGroupBodyContent=function(index){
            return groups.eq(index).find('.wi-accordion-cont');
        }

        beforeEach(inject(function (_$rootScope_, _$compile_,_$document_) {
            scope = _$rootScope_;
            $compile = _$compile_;
            $document = _$document_;
            accordionConfig={'headHeight':41};
        }));

        afterEach(function () {
            element = groups = scope = $compile = undefined;
        });

        describe('静态panel---', function () {
            beforeEach(function () {
                var tpl =
                    '<wi-accordion >' +
                    '<wi-accordion-group heading="title 1">Content 1</wi-accordion-group>' +
                    '<wi-accordion-group heading="title 2">Content 2</wi-accordion-group>' +
                    '</wi-accordion>';
                element = angular.element(tpl);
//                $compile(element)(scope);
//                scope.$digest();
//                groups = element.find('.wi-accordion-group');
            });
            afterEach(function () {
                element.remove();
            });

            it('设置数值height后每个panel的高度应保持一致', function () {
                element.attr('height',400);
                $compile(element)(scope);
                scope.$digest();
                groups = element.find('.wi-accordion-group');
                var expectHeight=400-accordionConfig.headHeight*2-2;//316px
                expect(findGroupBodyContent(0).scope().panelStyle.height).toEqual(expectHeight);
                expect(findGroupBodyContent(1).scope().panelStyle.height).toEqual(expectHeight);
            });

            it('设置数值百分比height后每个panel的高度应保持一致', function () {
                var tpl =
                    '<div style="height: 400px"><wi-accordion height="50%" >' +
                    '<wi-accordion-group heading="title 1">Content 1</wi-accordion-group>' +
                    '<wi-accordion-group heading="title 2">Content 2</wi-accordion-group>' +
                    '</wi-accordion></div>';
                element = angular.element(tpl);
                angular.element($document[0].body).append(element[0]);//加上这句clientHeight才能取得到
                $compile(element)(scope);
                scope.$digest();
                groups = element.find('.wi-accordion-group');
                var expectHeight=400*0.5-accordionConfig.headHeight*2-2;//116px
                expect(findGroupBodyContent(0).scope().panelStyle.height).toEqual(expectHeight);
                expect(findGroupBodyContent(1).scope().panelStyle.height).toEqual(expectHeight);
            });

            it('设置百分比width后每个panel的宽度应保持一致', function () {
                var tpl =
                    '<div style="width: 400px"><wi-accordion width="50%" >' +
                    '<wi-accordion-group heading="title 1">Content 1</wi-accordion-group>' +
                    '<wi-accordion-group heading="title 2">Content 2</wi-accordion-group>' +
                    '</wi-accordion></div>';
                element = angular.element(tpl);
                angular.element($document[0].body).append(element[0]);//加上这句clientHeight才能取得到
                $compile(element)(scope);
                scope.$digest();
                groups = element.find('.wi-accordion-group');
                var accordion=element.find('.wi-accordion');
                var expectWidth=400*0.5;
                expect(accordion[0].clientWidth).toEqual(200);//accordion的宽度应该为400×0.5=200
                expect(findGroupBodyContent(0)[0].clientWidth).toEqual(200);
                expect(findGroupBodyContent(1)[0].clientWidth).toEqual(200);
            });
            it('设置数值width后每个panel的宽度应保持一致', function () {
                var tpl =
                    '<div style="width: 400px"><wi-accordion width="180" >' +
                    '<wi-accordion-group heading="title 1">Content 1</wi-accordion-group>' +
                    '<wi-accordion-group heading="title 2">Content 2</wi-accordion-group>' +
                    '</wi-accordion></div>';
                element = angular.element(tpl);
                angular.element($document[0].body).append(element[0]);//加上这句clientHeight才能取得到
                $compile(element)(scope);
                scope.$digest();
                groups = element.find('.wi-accordion-group');
                var accordion=element.find('.wi-accordion');
                expect(accordion[0].clientWidth).toEqual(180);//accordion的宽度应该为400×0.5=200
                expect(findGroupBodyContent(0)[0].clientWidth).toEqual(180);
                expect(findGroupBodyContent(1)[0].clientWidth).toEqual(180);
            });
        });

        describe('动态panel---', function () {
            var model = [
                {name: 'title 1', content: 'Content 1'},
                {name: 'title 2', content: 'Content 2'}
            ];
            afterEach(function () {
                element.remove();
            });

            it('设置数值height后每个panel的高度应保持一致', function () {
                var tpl =
                    '<wi-accordion height="400">' +
                    '<wi-accordion-group heading="group.name" ng-repeat="group in acGroups">{{group.content}}</wi-accordion-group>' +
                    '</wi-accordion>';
                element = angular.element(tpl);
                scope.acGroups=model;
                $compile(element)(scope);
                scope.$digest();
                groups = element.find('.wi-accordion-group');
                var expectHeight=400-accordionConfig.headHeight*2-2;//316px
                expect(findGroupBodyContent(0).scope().panelStyle.height).toEqual(expectHeight);
                expect(findGroupBodyContent(1).scope().panelStyle.height).toEqual(expectHeight);
            });

            it('设置数值百分比height后每个panel的高度应保持一致', function () {
                var tpl =
                    '<div style="height: 400px"><wi-accordion height="50%" >' +
                    '<wi-accordion-group heading="group.name" ng-repeat="group in acGroups">{{group.content}}</wi-accordion-group>' +
                    '</wi-accordion></div>';
                element = angular.element(tpl);
                scope.acGroups=model;
                angular.element($document[0].body).append(element[0]);//加上这句clientHeight才能取得到
                $compile(element)(scope);
                scope.$digest();
                groups = element.find('.wi-accordion-group');
                var expectHeight=400*0.5-accordionConfig.headHeight*2-2;//116px
                expect(findGroupBodyContent(0).scope().panelStyle.height).toEqual(expectHeight);
                expect(findGroupBodyContent(1).scope().panelStyle.height).toEqual(expectHeight);
            });

            it('设置百分比width后每个panel的宽度应保持一致', function () {
                var tpl =
                    '<div style="width: 400px"><wi-accordion width="50%" >' +
                    '<wi-accordion-group heading="group.name" ng-repeat="group in acGroups">{{group.content}}</wi-accordion-group>' +
                    '</wi-accordion></div>';
                element = angular.element(tpl);
                scope.acGroups=model;
                angular.element($document[0].body).append(element[0]);
                $compile(element)(scope);
                scope.$digest();
                groups = element.find('.wi-accordion-group');
                var accordion=element.find('.wi-accordion');
                var expectWidth=400*0.5;
                expect(accordion[0].clientWidth).toEqual(200);//accordion的宽度应该为400×0.5=200
                expect(findGroupBodyContent(0)[0].clientWidth).toEqual(200);
                expect(findGroupBodyContent(1)[0].clientWidth).toEqual(200);
            });
            it('设置数值width后每个panel的宽度应保持一致', function () {
                var tpl =
                    '<div style="width: 400px"><wi-accordion width="180" >' +
                    '<wi-accordion-group heading="group.name" ng-repeat="group in acGroups">{{group.content}}</wi-accordion-group>' +
                    '</wi-accordion></div>';
                element = angular.element(tpl);
                scope.acGroups=model;
                angular.element($document[0].body).append(element[0]);
                $compile(element)(scope);
                scope.$digest();
                groups = element.find('.wi-accordion-group');
                var accordion=element.find('.wi-accordion');
                expect(accordion[0].clientWidth).toEqual(180);//accordion的宽度应该为400×0.5=200
                expect(findGroupBodyContent(0)[0].clientWidth).toEqual(180);
                expect(findGroupBodyContent(1)[0].clientWidth).toEqual(180);
            });
        });
    });

    describe('wi-accordion-group', function () {

        var scope, $compile;
        var element, groups;
//    var findGroupLink = function (index) {
//      return groups.eq(index).find('a').eq(0);
//    };
        var findGroupHead = function (index) {
            return groups.eq(index).find('.wi-accordion-head');
        }
        var findGroupBody = function (index) {
            return groups.eq(index).find('.wi-accordion-panel');
        };


        beforeEach(inject(function (_$rootScope_, _$compile_) {
            scope = _$rootScope_;
            $compile = _$compile_;
        }));

        afterEach(function () {
            element = groups = scope = $compile = undefined;
        });

        describe('with static panels', function () {
            beforeEach(function () {
                var tpl =
                    '<wi-accordion>' +
                    '<wi-accordion-group heading="title 1">Content 1</wi-accordion-group>' +
                    '<wi-accordion-group heading="title 2">Content 2</wi-accordion-group>' +
                    '</wi-accordion>';
                element = angular.element(tpl);
                $compile(element)(scope);
                scope.$digest();
                groups = element.find('.wi-accordion-group');
            });
            afterEach(function () {
                element.remove();
            });

            it('should create wi-accordion panels with content', function () {
                expect(groups.length).toEqual(2);
                expect(findGroupHead(0).text()).toEqual('title 1');
                expect(findGroupBody(0).text().trim()).toEqual('Content 1');
                expect(findGroupHead(1).text()).toEqual('title 2');
                expect(findGroupBody(1).text().trim()).toEqual('Content 2');
            });

            it('should change selected element on click', function () {
                findGroupHead(0).click();
                scope.$digest();
                //初始都未设置状态，默认第一个是打开的，点击后变为关闭
                expect(findGroupBody(0).scope().isOpen).toBe(false);

                findGroupHead(1).click();
                scope.$digest();
                expect(findGroupBody(0).scope().isOpen).toBe(false);
                expect(findGroupBody(1).scope().isOpen).toBe(true);
            });

            it('should toggle element on click', function () {
                findGroupHead(0).click();
                scope.$digest();
                expect(findGroupBody(0).scope().isOpen).toBe(false);
                findGroupHead(0).click();
                scope.$digest();
                expect(findGroupBody(0).scope().isOpen).toBe(true);
            });
        });

        describe('with dynamic panels', function () {
            var model;
            beforeEach(function () {
                var tpl =
                    '<wi-accordion>' +
                    '<wi-accordion-group ng-repeat="group in groups" heading="{{group.name}}">{{group.content}}</wi-accordion-group>' +
                    '</wi-accordion>';
                element = angular.element(tpl);
                model = [
                    {name: 'title 1', content: 'Content 1'},
                    {name: 'title 2', content: 'Content 2'}
                ];

                $compile(element)(scope);
                scope.$digest();
            });

            it('全设为关闭或全不设置则第一个accordionGroup被默认打开', function () {
                scope.groups = model;
                scope.$digest();
                groups = element.find('.wi-accordion-group');
                expect(groups.length).toEqual(2);
                //第一个面板是展开的,下面两种写法实际效果一样，都可以验证
                expect(findGroupBody(0).attr('class')).toBe('wi-accordion-panel wi-collapse-in');
                expect(findGroupBody(0).scope().isOpen).toBeTruthy();
            });

            it('should have a panel for each model item', function () {
                scope.groups = model;
                scope.$digest();
                groups = element.find('.wi-accordion-group');
                expect(groups.length).toEqual(2);
                expect(findGroupHead(0).text()).toEqual('title 1');
                expect(findGroupBody(0).text().trim()).toEqual('Content 1');
                expect(findGroupHead(1).text()).toEqual('title 2');
                expect(findGroupBody(1).text().trim()).toEqual('Content 2');
            });

            it('从模型数据中移除数据后,accordion也对应移除accordionGroup', function () {
                scope.groups = model;
                scope.$digest();
                groups = element.find('.wi-accordion-group');
                expect(groups.length).toEqual(2);

                scope.groups.splice(0, 1);
                scope.$digest();
                groups = element.find('.wi-accordion-group');
                expect(groups.length).toEqual(1);
            });
        });

        describe('is-open attribute', function () {
            beforeEach(function () {
                var tpl =
                    '<wi-accordion>' +
                    '<wi-accordion-group heading="title 1" is-open="open.first">Content 1</wi-accordion-group>' +
                    '<wi-accordion-group heading="title 2" is-open="open.second">Content 2</wi-accordion-group>' +
                    '</wi-accordion>';
                element = angular.element(tpl);
                scope.open = { first: false, second: true };
                $compile(element)(scope);
                scope.$digest();
                groups = element.find('.wi-accordion-group');
            });

            it('should open the panel with isOpen set to true', function () {
                expect(findGroupBody(0).scope().isOpen).toBe(false);
                expect(findGroupBody(1).scope().isOpen).toBe(true);
            });

            it('should toggle variable on element click', function () {
                findGroupHead(0).click();
                scope.$digest();
                expect(scope.open.first).toBe(true);

                findGroupHead(0).click();
                scope.$digest();
                expect(scope.open.first).toBe(false);
                expect(scope.open.second).toBe(true);//都关闭时会默认打开最后一个
            });
        });

        describe('is-open attribute with dynamic content', function () {
            beforeEach(function () {
                var tpl =
                    '<wi-accordion>' +
                    '<wi-accordion-group heading="title 1" is-open="open1"><div ng-repeat="item in items">{{item}}</div></wi-accordion-group>' +
                    '<wi-accordion-group heading="title 2" is-open="open2">Static content</wi-accordion-group>' +
                    '</wi-accordion>';
                element = angular.element(tpl);
                scope.items = ['Item 1', 'Item 2', 'Item 3'];
                scope.open1 = true;
                scope.open2 = false;
                angular.element(document.body).append(element);
                $compile(element)(scope);
                scope.$digest();
                groups = element.find('.wi-accordion-group');
            });

            afterEach(function () {
                element.remove();
            });

            it('should have visible panel body when the group with isOpen set to true', function () {
                expect(findGroupBody(0)[0].clientHeight).not.toBe(0);
                expect(findGroupBody(1)[0].clientHeight).toBe(0);
            });
        });

        describe('is-open attribute with dynamic groups', function () {
            var model;
            beforeEach(function () {
                var tpl =
                    '<wi-accordion>' +
                    '<wi-accordion-group ng-repeat="group in groups" heading="{{group.name}}" is-open="group.open">{{group.content}}</wi-accordion-group>' +
                    '</wi-accordion>';
                element = angular.element(tpl);
                model = [
                    {name: 'title 1', content: 'Content 1', open: false},
                    {name: 'title 2', content: 'Content 2', open: true}
                ];
                scope.groups=model;
                $compile(element)(scope);
                scope.$digest();

                groups = element.find('.wi-accordion-group');
            });

            it('should have visible group body when the group with isOpen set to true', function () {
                scope.groups=model;
                scope.$digest();
                groups = element.find('.wi-accordion-group');
                expect(findGroupBody(0).scope().isOpen).toBe(false);
                expect(findGroupBody(1).scope().isOpen).toBe(true);
                expect(findGroupBody(1).attr('class')).toBe('wi-accordion-panel wi-collapse-in');
            });

            it('should toggle element on click', function () {
                findGroupHead(0).click();
//                console.log( findGroupHead(0).scope())
                scope.$digest();
                expect(findGroupHead(0).scope().isOpen).toBe(true);
                expect(findGroupHead(1).scope().isOpen).toBe(false);

                findGroupHead(1).click();
                scope.$digest();
                expect(findGroupBody(0).scope().isOpen).toBe(false);
                expect(findGroupBody(1).scope().isOpen).toBe(true);
                expect(scope.groups[0].open).toBe(false);
                expect(scope.groups[1].open).toBe(true);
            });
        });

        describe('wi-accordion-heading element', function () {
            beforeEach(function () {
                var tpl =
                    '<wi-accordion ng-init="a = [1,2,3]">' +
                    '<wi-accordion-group heading="I get overridden">' +
                    '<wi-accordion-heading>Heading Element <span ng-repeat="x in a">{{x}}</span> </wi-accordion-heading>' +
                    'Body' +
                    '</wi-accordion-group>' +
                    '</wi-accordion>';
                element = $compile(tpl)(scope);
                scope.$digest();
                groups = element.find('.wi-accordion-group');
            });
            it('transcludes the <wi-accordion-heading> content into the heading link', function () {
                expect(findGroupHead(0).text()).toBe('Heading Element 123 ');
            });
            it('attaches the same scope to the transcluded heading and body', function () {
                expect(findGroupHead(0).find('span').scope().$id).toBe(findGroupBody(0).find('span').scope().$id);
            });

        });

        describe('wi-accordion-heading attribute', function () {
            beforeEach(function () {
                var tpl =
                    '<wi-accordion ng-init="a = [1,2,3]">' +
                    '<wi-accordion-group heading="I get overridden">' +
                    '<div wi-accordion-heading>Heading Element <span ng-repeat="x in a">{{x}}</span> </div>' +
                    'Body' +
                    '</wi-accordion-group>' +
                    '</wi-accordion>';
                element = $compile(tpl)(scope);
                scope.$digest();
                groups = element.find('.wi-accordion-group');
            });
            it('transcludes the <wi-accordion-heading> content into the heading link', function () {
                expect(findGroupHead(0).text()).toBe('Heading Element 123 ');
            });
            it('attaches the same scope to the transcluded heading and body', function () {
                expect(findGroupHead(0).find('span').scope().$id).toBe(findGroupBody(0).find('span').scope().$id);
            });

        });

        describe('wi-accordion-heading, with repeating wi-accordion-groups', function () {
            it('should clone the wi-accordion-heading for each group', function () {
                element = $compile('<wi-accordion><wi-accordion-group ng-repeat="x in [1,2,3]"><wi-accordion-heading>{{x}}</wi-accordion-heading></wi-accordion-group></wi-accordion>')(scope);
                scope.$digest();
                groups = element.find('.wi-accordion-group');
                expect(groups.length).toBe(3);
                expect(findGroupHead(0).text()).toBe('1');
                expect(findGroupHead(1).text()).toBe('2');
                expect(findGroupHead(2).text()).toBe('3');
            });
        });

        describe('wi-accordion-heading attribute, with repeating wi-accordion-groups', function () {
            it('should clone the wi-accordion-heading for each group', function () {
                element = $compile('<wi-accordion><wi-accordion-group ng-repeat="x in [1,2,3]"><div wi-accordion-heading>{{x}}</div></wi-accordion-group></wi-accordion>')(scope);
                scope.$digest();
                groups = element.find('.wi-accordion-group');
                expect(groups.length).toBe(3);
                expect(findGroupHead(0).text()).toBe('1');
                expect(findGroupHead(1).text()).toBe('2');
                expect(findGroupHead(2).text()).toBe('3');
            });
        });

    });
});
