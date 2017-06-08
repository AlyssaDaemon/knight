"use strict";
const compute   = require('@google-cloud/compute'),
      async     = require('async'),
      ssh       = require('./ssh'),
      fs        = require('fs');

module.exports.generateVMs = function (opts, callback) {
  let gce = compute({
    projectId: opts.projectId,
    credentials: JSON.parse(fs.readFileSync(opts.keyfile).toString('utf-8'))
  })

  let identity = null;
  if (opts.identity) {
    identity = fs.readFileSync(opts.identity + ".pub","utf-8");
  }
  // } else {
  //   identity = ssh.generateKeys("knight-siege", (err, keys) => {

  //   });
  // }
  if (!identity) return callback(new Error("Unable to get public key to generate GCP machines"));

  //gce.getZones().then(console.log);

  let zone = gce.zone(opts.region);


  let machines = new Map();

  async.times(opts.max || opts.min, (idx, cb) => { //idx is unused
      let name = opts.prefix + "-" + Math.random().toString(32).substr(2) + "-" + Date.now();
      while (machines.has(name)) name = opts.prefix + "-" + Math.random().toString(32).substr(2) + "-" + Date.now();
      let machine = {
        id: name
      };
      machines.set(name,machine);
      console.log("Creating", name)
      zone.createVM(name, {
        os: "ubuntu",
        tags: ["siege-machine","knight"],
        http: true,


      }).then((data) => {
          let vm = data[0],
              operation = data[1],
              apiResponse = data[2];

          machine.vm = vm;
          //console.log(apiResponse);

          //console.log("VM:", JSON.stringify(vm,null,2));

          operation.on('complete', metadata => {
            if (opts.verbose > 0) console.log("Operation is complete for", name);//, metadata);

            vm.waitFor("RUNNING", {timeout:600}, (err, metadata) => {
              if (!err) {
                //console.log(name,"created.")
                machine.ip = metadata.networkInterfaces[0].accessConfigs[0].natIP;
              }
              setTimeout(() => cb(err), 60 * 1000);
            });
          });
        }).catch(cb);

  }, (err) => {
    if (err) console.error(err);
    if (opts.verbose > 0) {
      machines.forEach((v,k) => {
        console.log(v.ip,k);
      });
    }
    
    if (typeof callback === "function") return callback(err,machines);
    return Promise.resolve(machines);
  })
}

module.exports.deleteVMs = function(opts, machines, callback) {
  async.each(Array.from(machines.keys()), (key, cb) => {
    if (opts.verbose > 0) console.log("Deleting",name);
    let machine = machines.get(key);
    machine.vm.delete((err) => {
      if (err) console.warn(err);
      cb();
    });
  },callback);
}