var gulp= require('gulp');
var gutil= require('gulp-util');
var uglify= require('gulp-uglify');
var concat= require('gulp-concat');
var html2js= require('gulp-ng-html2js');//使用这个
var clean=require('gulp-clean');
var minifycss = require('gulp-minify-css'); // CSS压缩

var karma = require('gulp-karma');//测试
//var inject = require("gulp-inject");//依赖注入
var rename = require("gulp-rename");//重命名
var run = require('gulp-run');//运行命令行

var insert = require('gulp-insert');//文件中插入字符串
var intercept = require('gulp-intercept');//文件拦截
var jsoncombine=require('gulp-jsoncombine');//合并json
require('gulp-grunt')(gulp);//执行grunt任务

var modules=[];//组件对象,保存每个组件的信息：名称、优先级、依赖的module数组
var moduleNames=[];//所有的组件名称
var tplmodules=[];//模板modules，保存每个模板的完整module名称

// less 生成 css 代码段，仅为备份，不需删除注释
//var less = require('gulp-less');
//gulp.task('less', function() {
//    var themeName = "default";
//    gulp.src(['./themes/less/*.less','!./themes/less/less-nameset.less'])
//        .pipe(less())
//        .pipe(gulp.dest('./themes/' + themeName + '/'));
//    gulp.src('./themes/*/wi-all.css')
//        .pipe(minifycss())
//        .pipe(gulp.dest('./build/themes/'))
//        .pipe(gulp.dest('./build/docs/themes/'));
//    gulp.src('./themes/*/fonts/**')
//        .pipe(gulp.dest('./build/themes/'))
//        .pipe(gulp.dest('./build/docs/themes/'));
//    gulp.src('./themes/*/images/**')
//        .pipe(gulp.dest('./build/themes/'))
//        .pipe(gulp.dest('./build/docs/themes/'));
//});


//设置module对象
function setModulesInfo(file){
    var deps=[];//依赖的module数组
    //var moduleName=file.path.substring(file.path.lastIndexOf('\\')+1).replace('.js','');

    var contents=file.contents.toString();
    var moduleDeclIndex = contents.indexOf('angular.module(');
    var depArrayStart = contents.indexOf('[', moduleDeclIndex);
    var depArrayEnd = contents.indexOf(']', depArrayStart);
    var dependencies = contents.substring(depArrayStart + 1, depArrayEnd);

    var mStr=contents.substring(moduleDeclIndex+1,depArrayStart).trim();// 'ui.wisoft.wiHdivbox',
    var moduleName=mStr.substring(mStr.lastIndexOf('.')+1,mStr.lastIndexOf('\''));
    var module={"moduleName":"'"+moduleName+"'","priority":0,"deps":deps};
    modules.push(module);

    dependencies.split(',').forEach(function(dep) {
        if (dep.indexOf('ui.wisoft.') > -1) {
            var depName = dep.trim().replace('ui.wisoft.', '');
            deps.push(depName);
        }
    });
}
//设置modules中各module的priority
function setModulePriority(module){
    var deps=module.deps;
    if(deps.length>0){
        deps.forEach(function(depModuleName){
            modules.forEach(function(m){
                if(m.moduleName===depModuleName){
                    m.priority+=1;
                    setModulePriority(m);//递归调用
                    return;
                }
            });
        });
    }
}
//根据优先级进行倒序排列
var compare = function (obj1, obj2) {
    var val1 = obj1.priority;
    var val2 = obj2.priority;
    if (val1 < val2) {
        return 1;
    } else if (val1 > val2) {
        return -1;
    } else {
        return 0;
    }
}

// themes 相关
gulp.task('themes', function(){
    gulp.src('./themes/*/wi-all.css')
        .pipe(minifycss())
        .pipe(gulp.dest('./build/themes/'))
        .pipe(gulp.dest('./build/docs/themes/'))
    gulp.src('./themes/*/fonts/**')
        .pipe(gulp.dest('./build/themes/'))
        .pipe(gulp.dest('./build/docs/themes/'))
    gulp.src('./themes/*/images/**')
        .pipe(gulp.dest('./build/themes/'))
        .pipe(gulp.dest('./build/docs/themes/'))
});

//设置module信息
gulp.task('setModuleInfo', function () {
    return gulp.src(['./src/*/*.js'])
        //.pipe(angularFilesort())
//        .pipe(rename(function(path){
//            var m={};
//            m.module=path.basename;
//            modules.push(m);
////			modules.push('"ui.wisoft.'+path.basename+'"');
//           // modules.push('"ui.bootstarp.'+path.basename+'"');
//        }))
        .pipe(intercept(function(file){
            setModulesInfo(file);
        }))
});
//设置各module的priority
gulp.task('init-modules',['setModuleInfo'],function(){
    //设定每个module的优先级
    modules.forEach(function(module){
        setModulePriority(module);
    });
    modules.sort(compare).forEach(function(obj){
        obj.moduleName='"ui.wisoft.'+String(obj.moduleName).replace('\'','').replace('\'','')+'"';
        moduleNames.push(obj.moduleName);
    });
})

//将模板html文件转换成js文件
gulp.task('template' , function () {
    return gulp.src('./template/**/*.html')
        .pipe(html2js({prefix: "template/"}))
        .pipe(rename({extname:'.html.js'}))
        .pipe(gulp.dest('./build/template'));
});

