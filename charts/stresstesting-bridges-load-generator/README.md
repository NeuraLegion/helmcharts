# Stress Testing Bridges Load Generator

Helm chart for deploying the Bright Security Stress Test Bridges Load Generator. This chart runs a Locust-based load testing tool designed to stress test bridge/repeater infrastructure with configurable behavioral patterns and resource allocations.

## Overview

The Load Generator creates stress tests by spawning multiple scan instances with configurable concurrency, ramp-up rates, and behavioral patterns. It uses Locust to orchestrate the load testing and provides a web UI for monitoring test progress.

## Prerequisites

- Kubernetes 1.19+
- Helm 3.0+
- Access to AWS ECR (for pulling the container image)
- Base64-encoded kubeconfig for the target cluster

## Installation

### Basic Installation

```bash
helm install my-load-generator ./stresstesting-bridges-load-generator \
  --set kubeconfigYaml="<base64-encoded-kubeconfig>" \
  --set proxy.url="https://your-proxy-url.com" \
  --set loadTest.maxScans="100" \
  --set loadTest.duration="10"
```

### Installation with Custom Values

Create a `custom-values.yaml` file:

```yaml
kubeconfigYaml: "LS0tLS1CRUdJTi..." # base64-encoded kubeconfig

loadTest:
  maxScans: "200"
  rampup: "5"
  duration: "30"
  concurrency: "20"

proxy:
  url: "https://your-proxy.example.com"
  skipProxy: "false"

cluster: "https://production.brightsec.com"
behavioralPattern: "fast"
repeatersStrategy: "single-repeater-for-all-scans"

repeater:
  resources:
    requests:
      cpu: "200m"
      memory: "256Mi"
    limits:
      cpu: "1000m"
      memory: "1Gi"
```

Then install:

```bash
helm install my-load-generator ./stresstesting-bridges-load-generator -f custom-values.yaml
```

### Installation with Public HTTPS Access

To expose the Locust Web UI publicly with TLS termination:

```bash
helm install my-load-generator ./stresstesting-bridges-load-generator \
  --set kubeconfigYaml="<base64-encoded-kubeconfig>" \
  --set proxy.url="https://your-proxy-url.com" \
  --set ingress.enabled=true \
  --set ingress.url="load-test.example.com"
```

This will configure an Ingress with automatic TLS certificate provisioning via Let's Encrypt. Access the Web UI at: `https://load-test.example.com`

## Configuration

### Load Test Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `loadTest.maxScans` | Maximum number of concurrent scans (Locust users) | `"100"` |
| `loadTest.rampup` | Scans per second to add (calculated if not set) | `""` |
| `loadTest.duration` | Test duration in minutes | `"10"` |
| `loadTest.concurrency` | Concurrent requests per scan | `"10"` |

### Proxy Configuration

| Parameter | Description | Default |
|-----------|-------------|---------|
| `proxy.url` | Proxy URL (required) | `""` |
| `proxy.skipProxy` | Skip proxy usage | `"false"` |

### Behavioral Configuration

| Parameter | Description | Default |
|-----------|-------------|---------|
| `behavioralPattern` | Behavioral pattern to execute. Options: `all`, `file_upload`, `filtered_data`, `feed`, `transaction`, `resource_update`, `auth`, `file_download`, `fast` | `"all"` |
| `excludeBehavioralPatterns` | Patterns to exclude (comma-separated) | `"none"` |
| `repeatersStrategy` | Repeater selection strategy (`each-scan-separate-repeater` or `single-repeater-for-all-scans`) | `"single-repeater-for-all-scans"` |

### Repeater Resources

Configure resources for spawned repeaters during the test:

| Parameter | Description | Default |
|-----------|-------------|---------|
| `repeater.resources.requests.cpu` | CPU request for repeaters | `"100m"` |
| `repeater.resources.requests.memory` | Memory request for repeaters | `"128Mi"` |
| `repeater.resources.limits.cpu` | CPU limit for repeaters | `"500m"` |
| `repeater.resources.limits.memory` | Memory limit for repeaters | `"512Mi"` |

### Load Generator Pod Resources

Configure resources for the load generator pod itself:

| Parameter | Description | Default |
|-----------|-------------|---------|
| `resources.requests.cpu` | CPU request | `1000m` |
| `resources.requests.memory` | Memory request | `1Gi` |
| `resources.limits.cpu` | CPU limit | `1000m` |
| `resources.limits.memory` | Memory limit | `1Gi` |

### Service Configuration

| Parameter | Description | Default |
|-----------|-------------|---------|
| `service.enabled` | Enable service for Locust Web UI | `true` |
| `service.type` | Service type | `ClusterIP` |
| `service.port` | Service port | `8089` |
| `service.targetPort` | Target port for service | `8089` |

### Ingress Configuration

| Parameter | Description | Default |
|-----------|-------------|---------|
| `ingress.enabled` | Enable ingress for public HTTPS access | `false` |
| `ingress.url` | Hostname for the ingress | `""` |
| `ingress.cert` | TLS certificate secret name (if empty, uses cert-manager with Let's Encrypt) | `""` |
| `ingress.annotations` | Additional ingress annotations | `{}` |

### Other Configuration

| Parameter | Description | Default |
|-----------|-------------|---------|
| `kubeconfigYaml` | Base64-encoded kubeconfig (required) | `""` |
| `cluster` | Bright cluster URL | `"https://development.playground.brightsec.com"` |
| `image.repository` | Image repository | `ghcr.io/neuralegion/stresstesting-bridges-load-generator` |
| `image.tag` | Image tag | `"latest"` |

## Accessing the Locust Web UI

After deployment, access the Locust web interface using port-forwarding:

```bash
kubectl port-forward svc/my-load-generator-stresstesting-bridges-load-generator 8089:8089
```

Then visit http://localhost:8089 in your browser.

## Monitoring

View the load generator logs:

```bash
kubectl logs -l app.kubernetes.io/name=stresstesting-bridges-load-generator -f
```

Check pod status:

```bash
kubectl get pods -l app.kubernetes.io/name=stresstesting-bridges-load-generator
```

## Uninstallation

```bash
helm uninstall my-load-generator
```

## Environment Variables

The following environment variables are passed to the container:

- `KUBECONFIG_YAML` - Base64-encoded kubeconfig
- `MAX_SCANS` - Maximum concurrent scans
- `RAMPUP` - Scans per second (optional)
- `DURATION` - Test duration in minutes
- `CONCURRENCY` - Concurrent requests per scan
- `PROXY_URL` - Proxy URL
- `SKIP_PROXY` - Skip proxy flag
- `CLUSTER` - Bright cluster URL
- `REPEATERS_STRATEGY` - Repeater selection strategy
- `BEHAVIORAL_PATTERN` - Behavioral pattern to execute
- `EXCLUDE_BEHAVIORAL_PATTERNS` - Patterns to exclude
- `REPEATER_CPU_REQUEST` - CPU request for repeaters
- `REPEATER_CPU_LIMIT` - CPU limit for repeaters
- `REPEATER_MEM_REQUEST` - Memory request for repeaters
- `REPEATER_MEM_LIMIT` - Memory limit for repeaters
