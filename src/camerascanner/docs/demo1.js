var CameraScannerDemoCtrl=['wiAlert',function (wiAlert) {
    this.uploadUrl = 'http://192.10.110.174:8804/NewFrame/CommonServlet?bean=FileUploadCommonPO&path=D:\\wisoft\\&sid=408aee4e3bacd24f013bb0ec0e650030';

    this.uploadComplete = function(data) {
        setTimeout(function(){
            var option = {
                width: 600,
                title: '文件下载地址',
                content:'http://192.10.110.174:8804/NewFrame/CommonServlet?bean=FileDownloadPO&file'+data
            }
            wiAlert.info(option);
        }, 500);

    }
}];
angular.module('ui.wisoft').controller('CameraScannerDemoCtrl',CameraScannerDemoCtrl);