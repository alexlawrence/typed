(function() {

    'use strict';
    
    window.typed = window.require('/typed');

    var typedIsNotSupported = typed(function(a/*:Number*/){}).types[0] !== 'Number';
    
    var output = document.getElementById('output');

    var fakeConsole = {
        log: function() { 
            writeToOutput(join(arguments, ' '), 'green');
        },
        warn: function() {
            writeToOutput(join(arguments, ' '), 'chocolate');
        },
        error: function() {
            writeToOutput(join(arguments, ' '), 'red');
        }
    };
    
    var join = function(args, separator) {
        var output = '';
        for (var i = 0, j = args.length; i < j; i++) {
            output += args[i];
            if (i <= j - 1) output += separator;
        }
        return output;
    };    
    
    var writeToOutput = function (message, color) {
        output.innerHTML += '<div style="color:' + color + '">' + message + '</div>'; 
    };
    
    var clearOutput = function() {
        output.innerHTML = '';
    }
    
    var executeCode = function() {
        typed.active = true;
        typed.parser = typed.commentParser;
        clearOutput();
        if (typedIsNotSupported) {
            writeToOutput('Unfortunately your browser does not support the regular typed syntax. ' +
                'Please read below for more details', 'red');
        }        
        var code = editor.getValue();
        try {
            new Function('console', code)(fakeConsole);
        }
        catch (error) {
            writeToOutput(error, 'red');
        }
        typed.active = true;
        typed.parser = typed.commentParser;                
    };    
    
    var editor = CodeMirror.fromTextArea(document.getElementById('editor'), {
        lineNumbers: true,
        onChange: executeCode
    });

    var tutorialSelection = document.getElementById('tutorialSelection');
    
    var loadTutorialAndExecuteCode =  function() {
        var selectedOption = tutorialSelection.options[tutorialSelection.selectedIndex];
        var selectedExample = document.getElementById('example-' + selectedOption.value);
        var code = selectedExample.innerHTML.replace('&lt;', '<').replace('&gt;', '>');
        editor.setValue(code);
        executeCode();
    };
    
    tutorialSelection.addEventListener('change', loadTutorialAndExecuteCode);

    tutorialSelection.selectedIndex = 1;
    loadTutorialAndExecuteCode();
   
}());