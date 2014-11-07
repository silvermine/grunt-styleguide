/**
 * Main styleguide grunt task
 */
module.exports = function(grunt) {
   'use strict';

   var fs = require('fs'),
       nunjucks = require('nunjucks');


   grunt.registerMultiTask('styleguide', 'Generate a static HTML style guide', function() {
      var context = this.data,
          partials = fs.realpathSync(context.partials),
          html, template;

      // Allow 'css' to be a function that when called, returns an array of css files.
      if (typeof context.css === 'function') {
         context.css = context.css();
      }

      context.template = context.template || (__dirname + "/../guide.html");
      context.template = fs.realpathSync(context.template);

      context.snippets = (function() {
         var filenames = fs.readdirSync(partials),
             snippets = {},
             i = 0, name;

         grunt.log.writeln("Loading partials...");

         // Filter out all files starting with '.' (*nix hidden files)
         filenames = filenames.filter(function(item) {
            return item.charAt(0) !== '.';
         });

         for (i = 0; i < filenames.length; i++) {
            name = filenames[i];
            grunt.log.writeln("   " + name);
            snippets[name.replace('.', '-')] = (context.partials + "/" + name);
         }

         return snippets;
      }());


      template = fs.readFileSync(context.template, {encoding: 'utf-8'});
      html = nunjucks.renderString(template, context);
      fs.writeFileSync(context.output, html);

      grunt.log.writeln("Finished exporting styleguide:" + this.target + " to " + context.output);
   });

};
