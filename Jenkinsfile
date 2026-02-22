pipeline {
  agent any

  environment {
    IMAGE_NAME = "moabdelazem/gitops-nodejs-postgres"
    COMMIT_SHORT = ""
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
            env.COMMIT_SHORT = env.GIT_COMMIT ? env.GIT_COMMIT.take(7) : sh(script: "git rev-parse --short=7 HEAD", returnStdout: true).trim()

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
