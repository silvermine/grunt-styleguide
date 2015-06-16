/**
 * Grunt Task for generating a style guide
 */
module.exports = function(grunt) {
   "use strict";

   grunt.initConfig({
      jshint: {
         options: {
            jshintrc: true
         },

         src: [
            'Gruntfile.js',
            'tasks/*.js'
         ]
      }
   });

   grunt.loadNpmTasks('grunt-contrib-jshint');
   grunt.loadTasks('tasks');
};
