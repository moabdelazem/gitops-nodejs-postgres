pipeline {
  agent any

  environment {
    IMAGE_NAME = "moabdelazem/gitops-nodejs-postgres"
    COMMIT_SHORT = "${env.GIT_COMMIT.substring(0, 7)}-${env.BUILD_NUMBER}"
  }

  stages {
    stage("Audit The Codebase") {
      steps {
        dir('app') {
          sh """
            grype . --fail-on medium
          """
        }
      }
    }

    stage('Build The Docker Image') {
      steps {
        dir('app') {
          script {
            sh """
              docker build \\
                -t ${env.IMAGE_NAME}:latest \\
                -t ${env.IMAGE_NAME}:${env.COMMIT_SHORT} \\
                .
            """
          }
        }
      }
    }

    stage("Audit The Docker Image") {
      steps {
        sh """
          grype ${env.IMAGE_NAME}:latest --fail-on critical
        """
      }
    }

    stage('Push The Docker Image') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', usernameVariable: 'DOCKERHUB_USERNAME', passwordVariable: 'DOCKERHUB_PASSWORD')]) {
          sh """
            echo $DOCKERHUB_PASSWORD | docker login -u $DOCKERHUB_USERNAME --password-stdin
            docker push ${env.IMAGE_NAME}:latest
            docker push ${env.IMAGE_NAME}:${env.COMMIT_SHORT}
          """
        }
      }
    }
  }
}
