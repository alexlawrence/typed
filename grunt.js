module.exports = function(grunt) {

    'use strict';

    var license =
        '/**\n' +
            ' * @license\n' +
            ' * typed - Type checking for JavaScript - version <%= pkg.version %>\n' +
            ' * Copyright 2012, Alex Lawrence\n' +
            ' * Licensed under the MIT license.\n' +
            ' * http://www.opensource.org/licenses/MIT\n' +
            ' */';

    grunt.initConfig({
        pkg: '<json:package.json>',
        meta: {
            license: license
        },
        concat: {
            license: {
                src: ['<banner:meta.license>'],
                dest: 'LICENSE.txt'
            },
            codeAndLicense: {
                src: ['<banner:meta.license>', 'bin/typed.browser.js'],
                dest: 'bin/typed.browser.js'
            }
        },
        min: {
            all: {
                src: ['<banner:meta.license>', 'bin/typed.browser.js'],
                dest: 'bin/typed.browser.min.js'
            }
        }
    });

    grunt.registerTask('jasmine', 'run jasmine specs', function() {

        var jasmine = require('jasmine-node');
        var done = this.async();
        jasmine.executeSpecsInFolder('./spec',
            done,
            false,
            true,
            false,
            false,
            /spec\.js/,
            false);

    });

    grunt.registerTask('browserExport', 'export code for browser', function() {

        var files = grunt.file.readJSON('./component.json').scripts;

        var browserbuild = require('browserbuild');
        browserbuild().include(files)
            .set('basepath', ['src/'])
            .set('main', 'typed')
            .set('global', 'typed')
            .render(function(error, contents) {
                if (error) grunt.error(error);
                grunt.file.write('./bin/typed.browser.js', contents);
        });

    });

    grunt.registerTask('default',
        'jasmine concat:license browserExport concat:codeAndLicense min:all');

};