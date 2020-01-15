# grunt-styleguide

[![Build Status](https://travis-ci.com/silvermine/grunt-styleguide.svg?branch=master)](https://travis-ci.com/silvermine/grunt-styleguide)
[![Dependency Status](https://david-dm.org/silvermine/grunt-styleguide.svg)](https://david-dm.org/silvermine/grunt-styleguide)
[![Dev Dependency Status](https://david-dm.org/silvermine/grunt-styleguide/dev-status.svg)](https://david-dm.org/silvermine/grunt-styleguide#info=devDependencies&view=table)

This grunt plugin is focused towards building a static file HMTL/CSS/JS
styleguide. In reality, though, it's just a static site generator. This means,
that you can use it to compile almost any kind of static site you can imagine.

## Sample Configuration

    var sass = require('node-sass');

    grunt.initConfig({
        /**
         * Style Guide Compiler
         */
        styleguide: {
            options: {
                // Required to configure grunt-sass
                gruntSassOptions: {
                    implementation: sass,
                },
            },
            basic: {
                // Compiler configuration:

                // Paths relative to your Gruntfile
                sourceDir: "./style-guide/src",
                outputDir: "./style-guide/dist",

                // Paths relative to sourceDir
                template: "index.html",
                partials: "tests/**/*.html",
                guideCSS: "main.scss",
                guideJS: "main.js",
                favicon: "favicon.ico",

                // Any other arbitrary keys you want can be included here. They
                // are made available to the template. For example you might include:

                // URLs to CSS files to include
                coreCSS: [
                    '/assets/example-1.css',
                    '/assets/example-2.css'
                ],

                // URLs to Javascript files to include
                coreJS: [
                    '/assets/example-1.js',
                    '/assets/example-2.js'
                ],

                // A title for my styleguide
                title: "My Fancy Style Guide"
            }
        }
    });

    grunt.loadNpmTasks('silvermine-styleguide');

## Configuration Reference

### Plugin Options

| Option | Description |
| ------ | ----------- |
| gruntSassOptions | The required [grunt-sass configuration](https://github.com/sindresorhus/grunt-sass#usage). The `implementation` property is required. |

### Basic Task Configuration

| Option | Description |
| ------ | ----------- |
| sourceDir | This is the path (relative to your Gruntfile) that defines where your site's source files are placed. |
| outputDir | This is the path (relative to your Gruntfile) that defines where the compiled output will be placed. |
| template | This is the name of the Nunjucks HTML template to compile on the server. Generally this is your index.html document. |
| partials | This is a glob pattern of Nunjucks HTML templates that should be precompiled into a client-side javascript file. |
| compiledPartialsName | Filename to save precompiled templates into. Defaults to templates.js |
| guideCSS | This is the path (relative to the sourceDir) of the CSS or Sass for your site. It will be run through the Sass compiler to be compiled into CSS in the outputDir .|
| guideJS | This is the path (relative to the sourceDir) of the Javascript for your site. It will be run through the Browserify compiler and placed in the outputDir. |
| favicon | Path (relative to the sourceDir) of your site's favicon. |
| enableWatch | This is a boolean (default true) that may be used to enable or disable watching of template files in Nunjucks. |

## Example Templates

During compilation, the partials directory will be analyzed. Metadata and path
information will be extracted and made available to the server-side template
while rendering. Below are some example templates.

### Client Side Template

    ---
    title: Form Buttons
    description: A sample selection of HTML button elements
    ---
    {% extends "base.html" %}

    {% block content %}
       <form>
         <fieldset>
           <p><input type="button" value="Input type button"></p>
           <p><input type="reset" value="Input type reset"></p>
           <p><input type="submit" value="Input type submit"></p>
           <p><input type="submit" value="Input type submit disabled" disabled></p>
           <p><button type="button">Button type button</button></p>
           <p><button type="reset">Button type reset</button></p>
           <p><button type="submit">Button type submit</button></p>
           <p><button type="button" disabled>Button type button disabled</button></p>
           <p><button>Button</button></p>
         </fieldset>
       </form>
    {% endblock %}

Client side template optionally begin with YAML formatted front-matter. This can
be used to describe the using any arbitrary keys desired. This YAML will be parsed
at pre-compile time and made available to the server side template.

### Server Side Template

    <!DOCTYPE html>
    <html>
        <head>
            <meta charset="utf-8" />
            <title>{{ title }}</title>
        </head>

        {% macro selector(tree) %}
            <ul>
                {% for group in tree.subgroups %}
                    <li>
                        <p>{{ group.name }}</p>
                        {{ selector(group) }}
                    </li>
                {% endfor %}

                {% for partial in tree.partials %}
                    <li>
                        <p data-path="{{ partial.path }}">{{ partial.name }}</p>
                    </li>
                {% endfor %}
            </ul>
        {% endmacro %}

        <body>
            <div id="metadata" style="display:none;">{{ metadata }}</div>

            <ul>
                <li>
                    <p>Partials</p>
                    {{ selector(partials) }}
                </li>
            </ul>

            <script type="text/javascript" src="templates.js"></script>
            <script type="text/javascript" src="main.js"></script>
        </body>
    </html>

### Versions

* 2.0.0 Update peerDependency to use grunt-sass (libSass) instead of grunt-contrib-sass (Ruby Sass)
* 1.0.0 Initial project
