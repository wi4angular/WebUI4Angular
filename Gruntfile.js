module.exports = function (grunt) {

  grunt.loadNpmTasks('grunt-ngdocs');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-clean');

  grunt.initConfig({
    ngdocs: {
      options: {
		dest: 'build/docs',
		title:'WebUI4AngularJS',
        scripts: ['angular.js', 'build/WebUI4Angular-tpls-all-mini.js'],
        html5Mode: false
      },
      all: ['src/*/*.js']
    }
  });
  grunt.registerTask('default', ['ngdocs']);

};
