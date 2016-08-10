"use strict";

var addData = require("./add-data");

function defineLicense(name, data) {
    module.exports[name] = function() {
        return addData({
            license: data
        });
    };
}

defineLicense("apache2", {
    url: "http://www.apache.org/licenses/LICENSE-2.0",
    name: "Apache License 2.0",
});

defineLicense("ccbysa40", {
    url: "http://creativecommons.org/licenses/by-sa/4.0/",
    icon: "https://i.creativecommons.org/l/by-sa/4.0/88x31.png",
    name: "CC-BY-SA 4.0 License",
});