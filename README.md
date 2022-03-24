# AWS Heartbeat (Server)

> Easy Heartbeat service based on AWS Lambda &amp; Zelda

For client see: https://github.com/parcelLab/aws-heartbeat-client

# About

The goal of this repo is to provide a heartbeat service to monitor your services using AWS Lambda, which uses GraphQL as an API to report to Zelda.
The default setting has a 24h threshold and only counts Weekdays. e.g. a pulse(with a threshold of 24h) send on friday evening wont be marked as exceeded until monday evening.
It's possible to change the settings and get automatic notifications in case of an exceeded time limit.

# What is the repo content?

This repo contains the pulse Lambda, instructions how to deploy it.

- `pulse` handles the pulse API calls from the aws-heartbeat-client, and creates a new Heartbeat in Zelda or updates an existing one — i.e. this one receives a heartbeat.

# Deploy

```
zip -r pulse.zip .
```

```
aws lambda update-function-code --function-name pulse --zip-file fileb://pulse.zip
```
