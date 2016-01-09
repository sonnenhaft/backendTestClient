var redis = require('redis');
var redis = redis.createClient(16359, 'pub-redis-16359.eu-west-1-1.1.ec2.garantiadata.com'); //creates a new client
redis.auth('sonnenhaft');

var config = require('./node_modules/r2d2/examples/app/config');
var socketServer = require('./node_modules/r2d2/server/vws.socket.js').server;

var ids = [];
socketServer('example', function (connection, server) {
    var currentId;
    connection.on('open', function (id) {
        redis.lrange('serverchannel1', 0, -1, function (err, reply) {
            connection.send(JSON.stringify(reply));
            ids.push(id);
        });
        currentId = id;
    }).on('message', function (msg) {
        var message = JSON.parse(msg.utf8Data);
        var data = message.action.data[0];
        data.timestamp = Date.now();
        redis.lpush('serverchannel1', JSON.stringify(message));
        var connections = server.connections;
        Object.keys(connections).forEach(function (key) {
            if (currentId == key) {return;}
            connections[key].send(JSON.stringify(message));
        });
        //server.send(message, ids);
    }).on('error', function (err) {
        console.log(err);
    }).on('close', function () {
        ids.splice(ids.indexOf(id), 1);
    });
}).config(config);