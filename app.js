/**
 * Created by jiangyu on 17/11/2016.
 */
const assert = require('assert');
const express = require('express');
const morgan = require('morgan');
const fs = require('fs');
const invoke = require('./invoke.js');
const util = require('util');

var app = express();

app.use(morgan('combined'));
app.use(express.static('public'));
app.get('/', function(req, res) {
    res.send('Hello World!' + __dirname);
});
app.get('/dev3', function(req, res) {
    var logFile = "/Users/jiangyu/unknown_error";
    var brkFile = __dirname + "/dev3.brk";

    var breakPoint = parseInt(fs.readFileSync(brkFile), 10);
    var offset = breakPoint > 0 ? breakPoint + 1 : breakPoint;
    var end = fs.statSync(logFile).size;
    // todo check if log file rotated
    // todo check if log file well-done
    if (offset >= end) {
        res.send('');
        return;
    }
    var reader = fs.createReadStream(logFile, {start: offset, end: end});
    reader.pipe(res);

    fs.writeFileSync(brkFile, end);
});
app.get('/dev3/cdn', function(req, res) {
    var started = invoke.updateCdn('/tmp/dev3.cdn.lock');
    if (started == 0) {
        res.send('started');
    }
    if (started == -1) {
        res.send('already started');
    }
});
app.get('/dev3/cdn/progress', function(req, res) {
    invoke.showProgress(res);
});
app.get('/dev3/cdn/result', function(req, res) {
    var result = invoke.getResult('/tmp/dev3.cdn.lock', '/data2/compile_work_dir/dev3/jobs');
    res.send(result);
});
app.get('/dev3/cdn/files', function(req, res) {
    var files = invoke.listCoreFiles('/mnt/htdocs/dev3/farm');
    res.send(JSON.stringify(files));
});
app.use(function(req, res, next) {
    res.status(404).send('Sorry cant find that!' + `${req}`);
});
app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});
app.listen(3000, function() {
    console.log('Example app listening on port 3000!');
});
