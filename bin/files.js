var fs        = require('fs'),
    color     = require('colors/safe'),
    database  = require('../bin/mysql'),
    converter = require("csvtojson").Converter;

var conf = JSON.parse(fs.readFileSync('./bin/app.cnf', 'utf8'));

var checkFolder = function(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
        console.log(color.warn("Creada carpeta: " + dir));
    }
};

var copyFile = function(source, target, cb) {
    var cbCalled = false;

    var rd = fs.createReadStream(source);
        rd.on("error", function(err) {
        done(err);
    });

    var wr = fs.createWriteStream(target);
        wr.on("error", function(err) {
        done(err);
    });

    wr.on("close", function(ex) {
        done();
    });

    rd.pipe(wr);

    function done(err) {
        if (!cbCalled) {
            cb(err);
            cbCalled = true;
        }
    }
};

var deleteFile = function(filename) {
    try {
        fs.unlinkSync(filename);
        console.log(color.help(filename) + color.debug("->") + color.data("delete"));
    } catch(err) {
        exceptionFile(err);
    }
};

var exceptionFile = function(err) {
    console.log((err + "fs").match(/cannot be found|no such file/i)?
                color.data("Evt: file change") : color.error(err));
};

var execQuery = function(server, table, otype, filename) {
    new converter({
        noheader : true,
        checkType: false,
        flatKeys : true,
        headers  : conf[table].fields
    }).fromFile(filename, function(err, result){
        if(err) exceptionFile(err);
        else if (result[0] != null) {
            var rawQuery = database.getQuery(table, otype, result[0]);
            database.getConnection(server, function(err, connection){
                connection.query(rawQuery, function(err, rows, fields) {
                    if(err) color.error(err);
                    else {
                        console.log(color.warn(server) + color.debug(":") +
                                    color.help(table) + color.debug("->") +
                                    color.data(otype));
                        deleteFile(filename);
                    }
                });
            });
        } else {
            deleteFile(filename);
        }
    });
};

function runQuerys(){
    for (var server in conf.servers) {
        var folder = conf.log_path + server + '/',
            files  = fs.readdirSync(folder);
        for (var i in files) {
            var filename = folder + files[i],
                metadata = files[i].split("-");

            var table = metadata[0],
                otype = metadata[1].substr(0, metadata[1].indexOf("_"));

            execQuery(server, table, otype, filename)
        }
    } error = false;
}

var error = false;
fs.watch(conf.log_path, function (event, filename) {
    if(filename.match(/.csv/i) && event === 'rename' && !error) {
        error = true;
        var file = filename.substring(0, filename.length-4) + '_' + new Date().toJSON() + '.log';

        console.log(color.help(filename) + color.debug("->") + color.data(event));

        for (var i in conf.servers) {
            var dir = conf.log_path + i;

            checkFolder(dir);

            copyFile(conf.log_path + filename, dir + "/" + file, function(err) {
                if(err) exceptionFile(err);
            });
        }

        deleteFile(conf.log_path + filename);

        runQuerys();
    }
});

exports.init = function() {
    for (var i in conf.servers) {
        checkFolder(conf.log_path + i);
    } runQuerys();
};