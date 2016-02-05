var fs    = require('fs'),
    mysql = require('mysql'),
    async = require('async'),
    color = require('colors/safe');

var conf = JSON.parse(fs.readFileSync('./bin/app.cnf', 'utf8'));

var pool = {},
    func = {};

var poolObject = function(server){
    return function(callback){
        pool[server].getConnection(function(err, connection){
            callback(null, server + ' ' + (err ? color.error(err) : color.info('OK')));
        });
    };
};

var getConditions = function(vars){
    var condition = "";
    for (var i in vars.split("|"))
        condition += "`" + i + "`=\"" + data[i] + "\" AND";
    return condition.substr(0, condition.length - 4);
}

for (var i in conf.servers) {
    pool[i] = mysql.createPool({
        host    : conf.servers[i].host,
        port    : conf.servers[i].port,
        user    : conf.servers[i].user,
        password: conf.servers[i].pass,
        database: conf.servers[i].dbname
    });
    func[i] = poolObject(i);
}

exports.getQuery = function(table, type, data){
    var key    = conf[table].primary,
        query  = "",
        values = "";

    switch(type){
        case 'insert':
            var fields = "";

            for (var i in data) {
                fields += "`" + i + "`,";
                values += data[i] == "\\N" ? "NULL" : "\"" + data[i] + "\",";
            }
            
            fields = fields.substr(0, fields.length - 1);
            values = values.substr(0, values.length - 1);

            query = "INSERT INTO `" + table + "`(" + fields + ") VALUES (" + values + ")"
            break;

        case 'update':
            var condition = "`" + key + "`=\"" + data[key] + "\"";
            
            if(key.indexOf("|") !== -1) {
                condition = getConditions(key);

            for (var i in data)
                values += "`" + i + "`=" + (data[i] == "\\N" ? "NULL" : "\"" + data[i] + "\"") + ","

            values = values.substr(0, values.length - 1);

            query = "UPDATE `" + table + "` SET " + values + " WHERE " + condition;
            break;

        case 'delete':
            var condition = "`" + key + "`=\"" + data[key] + "\"";

            if(key.indexOf("|") !== -1)
                condition = getConditions(key);

            query = "DELETE FROM `" + table + "` WHERE " + condition;
            break;
    }

    return query;
};

exports.getConnection = function(server, callback){
    pool[server].getConnection(function(err, connection) {
        callback(err, connection);
    });
};

exports.init = function(){
    async.parallel(func, function(err, result){
        for (var i in result) {
            console.log(result[i]);
            if(result[i].match(/err/i))
                err = true;
        }
        console.log(err ?
            color.warn("Algunos servidores no estan en linea") :
            color.info("Servidores en linea")
        );
    });
};

// var poolCluster = mysql.createPoolCluster({
//     restoreNodeTimeout  : 300000,    //milisegundos (5 minutos)
//     removeNodeErrorCount: 10         //10 intentos (50 minutos limite)
// });

// for (var i in conf.servers) {
//     poolCluster.remove(i);
//     poolCluster.add(i, {
//         host    : conf.servers[i].host,
//         port    : conf.servers[i].port,
//         user    : conf.servers[i].user,
//         password: conf.servers[i].pass,
//         database: conf.servers[i].dbname
//     });
// }

// poolCluster.on('enqueue', function () {
//     console.log('Esperando conexión con el servidor');
// });

// poolCluster.on('remove', function (nodeId) {
//   console.log('Error al conectar con el servidor ' + nodeId);
// });

// exports.getConnection = function(server, callback){
//     poolCluster.getConnection(server, function (err, connection){
//         callback(err, connection);
//     });
// };

// exports.check = function(){
//     poolCluster.getConnection(function (err, connection){
//         if(err)
//             console.log(err);
//     });
// };