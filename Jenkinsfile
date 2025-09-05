@Library('ci-pipeline-lib') _

pipeline {
    agent none

    tools {
        nodejs 'NODE_JS'
    }

    environment {
        APP_DIR = 'react-app'
    }

    parameters {
        string(name: 'PROJECT_ID', defaultValue: 'sap-genaipscloud-dev-mg')
        string(name: 'CLUSTER_NAME', defaultValue: 'sap-genaipscloud-dev-cluster')
        string(name: 'CLUSTER_ZONE', defaultValue: 'us-central1-a')
        string(name: 'APP_NAME', defaultValue: 'mirgration-agent')
        string(name: 'DOCKER_IMAGE_TAG', defaultValue: env.BUILD_ID)
        string(name: 'REPOSITORY_NAME', defaultValue: 'us-central1-docker.pkg.dev/sap-genaipscloud-dev-mg/ui-images')
        booleanParam(name: 'BUILD_DOCKER_IMAGE', defaultValue: true)
        booleanParam(name: 'PUSH_DOCKER_IMAGE', defaultValue: true)
        booleanParam(name: 'RUN_SONARQUBE_ANALYSIS', defaultValue: false)
        booleanParam(name: 'COMPILE', defaultValue: true)
        string(name: 'GIT_BRANCH', defaultValue: 'login')
    }

    stages {
        stage('CI with DinD') {
            steps {
                dindPodTemplate {
                    stage('Checkout') {
                        checkoutGitBranch(params.GIT_BRANCH,
                                          'https://dig1@pscode.lioncloud.net/CloudDevOps/gen-ai-agents/harness-migration-agent.git',
                                          'pscode-digvijay-pat')
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
        }
    }
}
