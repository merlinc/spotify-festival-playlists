#!/usr/bin/env node

module.exports = function (grunt) {
    "use strict";

      grunt.loadNpmTasks('grunt-recess');
      grunt.loadNpmTasks('grunt-contrib-clean');
      grunt.loadNpmTasks('grunt-contrib-copy');
      grunt.loadTasks('build');

    // Project configuration.
    grunt.initConfig({
        distdir: '/Users/merlinc/Spotify/festival-playlists',
        pkg:'<json:package.json>',
        meta:{
          banner:'/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
            '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
            '<%= pkg.homepage ? " * " + pkg.homepage + "\n" : "" %>' +
            ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>;\n' +
            ' */'
        },
        src: {
            js: ['src/**/*.js', 'dist/tmp/**/*.js'],
            css: ['src/**/*.css']
        },
        clean: ['<%= distdir %>/*'],
        copy: {
          assets: {
            files: {'<%= distdir %>/images/': 'src/images/**'}
          },
          css: {
            files: {'<%= distdir %>/css/': 'src/css/**/*.css'}
          },
          data: {
            files: {'<%= distdir %>/data/': 'src/data/**'}
          },
          spotify: {
            files: [{'<%= distdir %>/': 'src/manifest.json'},
                    {'<%= distdir %>/': 'src/index.html'}]

          },
          appJS: {
            files: [{'<%= distdir%>/js/': 'src/scripts/**/*.js'}
            ]
          }
        },
        concat:{
          dist:{
            src:['<banner:meta.banner>', '<config:src.js>'],
            dest:'<%= distdir %>/<%= pkg.name %>.js'
          },
          jquery: {
            src:['vendor/jquery/*.js'],
            dest: '<%= distdir %>/js/jquery.js'
          },
          requirejs: {
            src:['vendor/requirejs/*.js'],
            dest: '<%= distdir %>/js/require.js'
          }
        },
        test: {
          unit: ['test/unit/**/*Spec.js'],
          e2e: ['test/e2e/**/*Scenario.js']
        },
        lint: {
            files:['grunt.js', '<config:src.js>'] /* , '<config:test.unit>', '<config:test.e2e>' */
        },
        jshint:{
            options:{
                curly:true,
                eqeqeq:true,
                immed:true,
                latedef:true,
                newcap:true,
                noarg:true,
                sub:true,
                boss:true,
                eqnull:true
            },
            globals:{}
        },
        watch: {
          gruntfile: {
            files: 'grunt.js',
            tasks: ['lint'],
            options: {
              nocase: true
            }
          },
          src: {
            files: ['src/**/*.js', 'src/**/*.css', 'src/**/*.html', 'src/data/*.json', 'src/manifest.json'], /*, '!lib/dontwatch.js'],*/
            tasks: ['default']
          },
          test: {
            files: ['test/**/*.js'],
            tasks: ['lint', 'test']
          }
        }
    });

    // Default task.
    grunt.registerTask('default', 'build'); // test:unit
    grunt.registerTask('build', 'clean concat index copy');
    grunt.registerTask('release', 'clean min test index copy e2e');
    grunt.registerTask('heroku', 'clean min index copy');

    // HTML stuff
    grunt.registerTask('index', 'Process index.html', function(){
        grunt.file.copy('src/index.html', 'dist/index.html', {process:grunt.template.process});
    });
};