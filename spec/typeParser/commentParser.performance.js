'use strict';

var commentParser = require('../../src/typeParser/commentParser');

var x, i, t;

x = 100000;

i = x;
t = new Date();
do {
    commentParser.parseTypes(function(a/*:Number*/, b/*:String*/) {});
} while (i--);
console.log('parsing type information of', x, 'functions with 2 simple typed arguments:', new Date() - t, 'ms');

i = x;
t = new Date();
do {
    commentParser.parseTypes(function(a/*:{a:Number, b:String}*/) {});
} while (i--);
console.log('parsing type information of', x, 'functions with 1 structure typed argument:', new Date() - t, 'ms');