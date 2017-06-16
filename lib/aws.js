"use strict";
const AWS = require('aws-sdk');

module.exports.generateVMs = function (opts, callback) {

  let ec2 = null;
  if (!opts.key || !opts.secret) {
    if (opts.verbose > 0) console.log("Unable to get AWS access creds, attempting default location...");
    ec2 = new AWS.EC2({
      apiVersion: '2016-11-15',
      region: opts.region
    });
  } else {
    ec2 = new AWS.EC2({
      accessKeyId: opts.key,
      secretAccessKey: opts.secret,
      region: opts.region,
      apiVersion: '2016-11-15'
    });
  }

  async.series([
    (cb) => ec2.describeInstances({
      //InstanceIds: ["i-047c9b2f35dcd6a47", "i-0deea361fcabfd71a"]
      // Filters: [{
      //   Name: "tag:Knight",
      //   Values:[opts.tag]
      // }]
    },cb)
  ], (err, data) => data.forEach(a => { a.Reservations.forEach(b => console.log(b)) }));


}

module.exports.deleteVMs = function(apts, machines, callback) {
  if (typeof callback === "function") callback();
}