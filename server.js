var config = require('./node_modules/r2d2/examples/app/config');
var socketServer = require('./node_modules/r2d2/server/vws.socket.js').server;

socketServer('example', function (connection, server) {

    connection.on('open', function (id) {
        console.log('[open]');
    });

    connection.on('message', function (msg) {
        console.log('[message]');
        console.log(msg);
        connection.send(msg.utf8Data);
    });

    connection.on('error', function (err) {
        console.log(err);
    });

    connection.on('close', function () {
        // console.log('[close]');
    });

}).config(config);