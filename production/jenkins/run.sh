#!/usr/bin/env bash

check_exit_failure()
{
    if [ $? -ne 0 ]
    then
        echo "$1" 1>&2
        exit 1
    fi
}

# Build project
npm run deploy
check_exit_failure "Fail to build app"

# Build docker images
docker build -t localhost:5000/labosdiscordbot:client production/client
check_exit_failure "Fail to build client"
docker build -t localhost:5000/labosdiscordbot:server production/server
check_exit_failure "Fail to build server"

# Push docker images in the docker registry
docker push localhost:5000/labosdiscordbot:client
check_exit_failure "Fail to push client"
docker push localhost:5000/labosdiscordbot:server
check_exit_failure "Fail to push server"

# Pull docker images in the cluster
kind load docker-image --name labosdiscordbot "localhost:5000/labosdiscordbot:client"
check_exit_failure "Fail to pull client docker image in the cluster"
kind load docker-image --name labosdiscordbot "localhost:5000/labosdiscordbot:server"
check_exit_failure "Fail to pull server docker image in the cluster"

# Deploy kubernetes
## Apply client
kubectl apply -f production/client/kubernetes/
check_exit_failure "Fail to apply client"
## Apply server
echo "
DISCORD_BOT_TOKEN=${DISCORD_BOT_TOKEN}
DISCORD_BOT_CLIENT_ID=${DISCORD_BOT_CLIENT_ID}
DISCORD_BOT_CLIENT_SECRET=${DISCORD_BOT_CLIENT_SECRET}
" > /app/server.env
echo "Delete old ConfigMap"
kubectl delete configmap server
kubectl create configmap server --from-env-file=/app/server.env
check_exit_failure "Fail to create server ConfigMap"
kubectl apply -f production/server/kubernetes/
check_exit_failure "Fail to apply server"