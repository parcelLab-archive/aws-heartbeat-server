#!/bin/bash


claudia create --region $1 --handler dashboard.handler --no-optional-dependencies --role $2 --source dashboard/
claudia create --region $1 --handler editget.handler --no-optional-dependencies --role $2 --source edit/get/
claudia create --region $1 --handler editpost.handler --no-optional-dependencies --role $2 --source edit/post/
mkdir -p ./monitor/node_modules
npm install -prefix ./monitor
claudia create --region $1 --handler monitor.handler --no-optional-dependencies --role $2 --source monitor/
claudia create --region $1 --handler pulse.handler --no-optional-dependencies --role $2 --source pulse/
echo Done deploying! 


