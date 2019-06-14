# Challenge

How to distribute platform events to n elastically scaled vms


# Solution

* Platform Events published to channel by Salesforce
* Heroku dyno subscribes to plat event on SF using JSForce.
* Heroku message transfer from Platform Events to RabbitMQ
* NodeJS consumers compete for work on the MQ
    

## RabbitMQ on Heroku
https://elements.heroku.com/addons/cloudamqp

## Competing Consumers Pattern
https://www.rabbitmq.com/tutorials/tutorial-two-javascript.html

## JSForce
https://jsforce.github.io/document/


# Proof of Concept
![architecture](https://github.com/michaeljmurphy/competing-consumer-plat-event/blob/master/Heroku%20RabbitMQ%20(2).png?raw=true)

# Result
Workers compete to execute the platform events, no work is duplicated
![result](https://github.com/michaeljmurphy/competing-consumer-plat-event/blob/master/Screen%20Shot%202019-06-14%20at%2011.56.29.png?raw=true)
