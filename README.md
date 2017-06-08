# Knight
Knight is a Siege machine manager, that also wraps around pdsh.


```
  Usage: knight [options]

  Options:

    -h, --help                               output usage information
    -V, --version                            output the version number
    -c --config </path/to/config_file.yaml>  Use config file instead of default ~/.knight/config.yml
    -t --type <machine_type>                 Specify type of AWS image to spin up
    -i --image <image_name>                  Specify AMI image to use.
    -I --identity <identity>                 Specify the path to the identity file to use for SCP and SSH.
    -t --tag <tag>                           Tag name to keep track of the instances
    -k --key <key>                           Public Key used for authorization
    -s --secret <secret>                     AWS Key Secret used for authorization
    -r --region <region>                     AWS region to use
    -g --gcp                                 GCP Mode
    -p --project-id <project_id>             Project Id for GCP
    -K --keyfile <keyfile_path>              Path to the authfile.json for GCP
    -P --prefix <prefix>                     Prefix to use when naming VMs. Defaults to: siege-machine
    -m --min <number>                        Min number of machine to spin up
    -M --max <number>                        Max number of machines to spin up, use this option if you are okay with getting fewer machines.
    -f --file <path>                         Path to siege file to scp to the siege machines.
    -o --output <path>                       Path to an output file for the pdsh/nodeShell to send logs to.
    -u --username <username>                 Username to use to SSH into. Defaults to 'knight'
    -n --node-ssh                            If we should use a nodeJS specific SSH Client instead of PDSH (useful if pdsh isn't installed) defaults to false, will be used if pdsh isn't detected
    --create-config                          Have knight create the config.yml file, specify with -c otherwise uses default location
    -v --verbose                             Verbose flag, can be used multiple times.
```
