/**
 * Created by jiangyu on 17/11/2016.
 */

const fs = require('fs');

fs.readFileAsync = function(filename) {
    return new Promise(function(resolve, reject) {
        fs.readFile(filename, function(err, data) {
            if (err)
                reject(err);
            else
                resolve(data);
        });
    });
};

fs.readFileAsync("/Users/jiangyu/unknown_error")
    .then(buffer => console.log(buffer.toString()))
    .catch(err => console.error(err.message));
return;

const axios = require('axios');

var get = function() {
    axios.get('http://localhost:3000/dev3', {
        timeout: 1000
    }).then(function(res) {
        console.log("status = " + res.status)
    }).catch(function(error) {
        console.log(error.stack);
        console.log(error);
    });
};
setTimeout(get, 1000);
setTimeout(get, 2000);

