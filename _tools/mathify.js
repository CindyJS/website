const fs = require("fs");

let exitStatus = 0;

process.once("beforeExit", () => process.exit(exitStatus));

function fail(err) {
  process.error(err.stack);
  exitStatus = 1;
}

let args = process.argv.slice(2);
let toTex = false;
if (args[0] === "-d") {
  toTex = true;
  args.splice(0, 1);
}

args.forEach(name =>
  fs.readFile(name, "utf-8", (err, body) => {
    if (err) return fail(err);
    body = toTex ? texify(body) : scriptify(body);
    fs.writeFile(name, body, err => {
      if (err) fail(err);
    });
  })
);

function scriptify(body) {
  return body.replace(
    /(`+)[^]*?\1|<script[^]*?<\/script>|(\$\$?)([^]+?)\2/g,
    (match, ticks, dollars, math) => {
      if (!math) return match;
      let type = "text/x-tex";
      if (dollars === "$$") type += ";mode=display";
      return `<script type="${type}">${math}</script>`;
    });
}

function texify(body) {
  return body.replace(
    /(`+)[^]*?\1|<script( type="text\/x-tex(;mode=display)?">)?([^]*?)<\/script>/g,
    (match, ticks, type, display, math) => {
      if (!type) return match;
      if (display) return "$$" + math + "$$";
      return "$" + math + "$";
    });
}
