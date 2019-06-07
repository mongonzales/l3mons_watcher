#! /usr/bin/env node
"use strict";
var fs = require('fs');
var path = require('path');
var ncp = require('ncp').ncp;
var runner_1 = require('./runner');
function getParameterValue(parameterName) {
    var paramIdx = process.argv.indexOf(parameterName);
    var returnString = '';
    if (paramIdx >= 0) {
        returnString = process.argv[paramIdx + 1];
    }
    return returnString;
}
function directoryExists(directory) {
    try {
        return fs.statSync(directory).isDirectory();
    }
    catch (e) {
        return false;
    }
}
function fileExists(directory) {
    try {
        return fs.statSync(directory).isFile();
    }
    catch (e) {
        return false;
    }
}
function validSourceTarget() {
    log("Checking parameter values ( it should have --src VALIDPATH --target VALIDPATH)");
    log("getting source");
    source = getParameterValue("--src");
    target = getParameterValue("--target");
    if (!source) {
        log('Source parameter is not found!');
        return false;
        ;
    }
    log("getting target");
    if (!target) {
        log('Target parameter is not found!');
        return false;
        ;
    }
    log("checking identical paths");
    if (source == target) {
        log('Source and target should not be the same');
        return false;
        ;
    }
    log("Valid source and target");
    return true;
}
exports.getParameterValue = getParameterValue;
exports.directoryExists = directoryExists;
exports.fileExists = fileExists;
var source;
var target;
var global_usr_files = __dirname + '\\usr_files\\';
var log = function (message) {
    console.log(message);
};
exports.process = function () {
    log("Watchier");
    if (!validSourceTarget()) {
        return;
    }
    log('Checking validity of the path');
    if (!directoryExists(source)) {
        log('Source directory does not exists or is not a directory');
        return;
    }
    if (!directoryExists(target)) {
        log('Target directory does not exists or is not a directory');
        return;
    }
    log('Copying Source to Target...');
    doWatch(source, target);
};
function doWatch(watchSource, watchTarget, configuration) {
    var exec = require('child_process').exec;
    exec('xcopy "' + watchSource + '" "' + watchTarget + '" /Y /S /q', function (error, stdout, stderr) {
        if (error) {
            console.error("exec error: " + error);
            return;
        }
        if (!configuration)
            configuration = '';
        log('Watchier RUNNING for [' + configuration + ']....');
        fs.watch(watchSource, { recursive: true }, function (event, filename) {
            log('Configuration [' + configuration + '] event:' + event + ', filename: ' + filename);
            var targetFileName = watchTarget + '\\' + filename;
            var targetFilePath = path.dirname(targetFileName);
            var sourceFileName = watchSource + '\\' + filename;
            if (event == 'change') {
                //fs.writeFile("\\\\Beth\\d$\\Mon_\\sample.js","Test");
                if (!directoryExists(targetFilePath)) {
                    fs.mkdir(targetFilePath);
                }
                if (fileExists(targetFileName)) {
                    try {
                        fs.createReadStream(sourceFileName).pipe(fs.createWriteStream(targetFileName));
                    }
                    catch (err) {
                        log(err);
                    }
                }
            }
            else if (event == 'rename') {
                if (!fileExists(sourceFileName)) {
                    fs.unlinkSync(targetFileName);
                }
                else if (fileExists(sourceFileName) && !fileExists(targetFileName)) {
                    fs.createReadStream(sourceFileName).pipe(fs.createWriteStream(targetFileName));
                }
            }
        });
    });
    //xcopy C:\\\SourceTree\\\Entity\\\app C:\\Environment\\1640\\EntityManagement\\debug\\app /Y /S /q
    // ncp(watchSource, watchTarget, function (err) {
    //     if (err) {
    //         log(err);
    //     }
    //     else {
    //     }
    // });
}
(function () {
    //console.log(process.argv);
    var passOnArgs = process.argv;
    var whatKindOfProcess = "";
    if (passOnArgs.length > 2) {
        var commandSelector = passOnArgs[2];
        if ((commandSelector == "add" || commandSelector == "a")) {
            whatKindOfProcess = "add";
        }
        else if (commandSelector == "list" || commandSelector == "ls") {
            console.log('do list function');
            whatKindOfProcess = "list";
        }
        else if (commandSelector == "run" || commandSelector == "run") {
            console.log('do run function');
            whatKindOfProcess = "run";
        }
    }
    switch (whatKindOfProcess) {
        case "add":
            if (passOnArgs.length < 8) {
                console.log("Invalid number of argument. Argument should be as follows [ add NameOfConfiguration --src ValidPath --target ValidPath]");
                return;
            }
            if ((passOnArgs[4] != "--src" && passOnArgs[4] != "--target") && (passOnArgs[7] != "--src" && passOnArgs[7] != "--target")) {
                console.log('invalid positioning of arguments [ add NameOfConfiguration --src ValidPath --target ValidPath]');
                return;
            }
            if (!validSourceTarget()) {
                return;
            }
            var newRunner = new runner_1.runner(getParameterValue('--src'), getParameterValue('--target'));
            console.log(newRunner);
            if (!directoryExists(global_usr_files)) {
                fs.mkdir(global_usr_files);
            }
            var newPath = global_usr_files + passOnArgs[3] + '.wjson';
            console.log(newPath);
            fs.writeFile(newPath, JSON.stringify(newRunner), function (err) {
                if (err) {
                    console.log(err);
                }
                console.log('file created');
            });
            //3 add
            //4 name
            //5 --src
            //6 path
            //7 --target
            //8 path
            break;
        case "list":
            console.log('Checking directory : ' + __dirname);
            fs.readdir(global_usr_files, function (err, files) {
                files.filter(function (file) { return file.substr(-6) === '.wjson'; })
                    .forEach(function (file) {
                    console.log(file.substr(0, file.length - 6));
                });
            });
            break;
        case "run":
            var configs = passOnArgs[3];
            configs.split(',').forEach(function (element) {
                var content = fs.readFile(global_usr_files + element + '.wjson', 'utf8', function (err, data) {
                    if (err) {
                        console.log('Error loading configuration : ' + element);
                        return;
                    }
                    var jsonData = JSON.parse(data);
                    var throwInvalidElement = function () {
                        console.log('Config [' + element + '] has an invalid configuration file');
                    };
                    if (!jsonData) {
                        throwInvalidElement();
                        return;
                    }
                    if (!jsonData.source || !jsonData.target) {
                        throwInvalidElement();
                        return;
                    }
                    console.log('Watching config [' + element + '] source [' + jsonData.source + '], target [' + jsonData.target + ']');
                    doWatch(jsonData.source, jsonData.target, element);
                });
            });
            break;
        default:
            exports.process();
            if (exports.fileExists('.\\built\\config.json')) {
                var content = fs.readFileSync(".\\built\\config.json");
                var contentObject = JSON.parse(content);
                if (contentObject) {
                    console.log(contentObject.local_db);
                }
                else {
                    console.log('Invalid object');
                }
            }
            else {
                console.log('Configuration file not found.');
            }
            break;
    }
})();
