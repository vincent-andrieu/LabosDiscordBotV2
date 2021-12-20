job('Create cluster') {
    steps {
        shell('kind create cluster --name labosdiscordbot --config=/app/LabosDiscordBot.cluster.yml')
    }
    steps {
        shell('/app/database/create_database.sh')
    }
}

job("Project") {
    scm {
        git {
            remote {
                github("$GIT_REPOSITORY_URL")
                branch("zero-down-time")
            }
        }
    }
    triggers {
        pollSCM {
            scmpoll_spec('* * * * *')
        }
    }
    steps {
        shell('/app/run.sh')
    }
}