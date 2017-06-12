
"use strict";
const { spawn, exec } = require('child_process');


function checkForPDSH(callback) {
  exec("which pdsh").on("close", (code) => {
    if (code) {
      console.warn("Unable to find pdsh binary, using nodeShell instead");
    }
    callback(code === 0);
  })
}

function runPDSH(opts, machines, callback) {
  let machArr = Array.from(machines.values()).map(v => v.ip);
  let pdsh = spawn("pdsh", ["-w", machArr.join(",")], { env: Object.assign({PSDH_SSH_ARGS_APPEND: `-i ${opts.identity}`}, process.env), shell: true });
  pdsh.stdout.pipe(process.stdout);
  pdsh.stderr.pipe(process.stderr);
  //pdsh.stdin.pipe(process.stdin);
  process.stdin.pipe(pdsh.stdin);
  /* TODO: figure out how to send a SIGINT to PDSH without it dying 
   * (expected behavior should be PDSH sending SIGINT to all machines.)
   */ 
  var sigIntPDSH = () => pdsh.stdin.write("\x03")  //pdsh.kill('SIGINT');  //pdsh.stdin.write("\x03");
  process.on("SIGINT",sigIntPDSH);
  pdsh.on('close', (code) => {
    if (opts.verbose > 0) console.log("PDSH return code was:",code)
    process.removeListener("SIGINT",sigIntPDSH);
    return callback(null, machines);
  })


}

module.exports = {
  checkForPDSH,
  runPDSH
}