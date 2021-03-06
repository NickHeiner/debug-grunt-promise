'use strict';

module.exports = function(grunt) {

    var q = require('q'),
        util = require('util');

    grunt.initConfig({
        'my-task': {
            'my-target': {
                options: {
                    // This will not be usable when you access it from `this.options()` in a task.
                    promise: q('hello world')
                }
            }
        },

        'my-task-workaround': {
            'my-target': {
                options: {
                    // Wrapping the promise in a function will prevent grunt from mangling it, although of course
                    // it defers when you are able to begin the async operation.
                    promiseFn: function() {
                        return q('hello workaround');
                    }
                }
            }
        },

        'my-task-not-using-options': {
            'my-target': {
                promise: q('also fails without using options')
            }
        }
    });

    function onErr(done) {
        return function(err) {
            if (util.isError(err)) {
                done(err);
            } else {
                done(new Error(err));
            }
        }
    }

    grunt.registerMultiTask('my-task', function() {
        var done = this.async(),
            options = this.options();

        options.promise.then(function(val) {
            grunt.log.ok('Promise resolved to: ' + val);
        }).then(done, onErr(done));
    });

    grunt.registerMultiTask('my-task-workaround', function() {
        var done = this.async(),
            options = this.options();

        options.promiseFn().then(function(val) {
            grunt.log.ok('Promise resolved to: ' + val);
        }).then(done, onErr(done));
    });

    grunt.registerMultiTask('my-task-not-using-options', function() {
        var done = this.async();

        grunt.config(['my-task', this.target]).then(function(val) {
            grunt.log.ok('Promise resolved to: ' + val);
        }).then(done, onErr(done));
    });

    grunt.registerTask('test', ['my-task-workaround', 'my-task-not-using-options', 'my-task']);

};