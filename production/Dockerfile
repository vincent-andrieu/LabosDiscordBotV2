FROM jenkins/jenkins:lts

WORKDIR /app

USER root
RUN apt-get update

# Install docker
RUN apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release
RUN curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
RUN echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian \
    $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
RUN apt-get update
RUN apt-get install -y docker-ce docker-ce-cli containerd.io

# Setup jenkins
ENV JENKINS_HOME /home
ENV JENKINS_OPTS --httpPort=4242
ENV JAVA_OPTS -Djenkins.install.runSetupWizard=false
ENV CASC_JENKINS_CONFIG /var/jenkins_home/jenkins.yaml

COPY jenkins/jenkins.yml ${JENKINS_HOME}/jenkins.yaml
COPY jenkins/jenkins.groovy ${JENKINS_HOME}/job_dsl/jenkins.groovy

RUN /usr/local/bin/install-plugins.sh cloudbees-folder configuration-as-code credentials github job-dsl script-security structs role-strategy ws-cleanup parameterized-trigger

# Install kubernetes
## Install kubectl
RUN apt-get install -y apt-transport-https
RUN curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | apt-key add -
RUN echo "deb https://apt.kubernetes.io/ kubernetes-xenial main" | tee -a /etc/apt/sources.list.d/kubernetes.list
RUN apt-get update
RUN apt-get install -y kubectl
## Install kind
RUN curl -Lo ./kind "https://kind.sigs.k8s.io/dl/v0.11.1/kind-$(uname)-amd64"
RUN chmod +x ./kind

## Create kubernetes cluster
RUN /app/kind create cluster

# END
COPY run.sh /app/