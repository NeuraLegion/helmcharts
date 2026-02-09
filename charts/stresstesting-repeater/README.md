# Stress Test Repeater Helm Chart

This Helm chart deploys a Bright Security CLI repeater for stress testing purposes.

## Overview

The Bright Security Stress Test Repeater runs the `brightsec/cli` Docker container with the repeater mode enabled. This allows you to run stress tests through a dedicated bridge/repeater.

## Prerequisites

- Kubernetes cluster
- Helm 3.x
- GitHub token for accessing the helm repository
- Bright Security API token
- Repeater ID (obtained from Bright Security API)

## Installation

### From Helm Repository

```bash
# Add the helm repository
helm repo add vulnerable-apps https://neuralegion.github.io/helmcharts/ \
  --username $TOKEN_GITHUB \
  --password $TOKEN_GITHUB

# Update helm repositories
helm repo update

# Install the chart
helm install stresstesting-repeater vulnerable-apps/stresstesting-repeater \
  --namespace distributor \
  --set id="your-repeater-id" \
  --set token="your-api-token" \
  --set cluster=https://development.playground.brightsec.com
```

### From Local Chart

```bash
helm install stresstesting-repeater ./charts/stresstesting-repeater \
  --namespace distributor \
  --set id=<your-repeater-id> \
  --set token=<your-api-token> \
  --set cluster=https://development.playground.brightsec.com
```

## Configuration

### Required Parameters

| Parameter | Description | Example |
|-----------|-------------|---------|
| `id` | Repeater/Bridge ID | `cNrAY3nw5CUYhsoXvTXfEz` |
| `token` | Bright Security API token | `nu****.nexa.************vth6` |
| `cluster` | Bright Security cluster URL | `https://development.playground.brightsec.com` |

### Optional Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `timeout` | Connection timeout in milliseconds | `30000` |
| `resources.requests.cpu` | CPU request for the pod | `100m` |
| `resources.limits.cpu` | CPU limit for the pod | `500m` |
| `resources.requests.memory` | Memory request for the pod | `128Mi` |
| `resources.limits.memory` | Memory limit for the pod | `512Mi` |
| `replicaCount` | Number of pod replicas | `1` |
| `image.repository` | Container image repository | `brightsec/cli` |
| `image.tag` | Container image tag | `latest` |
| `image.pullPolicy` | Image pull policy | `IfNotPresent` |

## Usage Examples

### Standard Installation

```bash
helm upgrade stresstesting-repeater vulnerable-apps/stresstesting-repeater \
  --install \
  --namespace distributor \
  --set id=rep_123456 \
  --set token=api.neuralegion.com.xyz \
  --set cluster=https://development.playground.brightsec.com \
  --wait
```

### High-Resource Installation

```bash
helm upgrade stresstesting-repeater vulnerable-apps/stresstesting-repeater \
  --install \
  --namespace distributor \
  --set id=rep_123456 \
  --set token=api.neuralegion.com.xyz \
  --set cluster=https://development.playground.brightsec.com \
  --set resources.requests.cpu=500m \
  --set resources.limits.cpu=2000m \
  --set resources.requests.memory=512Mi \
  --set resources.limits.memory=2Gi \
  --wait
```

## Verification

Check the status of the repeater:

```bash
# Check pod status
kubectl get pods -n distributor -l app.kubernetes.io/name=stresstesting-repeater

# View logs
export POD_NAME=$(kubectl get pods -n distributor -l app.kubernetes.io/name=stresstesting-repeater -o jsonpath="{.items[0].metadata.name}")
kubectl logs -n distributor $POD_NAME -f
```

## Uninstallation

```bash
helm uninstall stresstesting-repeater --namespace distributor
```

## How It Works

The helm chart creates a Kubernetes Deployment that runs the `brightsec/cli` container with the following command:

```bash
bright-cli repeater --token <TOKEN> --id <ID> --cluster <CLUSTER> --timeout <TIMEOUT> --log-level=verbose
```

This establishes a connection to the Bright Security platform and allows it to proxy stress test requests through this repeater.

## Troubleshooting

### Pod Not Starting

Check the pod events:
```bash
kubectl describe pod -n distributor -l app.kubernetes.io/name=stresstesting-repeater
```

### Authentication Issues

Verify that your API token is correct and has the necessary permissions:
```bash
kubectl logs -n distributor -l app.kubernetes.io/name=stresstesting-repeater
```

### Resource Constraints

If the pod is being evicted or failing due to resource constraints, increase the resource limits:
```bash
helm upgrade stresstesting-repeater vulnerable-apps/stresstesting-repeater \
  --reuse-values \
  --set resources.limits.cpu=1000m \
  --set resources.limits.memory=1Gi
```

## Development

### Testing the Chart Locally

```bash
# Lint the chart
helm lint charts/stresstesting-repeater

# Package the chart
helm package charts/stresstesting-repeater

# Test rendering
helm template test charts/stresstesting-repeater \
  --set id=test-id \
  --set token=test-token \
  --set cluster=https://test.example.com

# Install locally
helm install test-release charts/stresstesting-repeater \
  --namespace test \
  --create-namespace \
  --set id=test-id \
  --set token=test-token \
  --set cluster=https://test.example.com
```

## Architecture

This chart uses the unified repeater container pattern from the vulnerable-apps helmcharts repository, ensuring consistency across all charts that deploy Bright Security repeaters.

## License

Copyright © 2026 Bright Security
