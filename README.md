![Knight](https://raw.githubusercontent.com/AlyssaDaemon/knight/master/res/KnightHorseback3.svg?sanitize=true)
# Knight (UNMAINTAINED DO NOT USE! If you would like to take this over please reach out to me on the email address in package.json or fork)
Knight is a Siege machine manager, it will spin up VMs, SSH into them, and finally delete them after the user exits from the program. Currently only supports Node 6 LTS.



## Installing
```bash
npm i -g "git+ssh://github.com/AlyssaDaemon/knight"
```

## Using

```text
$ knight -h

  Usage: knight [options]

  Options:

    -h, --help                               output usage information
    -V, --version                            output the version number
    -c --config </path/to/config_file.yaml>  Use config file instead of default ~/.knight/config.yml
    -t --type <machine_type>                 Specify type of AWS/GCP VM to spin up
    -i --image <image_name>                  Specify AMI/GCP image to use.
    -I --identity <identity>                 Specify the path to the identity file to use for SCP and SSH.
    --tag <tag>                              Tag name to keep track of the instances
    -k --key <key>                           Public Key used for authorization
    -s --secret <secret>                     AWS Key Secret used for authorization
    -r --region <region>                     Cloud region to use
    -g --gcp                                 GCP Mode, currently on by default till AWS integration is complete
    -p --project-id <project_id>             Project Id for GCP
    -K --keyfile <keyfile_path>              Path to the authfile.json for GCP
    -P --prefix <prefix>                     Prefix to use when naming VMs. Defaults to: siege-machine
    -m --min <number>                        Min number of machine to spin up
    -M --max <number>                        Max number of machines to spin up, use this option if you are okay with getting fewer machines.
    -f --file <path>                         Path to siege file to scp to the siege machines.
    -o --output <path>                       Path to an output file for the pdsh/nodeShell to send logs to.
    -u --username <username>                 Username to use to SSH into. Defaults to 'knight'
    --preemptible [true|false]               If knight should use preemptible
    -w --wait-time <milliseconds>            Time in milliseconds that knight will wait for the new VMs to boot up.
    --create-config                          Have knight create the config.yml file, specify with -c otherwise uses default location, exits on completion
    -v --verbose                             Verbose flag, can be used multiple times.
```

### Example Call
```
$ knight --preemptible false -m 10 -r us-central1-f --type n1-standard-1 -K path/to/gcp/auth.json -I .ssh/id_some_ssh_key
Creating siege-machine-68frvepkt2g-1504283203957
Creating siege-machine-7dbvm0cilmg-1504283203962
Creating siege-machine-jt455k1kik-1504283203963
Creating siege-machine-e11u7o8kjj8-1504283203964
Creating siege-machine-tujdkhp46o-1504283203964
Creating siege-machine-ja3045a1apg-1504283203964
Creating siege-machine-5601a0055cg-1504283203964
Creating siege-machine-46sr5mtl2io-1504283203964
Creating siege-machine-fnii1tkerc8-1504283203964
Creating siege-machine-12kbl7j32l8-1504283203964
Ready to siege...
(type 'exit' or use Ctrl-c to quit knight)
knight> echo "Hello"
siege-machine-7dbvm0cilmg-1504283203962: Hello
siege-machine-tujdkhp46o-1504283203964: Hello
siege-machine-ja3045a1apg-1504283203964: Hello
siege-machine-jt455k1kik-1504283203963: Hello
siege-machine-46sr5mtl2io-1504283203964: Hello
siege-machine-5601a0055cg-1504283203964: Hello
siege-machine-68frvepkt2g-1504283203957: Hello
siege-machine-12kbl7j32l8-1504283203964: Hello
siege-machine-fnii1tkerc8-1504283203964: Hello
siege-machine-e11u7o8kjj8-1504283203964: Hello
knight> exit
Deleting siege-machine-68frvepkt2g-1504283203957
Deleting siege-machine-7dbvm0cilmg-1504283203962
Deleting siege-machine-jt455k1kik-1504283203963
Deleting siege-machine-e11u7o8kjj8-1504283203964
Deleting siege-machine-tujdkhp46o-1504283203964
Deleting siege-machine-ja3045a1apg-1504283203964
Deleting siege-machine-5601a0055cg-1504283203964
Deleting siege-machine-46sr5mtl2io-1504283203964
Deleting siege-machine-fnii1tkerc8-1504283203964
Deleting siege-machine-12kbl7j32l8-1504283203964
siege-machine-jt455k1kik-1504283203963 ended SSH connection
siege-machine-tujdkhp46o-1504283203964 ended SSH connection
siege-machine-fnii1tkerc8-1504283203964 ended SSH connection
siege-machine-ja3045a1apg-1504283203964 ended SSH connection
siege-machine-68frvepkt2g-1504283203957 ended SSH connection
siege-machine-46sr5mtl2io-1504283203964 ended SSH connection
siege-machine-7dbvm0cilmg-1504283203962 ended SSH connection
siege-machine-5601a0055cg-1504283203964 ended SSH connection
siege-machine-12kbl7j32l8-1504283203964 ended SSH connection
siege-machine-e11u7o8kjj8-1504283203964 ended SSH connection
$
```


## Config
Knight requires that you already have some account on GCP (AWS is on the roadmap). It also, currently, requires that you tag a knight ssh key so that all siege machines spun up will have access to it. This is planned to be fixed.

## "Roadmap"
* Integrate AWS with Knight
* Fix the streaming output issue
* Implement EventEmitter model or move to golang
* Implement commands (such as `.create` or `.delete` to spin up or delete VMs on the fly)
* Implement SSH key tagging so that the SSH key can be truly™ dynamic.


Knight SVG taken from: https://publicdomainvectors.org/en/free-clipart/Knight-attacks/37184.html