//将模板html转换成js文件（针对新目录结构，如：src/alert/template/alert/alertTemplate.html ）,生成的js文件被用来测试和生成带模板的组件js
gulp.task('template_new' , function () {
    return gulp.src('./src/*/template/*/*.html')
        .pipe(rename(function (path) {
            tplmodules.push('"'+path.dirname.substring(path.dirname.indexOf('\\')+1).replace('\\','\/')+'/'+path.basename+path.extname+'"');
            path.dirname="./template/"+path.dirname.substring(path.dirname.lastIndexOf('\\')+1)+"/" ;
        }))
        .pipe(html2js())
        .pipe(rename({extname:'.html.js'}))
        .pipe(gulp.dest('./build'));
});

//将组件JS合并(不带模板)
gulp.task('noTpls',['init-modules'],function(){
    return gulp.src('./src/*/*.js')
        .pipe(concat('WebUI4Angular-all.js'))
        .pipe(insert.prepend('angular.module("ui.wisoft",['+moduleNames.join(',')+']);\r\n'))//生成完整的应用module用来加载所有的组件module
        .pipe(gulp.dest('./build'))
        .pipe(rename({basename:'WebUI4Angular-all-mini'}))
        .pipe(uglify())
        .pipe(gulp.dest('./build'));
});

//将组件JS和模板JS合并，生成不压缩和压缩的两个js
gulp.task('tpls',['template_new','init-modules'],function(){
    return gulp.src(['./src/*/*.js','./build/template/*/*.js'])
        .pipe(concat('WebUI4Angular-tpls-all.js'))
        .pipe(insert.prepend('angular.module("ui.wisoft.tpls",['+tplmodules.join(',')+']);\r\n'))//生成完整的模板module用来加载所有的模板module
        .pipe(insert.prepend('angular.module("ui.wisoft",["ui.wisoft.tpls",'+moduleNames.join(',')+']);\r\n'))//生成完整的应用module用来加载所有的组件module
        .pipe(gulp.dest('./build'))
        .pipe(rename({basename:'WebUI4Angular-tpls-all-mini'}))
        .pipe(uglify())
        .pipe(gulp.dest('./build'));
});

//构建前清空上一次构建结果
gulp.task('clean', function () {
    return  gulp.src(['./coverage/*.*','./build/*'],{read: false})
        .pipe(clean('build'))
});

//完整的build任务,构建前清除上次构建及测试目录，运行压缩mini任务会自动运行对应的all任务，所以这里只需运行mini任务
gulp.task('build',['clean','tpls'],function(){
    gulp.src('./lib/My97DatePicker/**')
        .pipe(gulp.dest('./build/My97DatePicker'))
//    gulp.run('all-mini');//不再生成不带模板的js，不带模板使用不方便
//    gulp.run('tpls');
    gulp.src('./themes/*/wi-all.css')
        .pipe(minifycss())
        .pipe(gulp.dest('./build/themes/'))
    gulp.src('./themes/*/fonts/**')
        .pipe(gulp.dest('./build/themes/'))
    gulp.src('./themes/*/images/**')
        .pipe(gulp.dest('./build/themes/'))
    gulp.run('clearTemp');
    console.log('========================构建成功！！=====================');
});

gulp.task('mergeJSON',function(){
    return gulp.src('src/*/docs/demo.json')
        .pipe(jsoncombine("alldemo.json",function(data){
            return new Buffer(JSON.stringify(data));
        }))
        .pipe(gulp.dest('build/docs/demo'));
})
gulp.task('mergeDemoJS',function(){
    return gulp.src('src/*/docs/*.js')
        .pipe(concat('allDemo.js'))
        .pipe(gulp.dest('build/docs/demo'));
})
gulp.task('demoRes',function(){
    gulp.src(['src/*/docs/*.js','src/*/docs/*.html','src/*/docs/*.swf'])
        .pipe(gulp.dest('build/docs/demo'));
    gulp.src('misc/**')
        .pipe(gulp.dest('build/docs/misc'));
    gulp.src('misc/google-code-prettify/**')
        .pipe(gulp.dest('build/docs/google-code-prettify'))
    gulp.src('lib/jquery-1.8.2.min.js')
        .pipe(gulp.dest('build/docs/js'))
    gulp.src('lib/angular-1.3.6/**')
        .pipe(gulp.dest('build/docs/js/angular-1.3.6'))
    gulp.src('./lib/My97DatePicker/**')
        .pipe(gulp.dest('./build/docs/My97DatePicker'))
})
//生成demo文档
gulp.task('demoDoc',['mergeJSON','mergeDemoJS','demoRes','themes'],function(){
    return gulp.src(['./src/index_demo.html','./src/index_demo.js',])
        .pipe(gulp.dest('build/docs'));
})
//生成帮助文档(demo和api)
gulp.task('doc',['build'],function(){
    gulp.run('grunt-ngdocs');
    gulp.run('demoDoc');
});
//清除build/下的template目录
gulp.task('clearTemp',function(){
    gulp.src(['build/template'],{read: false})
        .pipe(clean())
})
//运行所有的单元测试
gulp.task('test',['template_new'], function() {
    // Be sure to return the stream
    // NOTE: Using the fake './foobar' so as to run the files
    // listed in karma.conf.js INSTEAD of what was passed to
    // gulp.src !
    return gulp.src('./foobar')
        .pipe(karma({
            configFile: 'karma.conf.js',
            action: 'run'
        }))
        .on('error', function(err) {
            // Make sure failed tests cause gulp to exit non-zero
            console.log(err);
            console.log('运行单元测试发生错误===================');
            //run('calc').exec();
            this.emit('end'); //instead of erroring the stream, end it
            //throw err;//终止gulp
        });
});

//默认任务，先运行测试，测试完毕后自动构建并生成帮助文档
gulp.task('default',['test'],function(){
    //run('gulp build').exec();//执行命令行时使用
    gulp.run('doc');
});
