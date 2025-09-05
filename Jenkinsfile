library identifier: 'ci-pipeline-lib@main', retriever: modernSCM([
    $class: 'GitSCMSource',
    remote: 'https://github.com/digvijay-ps/example-repo.git',
    credentialsId: 'github-digvijay-pat'
])

pipeline {
    agent none

    tools {
        nodejs 'NODE_JS'
    }

    stages {
        stage('Checkout') {
            agent dindPodTemplate()
            steps {
                checkoutGitBranch(params.GIT_BRANCH,
                                  'https://github.com/digvijay-ps/harnessify-ui.git',
                                  'github-digvijay-pat')
            }
        }

        stage('Compile') {
            agent dindPodTemplate()
            when { expression { params.COMPILE } }
            steps {
                container('node') {
                    sh 'npm install'
                }
            }
        }

        stage('Package') {
            agent dindPodTemplate()
            steps {
                container('node') {
                    sh 'npm run build'
                }
            }
        }

        stage('Docker Build & Push') {
            agent dindPodTemplate()
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
