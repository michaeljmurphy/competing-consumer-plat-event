# node-js-rabbitmq

This application runs a web and a worker dyno.

The worker dyno 
- subscribes to salesforce platform events using jsForce
- publishes events to a rabbitMQ MQ
- runs 3 works which subscribe to the events on the MQ in parallel
- pushes those events to the web dyno using POST requests

The web dyno
- listens to the POST requests
- emits events 
- displays the events in the browser