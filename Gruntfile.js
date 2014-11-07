/**
 * Grunt Task for generating a style guide
 */
module.exports = function(grunt) {
   "use strict";

   grunt.loadNpmTasks('grunt-contrib-jshint');

   grunt.initConfig({
      jshint: {
         options: {
            jshintrc: true
         },
         src: [
            'Gruntfile.js',
            'tasks/*.js'
         ]
      },
   });

   grunt.registerTask('default', ['jshint']);
};
