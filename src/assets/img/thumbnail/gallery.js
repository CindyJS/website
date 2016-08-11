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


function renderimage(address, output, delay) {
    cnt = cnt + 1;
    var page = require('webpage').create();

    page.open(address, function(status) {
        if (status !== 'success') {
            console.log('Unable to load the address!');
            phantom.exit(1);
        } else {
            var ev = document.createEvent("MouseEvent");
            ev.initMouseEvent(
                "click",
                true /* bubble */ , true /* cancelable */ ,
                window, null,
                100, 100, 100, 100, /* coordinates */
                false, false, false, false, /* modifier keys */
                0 /*left*/ , null
            );

            window.setTimeout(function() {
                page.clipRect = {
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
