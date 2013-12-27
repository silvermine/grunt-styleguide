/**
 * Grunt Task for generating a style guide
 */
module.exports = function(grunt) {
   "use strict";

   var fs = require('fs'),
       nunjucks = require('nunjucks');


   grunt.registerMultiTask('styleguide', 'Generate a static HTML style guide', function() {
      var context = this.data,
          html;

      context.template = context.template || "./guide.html";

      context.snippets = (function() {
         var filenames = fs.readdirSync(options.partials),
             snippets = {},
             i = 0, name;

         for (i = 0; i < filenames.length; i++) {
            name = filenames[i];
            snippets[name.replace('.', '-')] = (options.partials + "/" + name);
         }

         return snippets;
      }());

      html = nunjucks.render(options.template, context);
      fs.writeFileSync(options.output, html);

      grunt.log.writeln("Finished exporting styleguide:" + this.target);
   });
};
