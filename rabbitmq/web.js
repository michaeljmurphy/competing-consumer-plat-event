const express = require('express')
const EventEmitter = require('events');

const app = express()
const port = process.env.PORT || 5656;
var q = 'tasks';
var url = process.env.CLOUDAMQP_URL || "amqp://localhost";
var open = require('amqplib').connect(url);
var path = require('path');
var body

app.get('/', (req, res) => {
    res.sendFile('index.html', {
        root: path.join(__dirname, './')
    })
});

const Stream = new EventEmitter();



app.use(express.json());
app.post('/events', function(req, res) {
    res.writeHead(200, { "Content-Type": "application/json",
                         "Cache-control": "no-cache" });
    console.log("message received!!!");
    console.dir(req.body);
    res.write("{\"response\" : \"true\"}");
    
    Stream.emit("push", { msg: req.body });
    // Stream.emit("push", "test", { msg: "admit one" });
});

app.get('/msg', function(req, res) {
    res.writeHead(200, { "Content-Type": "text/event-stream",
                         "Cache-control": "no-cache",
                         'Connection': 'keep-alive'});
    //console.dir(req);

    Stream.on("push", function(event, data) {
        console.log("push");
        console.dir(data);
        console.dir(event);
        res.write("data: " + JSON.stringify(event) +"\n\n");
    });
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
