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

/app/kind load docker-image "localhost:5000/labosdiscordbot-client"
check_exit_failure "Fail to pull client docker image in the cluster"
/app/kind load docker-image "localhost:5000/labosdiscordbot-server"
check_exit_failure "Fail to pull server docker image in the cluster"

kubectl apply -f $JENKINS_HOME/production/client/kubernetes/client.deployment.yml
check_exit_failure "Fail to apply client deployment"
kubectl apply -f $JENKINS_HOME/production/client/kubernetes/client.service.yml
check_exit_failure "Fail to apply client service"
kubectl apply -f $JENKINS_HOME/production/server/kubernetes/server.deployment.yml
check_exit_failure "Fail to apply server deployment"