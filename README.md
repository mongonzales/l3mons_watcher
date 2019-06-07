## Installation

  npm install l3mons_watcher --g


## Usage
in command prompt use 
* lwc [commands] for custom commands
* lwc --src VALIDPATH --target VALIDPATH for basic folder watching
* lwc add NameOfConfiguration --src ValidPath --target ValidPath 
    - to add reusable configuration
* lwc list
    - to show all saved configurations
* lwc run configurations
    - to run saved configurations,
    - can run multiple with , as its separator

## Release History

* 1.0.0 Initial release
* 1.0.4 Working watching folder
* 1.0.5 Added commands like add run and list
* 1.0.6 Added read me
* 1.0.10 used the child process instead of ncp
