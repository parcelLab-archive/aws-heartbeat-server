# AWS Heartbeat (Server)

> Easy Heartbeat service based on AWS Lambda &amp; DynamoDB

For client see: https://github.com/parcelLab/aws-heartbeat-client

# About

The goal of this repo is to provide a heartbeat service to monitor your services using AWS Lambda and DynamoDB.
AWS API gateway is used to return dynamoDB data in the form of a html table. It's sortable and all pulses which exceeded their threshold are marked.
The default setting has a 24h threshold and only counts Weekdays. e.g. a pulse(with a threshold of 24h) send on friday evening wont be marked as exceeded until monday evening. 
It's possible to change the settings and get automatic Slack notifications in case of an exceeded time limit.

# What is the repo content?

This repo contains AWS Lambda functions, instructions how to deploy them and how to setup the AWS API gateway.<br/>
It contains 5 lambda functions:
1. pulse
  * handles the pulse api call from the aws-heartbeat-client. Creates a new dynamoDB entry or updates an existing one.
2. dashboard 
  * gets all pulse data from dynamoDb and returns a sortable datatable to the api. Every pulse has a edit option to change settings
3. monitor
  * checks if any pulse exceeded his threshold. Sends error notification to Slack
4. editGet
  * gets a single pulse from dynamoDB and returns a table with all data to the api
5. editPost
  * updates the settings for a single pulse in dynamoDB 



# Setup

There are multiple steps to make this work.
1. Create a new DynamoDB table
    * Table name: Heartbeat
    * Primary partition key: _id
2. Create a new AWS API Gateway
    * Create Child Resource: /heartbeat
3. Create a IAM role with read and write access rights to DynamoDB
    *  This is needed for the lambda functions to work
4. Install dependencies
```
npm install
```
5. Before deploying lambda functions - change secret, baseUrl and slack in code
  * Run the script changeSettings - need three arguments
    * Secret: A random string of your choice
    * BaseUrl: The created AWS API Gateway url like: https://www.example.com/api/baseUrl/heartbeat
    * Slack Webhook: The slack url to your account
      * If not provided, monitor function wont send any notifications
    ```
    //Run this script before deploying the functions
    ./changeSettings.sh <secret> <baseUrl> <slack>
    ```
6. Deploy lambda functions with claudia.js
  * Configure AWS credentials : http://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/configuring-the-jssdk.html
    * Run the script deployLambda - needs two arguments
    * Region: the aws region where you want to deploy your functions e.g. eu-central-1 
    * Role: the access role for lambda functions e.g.  arn:aws:iam::123456789123:role/role_name
    ```  
    ./deployLambda.sh <region> <role>
    ```
7. Create 4 Child Resources and methods:
  * **Important:** For all methods - 
    * Integration type: Lambda Function
    * Use Lambda Proxy Intergration : yes
  * heartbeat/dashboard
    * method GET - function dashboard
  * heartbeat/edit
    * method GET - function editGet
    * method POST - function editPost
  * heartbeat/monitor
    * method GET - function monitor
  * heartbeat/pulse
    * method GET - function pulse
8. Set cronjob for monitor function
  * Go to AWS Cloudwatch
  * Events - Create a rule
  * Use the schedule pattern

