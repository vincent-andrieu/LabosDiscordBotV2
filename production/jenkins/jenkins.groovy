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