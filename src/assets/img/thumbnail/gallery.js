"use strict";


var system = require('system');
var fs = require('fs');


if (system.args.length != 2) {
    console.log('Usage: phantomjs gallery.js DIR');
    phantom.exit(1);
}
var path = system.args[1];
console.log(path);

var list = fs.list(path);

var n = 0, cnt = 0;

for (var x = 0; x < list.length; x++)
    if (list[x].split('.').pop() == 'html') {
        var address = "file://" + path + list[x];
        var tmp = list[x].split('.');
        tmp[tmp.length - 1] = "png"
        var output = tmp.join('.');
        if(!fs.exists(output)) {
          n++;
          renderimage(address, output, 1000 * n);
        }
    }
if(n==0) phantom.exit();

function renderimage(address, output, delay) {
    cnt = cnt + 1;
    var page = require('webpage').create();
    
    page.viewportSize = { width: 2000, height: 2000 };
    page.paperSize = { width: 2000, height: 2000, border: '0px' }
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
                  
                page.clipRect =  rect ? {
                  top: rect.top+2,
                  left: rect.left+2,
                  width: rect.width-4,
                  height: rect.height-4
                } : {
                    top: 100,
                    left: 100,
                    width: 300,
                    height: 300
                };

                page.render(output);
                console.log("rendering " + output + "(" + cnt + ")");
                cnt--;
                if (cnt == 0) phantom.exit();
            }, 1000 + delay);
        }
    });
}


//phantom.exit();
