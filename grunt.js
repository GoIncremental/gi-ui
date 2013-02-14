/*global module*/

module.exports = function (grunt) {
  'use strict';

  grunt.initConfig({
    pkg: '<json:package.json>',

    // delete the dist folder
    delete: {
      temp: {
        files: ['./temp/']
      }
    },

    // lint CoffeeScript
    coffeeLint: {
      scripts: {
        src: ['./**/*.coffee'],
        indentation: {
          value: 2,
          level: 'error'
        },
        no_plusplus: {
          level: 'error'
        }
      },
      tests: {
        src: ['./test/**/*.coffee'],
        indentation: {
          value: 2,
          level: 'error'
        },
        no_plusplus: {
          level: 'error'
        }
      }
    },

    // compile CoffeeScript to JavaScript
    coffee: {
      scripts: {
        files: {
          './temp/client/': './client/**/*.coffee'
        },
        bare: true
      },
      tests: {
        files: {
          './test/': './test/coffee/**/*.coffee'
        },
        bare: true
      }
    },

    // optimizes files managed by RequireJS
    requirejs: {
      scripts: {
        baseUrl: './temp/client/',
        findNestedDependencies: true,
        logLevel: 0,
        mainConfigFile: './temp/client/main.js',
        name: 'main',
        onBuildWrite: function (moduleName, path, contents) {
          var modulesToExclude = ['main'],
            shouldExcludeModule = modulesToExclude.indexOf(moduleName) >= 0;

          if (shouldExcludeModule) {
            return '';
          }

          return contents;
        },
        optimize: 'none',
        out: './client/gint-ui.js',
        preserveLicenseComments: false,
        skipModuleInsertion: true,
        uglify: {
          no_mangle: false
        }
      }
    },


  });

  grunt.loadNpmTasks('grunt-hustler');

  grunt.registerTask('default', [
    'coffeeLint',
    'coffee',
    'requirejs',
    'delete'
  ]);

};