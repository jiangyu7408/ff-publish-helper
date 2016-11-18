/**
 * Created by jiangyu on 18/11/2016.
 */
const assert = require('assert');
const spawn = require('child_process').spawn;
const lockFile = require('lockfile');
const fs = require('fs');

var progress = [];

exports.updateCdn = function(lockFilePath) {
    try {
        lockFile.lockSync(lockFilePath, {})
    } catch (error) {
        // console.log('lock failed: ' + `${error}`);
        return -1;
    }

    progress = [];

    const options = {
        encoding: 'utf8',
        timeout: 0,
        maxBuffer: 200 * 1024,
        killSignal: 'SIGTERM',
        cwd: "/mnt/htdocs/dev3/compile/",
        env: null
    };
    const job = spawn('php', ['workflow.php', '--work', 'works/cdnWorks.php', '--lang', 'en_US'], options);

    job.stdout.on('data', (data) => {
        var lines = data.toString().split("\n");
        lines.forEach(function(element) {
            if (element.length > 0) {
                progress.push(element);
            }
        });
    });
    job.stderr.on('data', (data) => {
        console.log(`stderr: ${data}`);
    });
    job.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
        lockFile.unlockSync(lockFilePath);
    });

    return 0;
};

exports.showProgress = function(res) {
    progress.forEach(function(element) {
        console.log(element);
    });
    res.send(JSON.stringify(progress));
};

exports.getResult = function(lockFilePath, logFilePath) {
    var running = fs.existsSync(lockFilePath);
    if (running) {
        return JSON.stringify({running: true});
    }
    return {
        cdn: fs.readFileSync(logFilePath + "/work_cdnWorks.log").toString().split("\n"),
        preCompile: fs.readFileSync(logFilePath + "/preCompile.log").toString().split("\n"),
        compile: fs.readFileSync(logFilePath + "/work_compileLang.log").toString().split("\n")
    };
};

exports.listCoreFiles = function(baseDir) {
    const watchList = [
        'public/jsondata/facebook/en_US/en_US.config',
    ];
    return watchList.map(function(file) {
        var fullPath = baseDir + "/" + file;
        return {path: fullPath, size: fs.statSync(fullPath).size}
    });
};

exports.showResult = function(lockFilePath, clientId, res) {
    var running = fs.existsSync(lockFilePath);
    console.log(`running: ${running}`);

    const logFile = '/data2/compile_work_dir/dev3/jobs/work_cdnWorks.log';
    var brkFile = `/tmp/dev3.brk.${clientId}`;

    var breakPoint = 0;
    try {
        var buffer = fs.readFileSync(brkFile);
        breakPoint = parseInt(buffer, 10);
    } catch (error) {
    }
    var offset = breakPoint > 0 ? breakPoint + 1 : breakPoint;
    var end = fs.statSync(logFile).size;
    if (offset > end) {
        if (running) {
            res.send('running');
        } else {
            res.send('finished');
            fs.unlink(brkFile, function(error) {
            });
        }
        return;
    }
    // todo check if log file rotated
    try {
        var reader = fs.createReadStream(logFile, {start: offset, end: end});
        reader.pipe(res);
    } catch (error) {
        res.send(`start=${offset},end=${end},${error}`);
    }

    fs.writeFileSync(brkFile, end);
};
