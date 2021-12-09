#!/usr/bin/env bash

check_exit_failure()
{
    if [ $? -ne 0 ]
    then
        echo "$1" 1>&2
        exit 1
    fi
}

npm run deploy
check_exit_failure "Fail to deploy app"

docker build -t labosdiscordbot-client production/client
check_exit_failure "Fail to build client"

docker build -t labosdiscordbot-server production/server
check_exit_failure "Fail to build server"

docker tag labosdiscordbot-client localhost:5000/labosdiscordbot-client
docker push localhost:5000/labosdiscordbot-client
check_exit_failure "Fail to push client"

docker tag labosdiscordbot-server localhost:5000/labosdiscordbot-server
docker push localhost:5000/labosdiscordbot-server
check_exit_failure "Fail to push server"

/app/kind load docker-image --name labosdiscordbot "localhost:5000/labosdiscordbot-client"
check_exit_failure "Fail to pull client docker image in the cluster"
/app/kind load docker-image --name labosdiscordbot "localhost:5000/labosdiscordbot-server"
check_exit_failure "Fail to pull server docker image in the cluster"

kubectl apply -f production/client/kubernetes/client.deployment.yml
check_exit_failure "Fail to apply client deployment"
kubectl apply -f production/client/kubernetes/client.service.yml
check_exit_failure "Fail to apply client service"
echo "
DISCORD_BOT_TOKEN=${DISCORD_BOT_TOKEN}
DISCORD_BOT_CLIENT_ID=${DISCORD_BOT_CLIENT_ID}
DISCORD_BOT_CLIENT_SECRET=${DISCORD_BOT_CLIENT_SECRET}
" > /app/server.env
kubectl create configmap server-configmap --from-env-file=/app/server.env
check_exit_failure "Fail to apply server ConfigMap"
kubectl apply -f production/server/kubernetes/server.deployment.yml
check_exit_failure "Fail to apply server deployment"