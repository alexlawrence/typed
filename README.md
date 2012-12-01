# typed

Type checking library for JavaScript. Works in Node.js and in most browsers.
Official page and live examples: http://alexlawrence.github.com/typed

## Type checking at runtime

typed provides type checking for function arguments at runtime without any compilation steps.
It works with native types (Boolean, Number, String, etc.), global available custom types and so called structures 
(similar to interfaces, named after destructuring).
Just add type declaration comments to your arguments and wrap your functions inside the **typed()** function.

```javascript
var Greeter = typed(function(greeting /*:String*/) {
  this.greeting = greeting;
});

Greeter.prototype.greet = function() {
  return "Hello, " + this.greeting;
};

var greeter = new Greeter("world");

console.log(greeter.greet());
```

## How it works
            
typed consists of two parts: argument type parsing and runtime argument type checking. The built-in parsers (comment, suffix and no parser) search the source code of the passed functions for type declarations. By default the <strong>comment parser</strong> is used. Unfortunately some JavaScript environments like Firefox and IE7 do not provide the original code comments when reading a function's source code.
            
## Alternative formats
            
If the argument comments don´t work for you can also use the **suffix parser** which searches in argument names for type suffixes. Another option is to use no parser and to provide the type information manually by populating the **types** array of a typed function. Look at the advanced examples to see the usage of these formats.
            
## Performance and production environments

Since the type parsing and type checking is performed at runtime your code will obviously run a bit slower compared to not using typed. Alternatively, you can perform type checking only during development and turn typed off for production environments by setting **typed.active** to false. When deactivated typed will not decorate any passed in functions.