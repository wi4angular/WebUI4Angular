
describe('datagrid', function () {
    var scope, $compile;
    var element;

    var mydgService;

    var dataprovider=[
        {ischecked:true}, {ischecked:true}, {ischecked:false}
    ];

    beforeEach(module('ui.wisoft.datagrid'));
    //beforeEach(module('template/alert/alert.html'));

        beforeEach( inject( function(_dgService_){
            mydgService = _dgService_;
        }));

        it('checkTotal of myService', function() {
            expect(mydgService.checkTotal()).toBe(false);
        });


});
