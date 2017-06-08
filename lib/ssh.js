"use strict";

const Client            = require('ssh2').Client,
      async             = require('async'),
      { exec, spawn }   = require('child_process'),
      fs                = require('fs');

module.exports.init = function (opts, machines, callback) {
  if (!opts.PS1) opts.PS1 = "knight> ";

  if (!opts.nodeSSH) {
    checkForPDSH((hasPDSH) => {
      if (hasPDSH) return runPDSH(opts, machines, callback);
      return startShell(opts, machines, callback);
    });
  } else {
    return startShell(opts, machines, callback);
  }
}

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
  pdsh.stdin.pipe(process.stdin);
  pdsh.on('close', (code) => {
    if (opts.verbose > 0) console.log("PDSH return code was:",code)
    return callback(null, machines);
  })

}


function startShell(opts, machines,callback) {
  // Allows thus utility to be used as either a promise or a callback
  let promise = Promise.defer();
  let callbackCalled = false;
  let readies = 0;

  connectClients(opts,machines, (err) => {
    if (err) return callback(err, machines);
    console.log("Ready to siege, my liege...");
    process.stdout.write(opts.PS1);

    process.stdin.on("data", (input) => {
      // If the command is "exit" (or we SIGINT), we should start the next phase.
      readies = 0;
      if (/^exit/.test(input.toString("utf-8"))) {
        machines.forEach(machine => machine.ssh.end());
        if (typeof callback === "function" && !callbackCalled) {
          callbackCalled = true;
          return callback(null, machines);
        }
        return promise.resolve();
      }
      if (opts.verbose > 0) process.stdout.write(input);
      //process.stdout.write(input.toString('utf-8'));
      machines.forEach((machine,name) => {
        machine.ssh.exec(input.toString("utf-8"), (err, stream) => {
          if (opts.verbose > 0) console.log(input.toString("utf-8"), "sent to",name,"err is",err);
          if (err) console.error(err);
          stream.on("data", (input) => {
            process.stdout.write(name + ": " + input.toString('utf-8'));
          })
          stream.stderr.on("data", (input) => {
            process.stdout.write("E: " + name + ": " + input.toString('utf-8'))
          })
          stream.on("end", () => {
            readies += 1;
            if (readies === machines.size) process.stdout.write(opts.PS1);
          });
        })
      });
    });

    process.on('SIGINT', () => {
      machines.forEach(machine => machine.ssh.end());
      if (typeof callback === "function" && !callbackCalled) {
        callbackCalled = true;
        return callback(null, machines);
      }
      return promise.resolve();
    });
  });

  return promise.promise;
}

module.exports.startShell = startShell;

function connectClients(opts, machines, callback) {
  let keyFile;
  try {
    keyFile = fs.readFileSync(opts.identity);
  } catch(e) {
    console.error(e);
  }
  if (!keyFile) callback(new Error("Unable to get SSH Key"));

  async.each(Array.from(machines.keys()), async.retryable({ times: 3, interval: 1500 },(key, cb) => {
    let callbackCalled = false;
    try {
      if (opts.verbose > 0) console.log("SSH connection to",key);
      let machine = machines.get(key);
      machine.ssh = new Client();
      machine.ssh.on('ready', () => {
        callbackCalled = true;
        cb()
        }).connect({
        host: machine.ip,
        port: 22,
        username: opts.username,
        privateKey: keyFile,
        readyTimeout: 50000,
        keepaliveInterval: 1000
      })
      machine.ssh.on("error", (error) => {
        console.error(error);
        callbackCalled = true;
        cb(error);
      });
    } catch (e) {
      console.error(e);
      if (!callbackCalled) cb(e);
    }
  }), callback);
}