#!/usr/bin/env node
"use strict";
const program   = require('commander'),
      async     = require('async'),
      yaml      = require('js-yaml'),
      fs        = require('fs'),
      path      = require('path'),
      AWS       = require('aws-sdk');

program.version(require('./package.json').version)
    .option("-c --config </path/to/config_file.yaml>", "Use config file instead of default ~/.knight/config.yml", (val) => path.normalize(val.replace("~",process.env.HOME)), process.env.HOME + "/.knight/config.yml")
    .option("-t --type <machine_type>","Specify type of AWS image to spin up")
    .option("-i --image <image_name>", "Specify AMI image to use.")
    .option("-I --identity <identity>", "Specify the path to the identity file to use for SCP and SSH")
    .option("-t --tag <tag>", "Tag name to keep track of the instances")
    .option("-k --key <key>", "Public Key used for authorization")
    .option("-s --secret <secret>", "AWS Key Secret used for authorization")
    .option("-r --region <region>", "AWS region to use")
    .option("-m --min <number>", "Min number of machine to spin up", (val) => parseInt(val, 10))
    .option("-M --max <number>", "Max number of machines to spin up, use this option if you are okay with getting fewer machines.", (val) => parseInt(val, 10))
    .option("-f --file <path>", "Path to siege file to scp to the siege machines.")
    .option("--create-config", "Have knight create the config.yml file, specify with -c otherwise uses default location", (val) => true, false)
    .option("-v --verbose", "Verbose flag, can be used multiple times.", (v,total) => total + 1, 0)
    .parse(process.argv);

let opts = ["type","image","tag","key","secret","region","min","max","file", "identity"].filter(k => program[k] !== undefined ).reduce((o,v) => { o[v] = program[v]; return o; }, {});
let defaults = {
  type: "t2.micro",
  image: "ami-c58c1dd3",
  tag: "NGTV_Siege_Machines",
  region: "us-east-1",
  min: 1
}

if (program.createConfig) {
      fs.writeFile(program.config, yaml.dump(opts),(err) => {
        if (err) {
          console.error("Unable to create config file at", program.config, err.message || err);
        } else {
          console.log("Created Config at",program.config);
        }
      });
} else {
  try {
      let config = yaml.load(fs.readFileSync(program.config))
      opts = Object.assign(config, opts);
    } catch (e) {
      if (e.code !== "ENOENT") {
        console.log(e.message || e)
      } else {
        console.warn("File doesn't exist, using default values and arguments");
      }
    }
}

opts = Object.assign(defaults,opts);
// console.dir(opts);

let ec2 = null;
if (!opts.key || !opts.secret) {
  if (program.verbose > 0) console.log("Unable to get AWS access creds, attempting default location...");
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
], (err, data) => data.forEach(a => { a.Reservations.forEach(b => console.log(b)) }))

