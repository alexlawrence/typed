module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-jasmine-node-task');
    grunt.loadNpmTasks('grunt-shell');

    var browserify = require('browserify');

    grunt.registerTask('browserify', function() {
        var browserify = require('browserify');
        var output = browserify({entry: './src/typed.js',exports:'require'}).bundle();
        grunt.file.write('./browser/typed.browser.js', output);
    });

    grunt.initConfig({
        jasmine_node: {
            all: {
                src: './',
                error_reporting: true
            }
        }
    });

    grunt.registerTask('default', 'jasmine_node:all');

};