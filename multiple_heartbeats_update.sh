#!/bin/bash 
for appId in $(aws dynamodb scan --table-name Heartbeat  --query "Items[*].[_id.S]" --filter-expression "thresholdF = :threshold" --expression-attribute-values '{":threshold":{"S":"24"}}' --output text);
do
    echo "start updating $appId"
    aws dynamodb update-item \
        --table-name Heartbeat \
        --key "{\"_id\":{\"S\":\"${appId//[$'\t\r\n ']}\"}}"  \
        --update-expression "SET thresholdF = :threshold" \
        --expression-attribute-values '{":threshold": {"S": "25"}}' \
        --return-values ALL_NEW  > /dev/null   
    echo "completed $appId"         
done    