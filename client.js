(function ($) {
    var codeTest = {
        config: {
            server: '127.0.0.1:2020'
        },
        nickName: 'person1',
        channel: 'defaultChannel',
        client: null
    };

    function drawMessage(data) {
        var msgString = '<span>{' + data.channel + '@' + data.timestamp + '} [' + data.author + '] ' + data.text + '</span><br/>';
        $('#messages').append(msgString).scrollTop($('#messages')[0].scrollHeight);
    }

    $(document).ready((function ($) {
        $('#sendMsg').click(function () {
            sendMsg($('#message').val());
        });

        $('#setNick').click(function setNick() {
            var nick = $('#nickname').val();
            codeTest.nickName = nick;
            drawMessage({author: 'system', channel: codeTest.channel, text: 'greetings, ' + nick + '!', timestamp: new Date().toLocaleTimeString()});
            return codeTest.nickName;
        });

        var oldChannel;
        $('#joinChannel').click(function joinChannel() {
            var channel = $('#channel').val();
            //if (channel === oldChannel){return};
            oldChannel = channel;
            $('#messages').empty();
            codeTest.channel = channel;
            drawMessage({
                author: 'system',
                channel: codeTest.channel,
                text: 'welcome to a new channel (' + channel + '), ' + codeTest.nickName, timestamp: new Date().toLocaleTimeString()
            });
            sendMsg(null, true);
            return codeTest.channel;
        });

        var port = location.hash;
        if (port) {
            port = port.replace('#', '');
        }  else {
            port = 2020;
        }
        $('#serverUrl').val('127.0.0.1:' + port)

        $('#connect').click(function () {
                if (typeof codeTest.client !== null) {
                    delete codeTest.client;
                }
                codeTest.config.server = $('#serverUrl').val();
                codeTest.client = setupSocket();
            }
        );
        $('#connect').click();
    }));

    function sendMsg(text, switchChannel) {
        var data = {
            author: codeTest.nickName,
            channel: codeTest.channel,
            text: text,
            switchChannel: switchChannel
        };
        drawMessage({author: 'YOU', channel: data.channel, text: data.text, timestamp: new Date().toLocaleTimeString()});
        return send2server('msg', data);
    }

    function send2server(command, data) {
        return codeTest.client.send({
            command: command,
            data: [
                {
                    author: codeTest.nickName,
                    channel: codeTest.channel,
                    text: data.text
                }
            ]
        });
    }

    function setupSocket() {
        try {
            var testSocket = new Socket(codeTest.config.server, {autoReconnect: true});
            testSocket.on('reconnect', function (msg, e) {
                console.log('reconnected');
            });
            testSocket.on('close', function (e) {
                console.log('[close]');
                $('#wsstatus').text(Date.now() + ' connection closed');
            });
            testSocket.on('error', function (e) {
                console.log('[error]');
                $('#wsstatus').text(Date.now() + ' connection error');
            });
            var opened = false;
            testSocket.on('open', function (e) {
                if (opened) {return}
                opened = true;
                $('#joinChannel').click();
                $('#wsstatus').text(Date.now() + ' connection open');
                function draw(a) {
                    drawMessage({author: a.author, channel: a.channel, text: a.text, timestamp: new Date(a.timestamp).toLocaleTimeString()});
                }

                testSocket.on('message', function (msg, e) {
                    console.log(msg)
                    if (Array.isArray(msg)) {
                        msg.reverse().forEach(function (i) {
                            draw(JSON.parse(i).action.data[0]);
                        });
                        draw({author: 'system', channel: codeTest.channel, text: '********welcome to the test*********', timestamp: new Date()});
                    } else {
                        console.log('[message]');
                        draw(msg.action.data[0]);
                    }
                    handleMessageFromServer(msg);
                });
            });
            $('#wsstatus').text(Date.now() + ' connecting to [' + codeTest.config.server + ']');
        } catch (err) {
            $('#wsstatus').text(Date.now() + ' connection failed: ' + err);
        }
        return testSocket;
    }

    function handleMessageFromServer(msg) {
        if (typeof msg.command === 'undefined' || typeof msg.data === 'undefined') { return;}
        if (msg.command !== 'messages') { return;}
        for (var n = 0; n < msg.data; n += 1) {
            drawMessage(msg.data[n]);
        }
    }
})(window.jQuery);
