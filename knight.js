#!/usr/bin/env node
"use strict";
const program   = require('commander'),
      async     = require('async'),
      yaml      = require('js-yaml'),
      fs        = require('fs'),
      path      = require('path'),
      aws       = require('./lib/aws'),
      gcp       = require('./lib/gcp'),
      ssh       = require('./lib/ssh');

program.version(require('./package.json').version)
    .option("-c --config </path/to/config_file.yaml>", "Use config file instead of default ~/.knight/config.yml", (val) => path.normalize(val.replace("~",process.env.HOME)), process.env.HOME + "/.knight/config.yml")
    .option("-t --type <machine_type>","Specify type of AWS image to spin up")
    .option("-i --image <image_name>", "Specify AMI image to use.")
    .option("-I --identity <identity>", "Specify the path to the identity file to use for SCP and SSH.")
    .option("-t --tag <tag>", "Tag name to keep track of the instances")
    .option("-k --key <key>", "Public Key used for authorization")
    .option("-s --secret <secret>", "AWS Key Secret used for authorization")
    .option("-r --region <region>", "AWS region to use")
    .option("-g --gcp", "GCP Mode")
    .option("-p --project-id <project_id>", "Project Id for GCP")
    .option("-K --keyfile <keyfile_path>", "Path to the authfile.json for GCP")
    .option("-P --prefix <prefix>","Prefix to use when naming VMs. Defaults to: siege-machine")
    .option("-m --min <number>", "Min number of machine to spin up", (val) => parseInt(val, 10))
    .option("-M --max <number>", "Max number of machines to spin up, use this option if you are okay with getting fewer machines.", (val) => parseInt(val, 10))
    .option("-f --file <path>", "Path to siege file to scp to the siege machines.")
    .option("-o --output <path>", "Path to an output file for the pdsh/nodeShell to send logs to.")
    .option("-u --username <username>","Username to use to SSH into. Defaults to 'knight'")
    .option("-n --node-ssh", "If we should use a nodeJS specific SSH Client instead of PDSH (useful if pdsh isn't installed) defaults to false, will be used if pdsh isn't detected")
    .option("--create-config", "Have knight create the config.yml file, specify with -c otherwise uses default location", (val) => true, false)
    .option("-v --verbose", "Verbose flag, can be used multiple times.", (v,total) => total + 1, 0)
    .parse(process.argv);

let opts = ["type","image","tag","key","secret","region","min","max","file", "identity", "projectId", "keyfile","prefix", "gcp", "username"].filter(k => program[k] !== undefined ).reduce((o,v) => { o[v] = program[v]; return o; }, {});
let defaults = {
  type: "t2.micro",
  image: "ami-c58c1dd3",
  tag: "ngtv",
  prefix: "siege-machine",
  region: "us-east-1",
  min: 1,
  username: "knight"
}


if (program.createConfig) {
  try {
    try {
      fs.mkdirSync(path.dirname(program.config))
    } catch (e) {
      if (e.code !== 'EEXIST') console.error(e);
    }
    fs.writeFileSync(program.config, yaml.dump(opts));
    if (program.verbose > 0) console.log("Created Config at",program.config,"quiting...");
    process.exit(0);
  } catch (e) {
    console.error("Unable to create config file at", program.config, e.message || e);
  }
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

if (program.gcp || opts.gcp) {
  defaults.type = "n1-standard-1";
  defaults.region = "us-central1-a";
  defaults.image = "ubuntu";
}

opts = Object.assign(defaults,opts);
opts.verbose = program.verbose;
opts.nodeSSH = true; //program.nodeSsh; Temp force of using the nodeSSH Shell until I can fix the PDSH SIGINT issue
opts.outputFile = program.output;
if (program.verbose > 2) console.dir(opts);

let cloud = opts.gcp ? gcp : aws;
let machines = new Map();

process.on('uncaughtException', err => {
  console.error(err);
  cloud.deleteVMs(opts,machines,() => {
    process.exit(1);
  })
})

async.waterfall([
  async.apply(cloud.generateVMs, opts),
  (m,cb) => { machines = m; cb(null, m)},
  async.apply(ssh.init,opts),
  async.apply(cloud.deleteVMs,opts)
], err => {
  if (err) console.error(err);
  process.exit(err ? 1 : 0);
});