/**
 * Created by jiangyu on 18/11/2016.
 */
const invoke = require('./invoke');

var files = invoke.listCoreFiles('/mnt/htdocs/dev3/farm');
console.log(JSON.stringify(files));
