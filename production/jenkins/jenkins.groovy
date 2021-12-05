job("Project") {
    scm {
        git {
            remote {
                github("$GIT_REPOSITORY_URL", 'ssh')
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