var q = 'tasks';

var url = process.env.CLOUDAMQP_URL || "amqp://localhost";
var api = process.env.API_URL || "https://localhost";
var username = process.env.SF_USERNAME;
var password = process.env.SF_PASSWORD;
var channel = process.env.SF_CHANNEL;


var open = require('amqplib').connect(url);
var jsforce = require('jsforce');
var async = require('async');
var request = require('request');


// // 3 consumers
async.parallel([
    function worker1 () {
        open.then(function(mq_conn) {
            var ok = mq_conn.createChannel();
            ok = ok.then(function(ch) {
                ch.assertQueue(q);
                ch.consume(q, function(msg) {
                    if (msg !== null) {
                        console.log("Worker 1: " + msg.content.toString());
                        doPost("{ \"worker\" : \"1\", \"body\" : " + msg.content.toString() + " } ");
                        ch.ack(msg);
                    }
                }, {
                    noAck: false 
                });
            });
            return ok;
        }).then(null, console.warn)
    },
    function worker2() {
        open.then(function(mq_conn) {
            var ok = mq_conn.createChannel();
            ok = ok.then(function(ch) {
                ch.assertQueue(q);
                ch.consume(q, function(msg) {
                    if (msg !== null) {
                        console.log("Worker 2: " + msg.content.toString());
                        doPost("{ \"worker\" : \"2\", \"body\" : " + msg.content.toString() + " } ");
                        ch.ack(msg);
                    }
                }, {
                    noAck: false 
                });
            });
            return ok;
        }).then(null, console.warn)
    },
    function worker3() {
        open.then(function(mq_conn) {
            var ok = mq_conn.createChannel();
            ok = ok.then(function(ch) {
                ch.assertQueue(q);
                ch.consume(q, function(msg) {
                    if (msg !== null) {
                        console.log("Worker 3: " + msg.content.toString());
                        doPost("{ \"worker\" : \"3\", \"body\" :  " + msg.content.toString() + " } ");
                        ch.ack(msg);
                    }
                }, {
                    noAck: false 
                });
            });
            return ok;
        }).then(null, console.warn)
    }
]);

function doPost(msg) {
    console.log("do post");
    console.dir(msg);
    request.post(
        api + '/events',
        { json: JSON.parse(msg) },
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log(body);
            } else {
                console.log("error");
                console.dir(error);
            }
        }
    );
}

// Publisher
open.then(function(mq_conn) {
    var ok = mq_conn.createChannel();
    ok = ok.then(function(ch) {
        ch.assertQueue(q, {
            durable: true
        });

        var conn = new jsforce.Connection({
            loginUrl : 'https://test.salesforce.com'
        });


        console.log(username);
        console.log(password);
        console.log(channel);

        conn.login(username, password, function(err, userInfo) {
            if (err) { return console.error(err); }

            // Now you can get the access token and instance URL information.
            // Save them to establish connection next time.
            console.log(conn.accessToken);
            console.log(conn.instanceUrl);

            // logged in user property
            console.log("User ID: " + userInfo.id);
            console.log("Org ID: " + userInfo.organizationId);

            conn.streaming.topic(channel).subscribe(function(message) {
                console.log("Message sent: ");
                console.dir(message);

                ch.sendToQueue(q, new Buffer(JSON.stringify(message), {
                    persistent: true
                }));
            });
        });
    });
    return ok;
}).then(null, console.warn);
