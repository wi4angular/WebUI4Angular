'use strict';
angular.module('ui.wisoft.my97datepicker',[])

    /**
     * @ngdoc directive
     * @name ui.wisoft.my97datepicker.directive:wiDatepicker
     * @restrict E
     *
     * @description
     * 日期选择
     *
     * @param {boolean=} isshowweek 周显示 false|true.
     * @param {boolean=} readonly 只读 false|true.
     * @param {boolean=} highlineweekday 高亮周末 true|false.
     * @param {boolean=} isshowclear 清空按钮 true|false.
     * @param {boolean=} isshowtoday 今天按钮 true|false.
     * @param {string=} firstdayofweek 星期的第一天 0-6(0:星期日 1:星期一).
     * @param {string=} startdate 默认的起始日期 '1980-05-01';动态参数(如:%y,%M分别表示当前年和月)'%y-%M-01'.
     * @param {boolean=} alwaysusestartdate 无论日期框为何值,始终使用 1980-05-01 做为起始日期.
     * @param {string=} datefmt 自定义格式 'yyyy年MM月dd日 HH时mm分ss秒'.
     * @param {string=} vel 指定一个控件或控件的ID,必须具有value属性(如input),用于存储真实值.2014年9月17日 真实值为2014-09-17.
     * @param {string=} skin 皮肤 'default'|''whyGreen'.
     * @param {string=} mindate 限制日期范围，最小日期 '2006-09-10'(配合dateFmt，可设置年月日时分秒).
     * @param {string=} maxdate 限制日期范围，最大日期 '2008-12-20'.
     * @param {array=} disableddays 禁用周日至周六所对应的日期 [0,6],0至6 分别代表 周日至周六.
     * @param {string=} onpicked 选中事件.
     * @param {string=} oncleared 清空事件.
     * @param {boolean=} qsenabled 是否启用快速选择功能, 注意:如果日期格式里不包含 d(天) 这个元素时,快速选择将一直显示,不受此属性控制.
     * @param {string=} quicksel 快速选择数据,可以传入5个快速选择日期,日期格式同min/maxDate.
     *
     */
    .directive('wiDatepicker', function() {
        return {
            restrict: 'E',
            require: 'ngModel',
            template: '<input class="wi-datepicker"/>',
            replace: true,
            scope: {
                isshowweek: '@'// 周显示 false|true
                ,readonly: '@'// 只读 false|true
                ,highlineweekday: '@'// 高亮周末 true|false
                ,isshowclear: '@'// 清空按钮 true|false
                ,isshowtoday: '@'// 今天按钮 true|false
                ,firstdayofweek: '@'// 星期的第一天 0-6(0:星期日 1:星期一)
                ,startdate: '@'// 默认的起始日期 '1980-05-01';动态参数(如:%y,%M分别表示当前年和月)'%y-%M-01'
                ,alwaysusestartdate: '@'// 无论日期框为何值,始终使用 1980-05-01 做为起始日期
                ,datefmt: '@'// 自定义格式 'yyyy年MM月dd日 HH时mm分ss秒'
                ,vel: '@'// vel 指定一个控件或控件的ID,必须具有value属性(如input),用于存储真实值
                         // 2014年9月17日 真实值为2014-09-17
                ,skin:'@'// 皮肤 'default'|''whyGreen'
                ,mindate: '@'// 限制日期范围，最小日期 '2006-09-10'(配合dateFmt，可设置年月日时分秒)
                ,maxdate: '@'// 限制日期范围，最大日期 '2008-12-20'
                             /* 只能选择今天以前的日期(包括今天)：
                                    maxDate:'%y-%M-%d'
                                只能选择今天以后的日期(不包括今天)：
                                    minDate:'%y-%M-{%d+1}'
                                只能选择本月：
                                    minDate:'%y-%M-01',maxDate:'%y-%M-%ld'
                                只能选择今天7:00:00至明天21:00:00：
                                    dateFmt:'yyyy-M-d H:mm:ss',minDate:'%y-%M-%d 7:00:00',maxDate:'%y-%M-{%d+1} 21:00:00'
                                只能选择 20小时前 至 30小时后：
                                    dateFmt:'yyyy-MM-dd HH:mm',minDate:'%y-%M-%d {%H-20}:%m:%s',maxDate:'%y-%M-%d {%H+30}:%m:%s'
                                前面的日期不能大于后面的日期且两个日期都不能大于 2020-10-01：
                                  <input id="d4311" class="wi-datepicker" type="text" onFocus="WdatePicker({maxDate:'#F{$dp.$D(\'d4312\')||\'2020-10-01\'}'})"/>
                                  <input id="d4312" class="wi-datepicker" type="text" onFocus="WdatePicker({minDate:'#F{$dp.$D(\'d4311\')}',maxDate:'2020-10-01'})"/>
                              */
                ,disableddays: '@'// 禁用周日至周六所对应的日期 [0,6],0至6 分别代表 周日至周六
                ,onpicked: '&'// 选中事件
                ,oncleared: '&'// 清空事件
                ,qsenabled: '@'// 是否启用快速选择功能, 注意:如果日期格式里不包含 d(天) 这个元素时,快速选择将一直显示,不受此属性控制
                ,quicksel: '@'// 快速选择数据,可以传入5个快速选择日期,日期格式同min/maxDate
            },
            link: function(scope, element, attrs, ngModel) {
                if (!ngModel) return;

                // 配置
                var options = {};
                options.el                  = element[0];
                options.onpicked            = onPickedHandler;
                options.oncleared           = onClearedHandler;
                options.isShowWeek          = scope.isshowweek=='true' ? true : false;
                options.readOnly            = scope.readonly=='true' ? true : false;
                options.highLineWeekDay     = scope.highlineweekday=='true' ? true : false;
                options.isShowClear         = scope.isshowclear=='false' ? false : true;
                options.isShowToday         = scope.isshowtoday=='false' ? false : true;
                options.firstDayOfWeek      = scope.firstdayofweek ? scope.firstdayofweek : 0;
                options.startDate           = scope.startdate;
                options.alwaysUseStartDate  = scope.alwaysusestartdate=='true' ? true : false;
                options.dateFmt             = scope.datefmt;
                options.vel                 = scope.vel;
                options.skin                = scope.skin;
                options.minDate             = scope.mindate;
                options.maxDate             = scope.maxdate;
                options.disabledDays        = scope.disableddays;
                options.qsEnabled           = scope.qsenabled=='false' ? false : true;
                options.quickSel            = (scope.quicksel+'').split(",");

                // 事件
                element[0].onfocus = showPicker;
                element[0].onclick = showPicker;

                // 显示
                function showPicker() {
                    WdatePicker(options);
                }

                // 选中事件
                function onPickedHandler() {
                    setViewValue();
                    scope.onpicked() && scope.onpicked()(element[0].value);
                }

                // 清空事件
                function onClearedHandler() {
                    setViewValue();
                    scope.oncleared() && scope.oncleared()(element[0].value);
                }

                // 更新view
                function setViewValue() {
                    scope.$apply(ngModel.$setViewValue(element[0].value));
                }

            }
        };
    });