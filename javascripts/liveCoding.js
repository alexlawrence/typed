(function() {

    'use strict';

    var typedIsNotSupported = typed(function(a/*:Number*/){}).types[0] !== 'Number';
    var selectedTutorialName = '';
    
    var output = document.getElementById('output');
    var iframe = document.createElement('iframe');
    document.getElementsByTagName('body').item(0).appendChild(iframe);    
    var tutorialSelection = document.getElementById('tutorialSelection');
    
    var clearOutput = function() { output.innerHTML = ''; }    
    var writeToOutput = function (x, c) { output.innerHTML += '<div style="color:' + c + '">' + x + '</div>'; };
    
    window.fakeConsole = {
        log: function() {  writeToOutput(join(arguments, ' '), 'green'); },
        warn: function() { writeToOutput(join(arguments, ' '), 'chocolate'); },
        error: function() { writeToOutput(join(arguments, ' '), 'red'); }
    };  
    
    var sandbox = (function() {
        var typed = parent.typed;
        typed.active = true;
        typed.parser = typed.commentParser;
        var console = parent.fakeConsole;
        try {
            __code__
        }
        catch (error) {
            console.error(error);
        }
    }).toString();    
    sandbox = sandbox.substring(sandbox.indexOf('{') + 1, sandbox.length - 2);
    
    var executeCode = function() {
        clearOutput();
        if (typedIsNotSupported && selectedTutorialName != 'suffix' && selectedTutorialName != 'manual') {
            writeToOutput('Unfortunately your browser does not support the regular typed syntax. ' +
                'Please read below for more details.', 'red');
        }        
        var code = editor.getValue();
        var sandboxedCode = sandbox.replace('__code__', code);
        
        try {
            iframe.contentDocument.open();
            iframe.contentDocument.write(
                '<html><head></head><body>' +
                '<script type="text/javascript" src="javascripts/typed.browserified.js"></script>' +
                '<script type="text/javascript">' + sandboxedCode + '</script>' +
                '</body></html>');
            iframe.contentDocument.close();
        }
        catch (error) {
            writeToOutput(error, 'red');
        }
    };    
    
    var editor = CodeMirror.fromTextArea(document.getElementById('editor'), {
        lineNumbers: true,
        onChange: executeCode
    });

    var loadTutorial =  function() {
        selectedTutorialName = tutorialSelection.options[tutorialSelection.selectedIndex].value;
        var selectedTutorial = document.getElementById('tutorial-' + selectedTutorialName);
        var code = selectedTutorial.innerHTML.replace('&lt;', '<').replace('&gt;', '>');
        editor.setValue(code);
    };
    
    var join = function(args, separator) {
        var output = '';
        for (var i = 0, j = args.length; i < j; i++) {
            output += args[i];
            if (i <= j - 1) output += separator;
        }
        return output;
    };      
    
    tutorialSelection.addEventListener ? 
        tutorialSelection.addEventListener('change', loadTutorial) :
        tutorialSelection.attachEvent('change', loadTutorial);
    tutorialSelection.selectedIndex = 1;
    loadTutorial();
   
}());