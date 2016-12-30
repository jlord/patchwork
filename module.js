var fs = require('fs');



module.exports = function (directory, fileEx, callback) {

    fs.readdir(directory, function(err,list){
        if(err) return callback(err);
        function filter(filename) {
            var fileMass = filename.split('.');
            return (fileMass[fileMass.length - 1] == fileEx && filename != fileEx)
        }
        var mass = list.toString().split(',').filter(filter);

        callback(null,mass);
    });

}