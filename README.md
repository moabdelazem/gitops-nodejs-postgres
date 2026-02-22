# TypeScript + Express GitOps Application Deployment

## Challenges

### Main Challenges

| Challenge                                                                  | Status  | Artifacts                                                                                                                                                              |
| -------------------------------------------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dockerfile that builds the app and keeps it lightweight                    | Done    | [`app/Dockerfile`](app/Dockerfile)                                                                                                                                     |
| Pipeline job (`Jenkinsfile`) to build and push Docker image                | Pending | `TBD`                                                                                                                                                                  |
| Docker Compose file with app + Postgres for local run                      | Done    | [`docker-compose.yml`](docker-compose.yml), [`app/docker-compose.yml`](app/docker-compose.yml)                                                                         |
| Helm manifests for Kubernetes deployment (HA, persistence, public service) | Pending | `TBD`                                                                                                                                                                  |
| Autoscaling manifest for replicas                                          | Pending | `TBD`                                                                                                                                                                  |
| Argo CD app pointing to Helm manifests                                     | Pending | `TBD`                                                                                                                                                                  |
| Manage Kubernetes secrets using Sealed Secrets                             | Pending | `TBD`                                                                                                                                                                  |
| Fix API bug found during testing                                           | Done    | [`app/scripts/test-items-api.sh`](app/scripts/test-items-api.sh), [`app/src/middlewares/error-handler.middleware.ts`](app/src/middlewares/error-handler.middleware.ts) |
| Harden container security                                                  | Done    | [`app/Dockerfile`](app/Dockerfile) (distroless runtime)                                                                                                                |

## Deployment Instructions

### Prerequisites

Note: This project is tested against Kubernetes v1.31 (Minikube and AWS EKS).

#### In-Cluster Prerequisites

| Tool/Service    | Purpose                                 | Notes                                                                                                    |
| --------------- | --------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Load Balancer   | Expose ingress traffic                  | On EKS, AWS ALB is typically available by default. On on-prem/test clusters, `MetalLB` is a good option. |
| Argo CD         | Handle the CD phase                     | GitOps controller for syncing manifests.                                                                 |
| Sealed Secrets  | Manage Kubernetes secrets safely in Git | Encrypts secret manifests before commit.                                                                 |
| Metrics Server  | Enable Horizontal Pod Autoscaling       | Required for HPA metrics.                                                                                |
| HAProxy Ingress | Expose the application externally       | Ingress controller for external routing through the load balancer.                                       |

#### Client Prerequisites

| Tool     | Purpose                                    |
| -------- | ------------------------------------------ |
| Docker   | Build and run containers                   |
| Helm     | Package and deploy Kubernetes resources    |
| kubeseal | Create encrypted values for Sealed Secrets |

#### Machine-Independent Prerequisites

| Requirement                          | Purpose                                              |
| ------------------------------------ | ---------------------------------------------------- |
| Docker Hub account                   | Push built images to a registry from the CI pipeline |
| Jenkins server with Docker installed | Run CI stages and execute Docker build/push commands |

> Note: I preferred using a full VM for the Jenkins server so all required CI tools are installed in one place. This is not a production solution.
