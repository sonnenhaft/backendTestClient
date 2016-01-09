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
        redis.lrange(currentChannel, 0, -1, function (err, reply) {
            connection.send(JSON.stringify(reply));
        });
        sub.subscribe(currentChannel);
    }

    connection.on('open', function (id) {
        currentId = id;
        sub.on('message', function (channel, message) {
            // using this pub sub, I'm synchronizing data between clients of same channel
            // as because it is on redis side, we don't care number of servers, that are connected
            // to reddis (ofcourse we exclude reddis connections limitations in here)
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
            // Here we are publishing event with channel name
            // this was the easiest way to sync clients that may belong to different servers
            redis.publish(currentChannel, message);

            // Here we add element to "array" with channel name inside the redis
            redis.lpush(currentChannel, message);
        }
    }).on('error', function (err) {
        console.log(err);
    }).on('close', function () {
        console.log('connection closed');
    });
}).config({port: process.argv[2] || 2020});
