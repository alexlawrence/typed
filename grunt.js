module.exports = function(grunt) {

    'use strict';

    grunt.loadNpmTasks('grunt-jasmine-node-task');

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

    grunt.registerTask('browserify', 'browserify code', function() {

        var browserify = require('browserify');
        var output = browserify({
            entry: './src/browserify.js'
        }).bundle();
        grunt.file.write('./bin/typed.browserified.js', output);

    });

    grunt.registerTask('default', 'jasmine browserify');

};