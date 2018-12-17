/**
 * Main styleguide grunt task
 */
module.exports = function(grunt) {
   'use strict';

   var fs = require('fs'),
       nunjucks = require('nunjucks'),
       path = require('path'),
       yaml = require('yaml-front-matter'),
       _ = require('underscore');


   grunt.loadNpmTasks('grunt-browserify');
   grunt.loadNpmTasks('grunt-sass');


   function buildPartialsTree(partials) {
      var tree = _.reduce(partials, function(memo, partial) {
         var parent = _.reduce(partial.group, function(m, groupName) {
            var group = _.find(m.subgroups, function(g) {
               return g.name === groupName;
            });

            if (!group) {
               group = { name: groupName, subgroups: [], partials: [] };
               m.subgroups.push(group);
            }

            return group;
         }, memo);
         parent.partials.push({ name: partial.name, path: partial.path });
         return memo;
      }, { name: 'Partials', subgroups: [], partials: [] });

      // Condense first level
      return condensePartialsTree(tree);
   }


   function compileTemplates(sourceDir, partialsFlat) {
      return _.map(partialsFlat, function(partial) {
         var fullPath = path.join(sourceDir, partial.path),
             data = yaml.loadFront( fs.readFileSync(fullPath) );

         return {
            path: partial.path,
            metadata: _.omit(data, '__content'),
            content: nunjucks.precompileString(data.__content, {
               name: partial.path
            })
         };
      });
   }


   // NOTE: `ignore:line` is to silence a latedef warning
   function condensePartialsTree(tree) { // jshint ignore:line
      if (tree.partials.length === 0 && tree.subgroups.length === 1) {
         tree = _.first(tree.subgroups);
      }

      tree.subgroups = _.map(tree.subgroups, function(group) {
         return condensePartialsTree(group);
      });

      return tree;
   }


   function listPartials(cwd, globPattern) {
      var partialsFlat = grunt.file.expand({ filter: 'isFile' }, path.join(cwd, globPattern));

      return _.map(partialsFlat, function(p) {
         var relPath = path.relative(cwd, p);

         return {
            group: path.dirname(relPath).split(path.sep),
            name: path.basename(relPath, path.extname(relPath)),
            path: relPath,
         };
      });
   }


   function runMultiTask(name, config) {
      var label = 'styleguide-subtask';
      grunt.config(name + '.' + label, config);
      grunt.task.run(name + ':' + label);
   }


   grunt.registerMultiTask('styleguide', 'Generate a style guide', function() {
      var context = this.data,
          watch = context.enableWatch !== undefined ? context.enableWatch : true,
          templates, partialsFlat, templatePath, outputPath, templateHTML,
          outputHTML;

      // nunjucks settings
      nunjucks.configure({ watch: watch });

      // Resolve dynamic properties
      _.each(_.keys(context), function(key) {
         if (_.isFunction(context[key])) {
            context[key] = context[key]();
         }
      });

      // Build partials tree
      partialsFlat = listPartials(context.sourceDir, context.partials);
      context.partials = buildPartialsTree(partialsFlat);

      // Load and compile template partials
      templates = compileTemplates(context.sourceDir, partialsFlat);

      // Build metadata object containing metadata for each template
      context.metadata = (function() {
         var metadata = _.map(templates, function(partial) {
            return [partial.path, partial.metadata];
         });
         return JSON.stringify( _.object(metadata) );
      }());

      // Run Sass compiler over context.guideCSS
      if (context.guideCSS) {
         runMultiTask('sass', {
            options: {
               sourceMap: true,
               indentWidth: 3,
               outputStyle: 'expanded'
            },
            files: [
               {
                  expand: true,
                  cwd: context.sourceDir,
                  src: [ context.guideCSS ],
                  dest: context.outputDir,
                  ext: '.css'
               }
            ]
         });
      }

      // Run Browserify compiler over context.guideJS
      if (context.guideJS) {
         runMultiTask('browserify', {
            files: [
               {
                  expand: true,
                  cwd: context.sourceDir,
                  src: [ context.guideJS ],
                  dest: context.outputDir
               }
            ]
         });
      }

      // Favicon?
      if (context.favicon) {
         grunt.file.copy(path.join(context.sourceDir, context.favicon), path.join(context.outputDir, context.favicon));
      }

      // Concatenate compiled templates into a single JS file
      outputPath = path.join(context.outputDir, context.compiledPartialsName || 'templates.js');
      fs.writeFileSync(outputPath, _.reduce(templates, function(memo, template) {
         return memo + "\n\n" + template.content;
      }, ""));

      // Render final HTML template
      templatePath = path.join(context.sourceDir, context.template);
      outputPath = path.join(context.outputDir, context.template);
      templateHTML = fs.readFileSync(templatePath, {encoding: 'utf-8'});
      outputHTML = nunjucks.renderString(templateHTML, context);
      fs.writeFileSync(outputPath, outputHTML);

      // Log successful run
      grunt.log.ok("Finished exporting styleguide:" + this.target + " to " + outputPath);
   });

};
