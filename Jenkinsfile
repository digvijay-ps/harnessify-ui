library identifier: 'ci-pipeline-lib@main', retriever: modernSCM([
    $class: 'GitSCMSource',
    remote: 'https://github.com/digvijay-ps/ci-pipeline-lib.git',
    credentialsId: 'github-digvijay-pat'
])
pipeline {
    agent {
        kubernetes {
            yaml dindPodTemplate()
            defaultContainer 'node'
        }
    }

    tools {
        nodejs 'NODE_JS'
    }

    parameters {
        string(name: 'GIT_BRANCH', defaultValue: 'main', description: 'Branch to build from')
        booleanParam(name: 'COMPILE', defaultValue: true, description: 'Run compile step')
        booleanParam(name: 'BUILD_DOCKER_IMAGE', defaultValue: true, description: 'Build Docker image')
        booleanParam(name: 'PUSH_DOCKER_IMAGE', defaultValue: false, description: 'Push Docker image')
        string(name: 'REPOSITORY_NAME', defaultValue: 'my-docker-repo', description: 'Docker repository name')
        string(name: 'APP_NAME', defaultValue: 'my-app', description: 'Application name')
        string(name: 'DOCKER_IMAGE_TAG', defaultValue: 'latest', description: 'Docker image tag')
    }

    stages {
        stage('Checkout') {
            steps {
                checkoutGitBranch(
                    params.GIT_BRANCH,
                    'https://github.com/digvijay-ps/harnessify-ui.git',
                    'github-digvijay-pat'
                )
            }
        }

        stage('Compile') {
            when { expression { params.COMPILE } }
            steps {
                container('node') {
                    sh 'npm install'
                }
            }
        }

        stage('Package') {
            steps {
                container('node') {
                    sh 'npm run build'
                }
            }
        }

        stage('Authenticate Docker to GAR') {
            when {
                expression { return params.PUSH_DOCKER_IMAGE }
            }
            steps {
                container('docker') {
                    withCredentials([file(credentialsId: 'gcloud-service-account', variable: 'GCP_KEY_FILE')]) {
                        sh '''
                            echo "[INFO] Verifying Docker Daemon..."
                            docker info

                            echo "[INFO] Authenticating Docker to GAR..."
                            GAR_HOST=$(echo "${REPOSITORY_NAME}" | cut -d'/' -f1)
                            cat $GCP_KEY_FILE | docker login -u _json_key --password-stdin https://$GAR_HOST
                        '''
                    }
                }
            }
        }
        stage('Docker Build & Push') {
            when { expression { params.BUILD_DOCKER_IMAGE || params.PUSH_DOCKER_IMAGE } }
            steps {
                buildAndPushDocker(
                    repository: params.REPOSITORY_NAME,
                    appName: params.APP_NAME,
                    tag: params.DOCKER_IMAGE_TAG,
                    buildImage: params.BUILD_DOCKER_IMAGE,
                    pushImage: params.PUSH_DOCKER_IMAGE
                )
            }
        }
    }
}
