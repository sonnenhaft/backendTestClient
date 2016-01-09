var rediss = require('redis');
var redis = getRedis();
function getRedis() {
    var redis = rediss.createClient(16359, 'pub-redis-16359.eu-west-1-1.1.ec2.garantiadata.com'); //creates a new client
    redis.auth('sonnenhaft');
    return redis;
}

var socketServer = require('./node_modules/r2d2/server/vws.socket.js').server;

socketServer('example', function (connection) {
    var currentId;
    var sub = getRedis();
    var currentChannel = null;

    function updateChannel(channel) {
        if (currentChannel === channel) {return;}
        if (currentChannel) {
            sub.unsubscribe(currentChannel);
        }
        currentChannel = channel;
        console.log(channel)
        redis.lrange(currentChannel, 0, -1, function (err, reply) {
            console.log(reply)
            connection.send(JSON.stringify(reply));
        });
        sub.subscribe(currentChannel);
    }

    connection.on('open', function (id) {
        currentId = id;
        sub.on('message', function (channel, message) {
            var messageID = JSON.parse(message).id;
            if (messageID !== id) {
                return connection.send(message);
            }
        });

    }).on('message', function (msg) {
        var message = JSON.parse(msg.utf8Data);
        var data = message.action.data[0];
        data.timestamp = Date.now();
        updateChannel(data.channel);
        if (data.text) {
            message = JSON.stringify(message);
            redis.publish(currentChannel, message);
            redis.lpush(currentChannel, message);
        }
    }).on('error', function (err) {
        console.log(err);
    }).on('close', function () {
        console.log('connection closed');
    });
}).config({port: process.argv[2] || 2020});
