var TreeDemoDataproviderCtrl = [function() {
    var vm = this;
    var simpleData0 = [
        {id:'2',text:'node2',pid:'root',closed:true},
        {id:'1',text:'node1',pid:'root'},
        {id:'3',text:'node3',pid:'root'},
        {id:'4',text:'node4',pid:'root'},
        {id:'13',text:'node13',pid:'1',selected:true},
        {id:'12',text:'node12',pid:'1'},
        {id:'11',text:'node11',pid:'1'},
        {id:'21',text:'node21',pid:'2'},
        {id:'22',text:'node22',pid:'2'},
        {id:'23',text:'node23',pid:'2'},
        {id:'31',text:'node31',pid:'3'},
        {id:'32',text:'node32',pid:'3'},
        {id:'33',text:'node33',pid:'3'},
        {id:'111',text:'node111',pid:'11'},
        {id:'113',text:'node113',pid:'11'},
        {id:'112',text:'node112',pid:'11'}
    ];
    var simpleData1 = [
        {id:'2',text:'节点2',pid:'root'},
        {id:'1',text:'节点1',pid:'root'},
        {id:'3',text:'节点3',pid:'root'},
        {id:'4',text:'节点4',pid:'root'},
        {id:'13',text:'节点13',pid:'1'},
        {id:'12',text:'节点12',pid:'1'},
        {id:'11',text:'节点11',pid:'1'},
        {id:'21',text:'节点21',pid:'2'},
        {id:'22',text:'节点22',pid:'2'},
        {id:'23',text:'节点23',pid:'2'},
        {id:'31',text:'节点31',pid:'3'},
        {id:'32',text:'节点32',pid:'3'},
        {id:'33',text:'节点33',pid:'3'},
        {id:'111',text:'节点111',pid:'11'},
        {id:'113',text:'节点113',pid:'11'},
        {id:'112',text:'节点112',pid:'11'}
    ];
    var treeData = [
        {
            id:'1',
            text: '中国',
            selected: true,
            children: [{
                    id:'11',
                    text: '北京',
                    children: [
                        {id:'111',text: '朝阳区'},
                        {id:'112',text: '宣武区'},
                        {id:'113',text: '海淀区'}
                    ]
                },
                {
                    id:'12',
                    text: '河北',
                    children: [
                        {id:'121',text: '石家庄'},
                        {id:'122',text: '承德' },
                        {id:'123',text: '唐山' }
                    ]
                }
            ]
        },
        {
            id:'2',
            text: '美国',
            children: [
                {
                    id:'21',
                    text: '纽约',
                    children: [
                        { id:'211',  text: '曼哈顿区'},
                        { id:'212',  text: '皇后区'}
                    ]
                },
                {
                    id:'22',
                    text: '德克萨斯州',
                    children: [
                        { id:'221',  text: '休斯顿'},
                        { id:'222',  text: '达拉斯'}
                    ]
                },
                {   id:'23',text: '加利福尼亚州' }
            ]
        }
    ];
    vm.simpleData = simpleData0;
    vm.treeData = treeData;
    vm.myFun = function(){
        vm.simpleData = (vm.simpleData == simpleData0) ?
            simpleData1:simpleData0;
    };
}];
angular.module('ui.wisoft').controller('TreeDemoDataproviderCtrl',TreeDemoDataproviderCtrl);