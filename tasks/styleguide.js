/**
 * Main styleguide grunt task
 */
module.exports = function(grunt) {
   'use strict';

   var fs = require('fs'),
       nunjucks = require('nunjucks');


   grunt.registerMultiTask('styleguide', 'Generate a static HTML style guide', function() {
      var context = this.data,
          output = fs.realpathSync(context.output),
          partials = fs.realpathSync(context.partials),
          html, template;

      context.template = context.template || (__dirname + "/../guide.html");
      context.template = fs.realpathSync(context.template);

      context.snippets = (function() {
         var filenames = fs.readdirSync(partials),
             snippets = {},
             i = 0, name;

         grunt.log.writeln("Loading partials...");

         for (i = 0; i < filenames.length; i++) {
            name = filenames[i];
            grunt.log.writeln("   " + name);
            snippets[name.replace('.', '-')] = (context.partials + "/" + name);
         }

         return snippets;
      }());


      template = fs.readFileSync(context.template, {encoding: 'utf-8'});
      html = nunjucks.renderString(template, context);
      fs.writeFileSync(output, html);

      grunt.log.writeln("Finished exporting styleguide:" + this.target + " to " + output);
   });

};
