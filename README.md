# AWS Heartbeat (Server)

> Easy Heartbeat service based on AWS Lambda &amp; DynamoDB

For client see: https://github.com/parcelLab/aws-heartbeat-client

# About

The goal of this repo is to provide a heartbeat service to monitor your services using AWS Lambda and DynamoDB.
AWS API gateway is used to return dynamoDB data in the form of a html table. It's sortable and all pulses which exceeded their threshold are marked.
The default setting has a 24h threshold and only counts Weekdays. e.g. a pulse(with a threshold of 24h) send on friday evening wont be marked as exceeded until monday evening. 
It's possible to change the settings and get automatic Slack notifications in case of an exceeded time limit.

# What is the repo content?

This repo contains AWS Lambda functions, instructions how to deploy them and how to setup the AWS API gateway. It contains 5 lambda functions:

* `pulse` handles the pulse API calls from the aws-heartbeat-client, and creates a new DynamoDB document or updates an existing one — i.e. this one receives a heartbeat.

* `dashboard` gets all hearbeats from DynamoDB and returns a sortable data table as a web page. Every pulse has a edit option to change settings.

* `monitor`: checks if any pulse exceeded his threshold. Sends error notification to Slack, if so.

* `editGet`: renders a page to edit a single heartbeat via a table with all data of the pulse.
  
* `editPost`: updates the settings for a single heartbeat in DynamoDB, and is called by `editGet`

# Setup

There are multiple steps to make this work:

1. Create a new DynamoDB table with the name `Heartbeat` and the primary partition key `_id`.

2. Create a new AWS API Gateway with a child Resource `/heartbeat`.

3. Create a IAM role with read and write access rights to DynamoDB, as this is needed for the Lambda functions to work.

4. Download this repo, go to the folder and install the dependencies with `npm install`

5. Before deploying any Lambda functions, change the `secret`, `baseUrl` and `slackWebhook` in the code. You can do so by running the prepared script:

```
./changeSettings.sh <secret> <baseUrl> <slack>
```

...where:

* `secret`: a random string of your choice, acts as a kind of password to be used in the URL to access the dashboard.
* `baseUrl`: the URL of your newly created AWS API Gateway like `https://lambda.example.com/v1/heartbeat`
* `slackWebhook`: the URL of your Slack webhook, to be set up in Slack. If you don't provide this, the monitor function won't send any notifications.

6. Deploy the Lambda functions with [Claudia](https://claudiajs.com/), which requires you to first successfully configure your AWS credentials as described here: http://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/configuring-the-jssdk.html

```  
./deployLambda.sh <region> <role>
```

...where:

* `region`: the AWS region where you want to deploy your functions, e.g. `eu-central-1`
* `role`: the access role for Lambda functions, e.g. `arn:aws:iam::123456789123:role/role_name`

7. Create 4 Child Resources and methods on the API Gateway. **Important:** For all methods, choose integration type `Lambda Function` and Lambda Proxy Intergration `yes`:

* heartbeat/dashboard: method `GET` with function `dashboard`
* heartbeat/edit: method `GET` with function `editGet`, and method `POST` with function `editPost`
* heartbeat/monitor: method `GET` with function `monitor`
* heartbeat/pulse: method `GET` with function `pulse`

8. Set cronjob for monitor function by going to [AWS Cloudwatch / Events](https://eu-central-1.console.aws.amazon.com/cloudwatch/home#rules:), and create a new rule with a schedule pattern:
  
  We recommend setting up two rules, each executing the same Lambda function, but one for working days and one for Sundays that executes the monitor less often:
  
Working days:
```
0 0,3,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20 ? * MON,TUE,WED,THU,FRI,SAT *
```

Sundays:
```
0 6,12,18 ? * SUN *
```

On the side of the target, configure the input and set a Constant (JSON text):

```
{"queryStringParameters":{"secret":"your-secret-goes-here"}}
```
