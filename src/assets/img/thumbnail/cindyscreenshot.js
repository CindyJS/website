"use strict";

var system = require('system');
var fs = require('fs');
var exec = require('child_process').exec;

if (system.args.length < 2) {
    console.log('Usage: phantomjs gallery.js FILE[s]');
    phantom.exit(1);
}

var queue = [];

for (var x = 1; x < system.args.length; x++)
    if (system.args[x].split('.').pop() == 'html') {
        var path = system.args[x];
        var output = /.*\/(.*?)\./.exec(path)[1] + '.png';
        if (!fs.exists(output)) {
            queue.push([path, output]);
        }
    }

    function emptyqueue() {
      console.log('queue.length: ' + queue.length);
      if(queue.length == 0) phantom.exit();
      else {
        var cur = queue.pop();
        renderimage(cur[0], cur[1])
      }
    }
    
emptyqueue();
    
function renderimage(address, output) {
    var page = require('webpage').create();
    page.viewportSize = {
        width: 2000,
        height: 2000
    };
    page.paperSize = {
        width: 2000,
        height: 2000,
        border: '0px'
    }
    page.open(address, function(status) {
        if (status !== 'success') {
            console.log('Unable to load the address!');
            phantom.exit(1);
        } else {
            page.sendEvent('mousemove', 200, 200);
            page.sendEvent('mouseclick', 200, 200);

            window.setTimeout(function() {
                page.sendEvent('mousemove', 200, 200);
                page.sendEvent('mouseclick', 200, 200);
                var rect = page.evaluate(function() {
                    var div = document.getElementById('Cindy3D') || document.getElementById('CSCanvas') || document.getElementById('CSCanvas1') || document.getElementById('cindy') || document.getElementById('enCindy');
                    return div.getBoundingClientRect();
                });

                page.clipRect = rect ? {
                    top: rect.top + 2,
                    left: rect.left + 2,
                    width: rect.width - 4,
                    height: rect.height - 4
                } : {
                    top: 100,
                    left: 100,
                    width: 300,
                    height: 300
                };
                
                console.log("rendering " + output);
                page.render(output);
                
                console.log("converting " + output);
                exec("convert " + output + " -filter Lanczos -resize 300x300^ -gravity center -extent 300x300 " + output)
                
                emptyqueue();
            }, 1000);
        }
    });
}
