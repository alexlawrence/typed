'use strict';

var _expect = expect;

var expect = function() {
    var _ = _expect.apply(this, arguments);
    _.toParse = function() {
        return {
            as: function() {

            }
        }
    };
};