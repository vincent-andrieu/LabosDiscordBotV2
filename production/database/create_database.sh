#!/usr/bin/env bash

check_exit_failure()
{
    if [ $? -ne 0 ]
    then
        echo "$1" 1>&2
        exit 1
    fi
}

# Deploy database to kubernetes
echo "
MONGO_INITDB_ROOT_USERNAME=${MONGODB_USERNAME}
MONGO_INITDB_ROOT_PASSWORD=${MONGODB_PASSWORD}
" > /app/database/database.env
kubectl create configmap database --from-env-file=/app/database/database.env
check_exit_failure "Fail to create database ConfigMap"
kubectl apply -f /app/database/db.deployment.yml
check_exit_failure "Fail to apply database deployment"
kubectl apply -f /app/database/db.service.yml
check_exit_failure "Fail to apply database service"