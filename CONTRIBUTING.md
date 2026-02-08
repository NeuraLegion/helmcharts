# Contributing to Vulnerable Apps Helm Repository

This guide explains how to add a new Helm chart to this repository.

## Repository Structure

This repository contains Helm charts for various vulnerable applications used for security testing and training. Charts are organized in two main categories:

- **Simple charts** - Single-service applications using the `simple-service` base chart
- **Complex charts** - Multi-service applications or those requiring custom Kubernetes resources

```
helmcharts/
├── charts/                 # All vulnerable app charts
│   ├── juice-shop/        # Example: simple chart using simple-service
│   ├── brokencrystals/    # Example: chart with custom templates
│   └── crapi/             # Example: complex multi-service chart
├── simple-service/        # Base chart for simple applications
└── README.md
```

## How to Create a New Chart

### Step 1: Choose Your Chart Type

**Option A: Simple Chart (Recommended for single-service apps)**
- Best for applications that run as a single container
- Leverages the `simple-service` base chart
- Requires only `Chart.yaml` and `values.yaml`

**Option B: Custom Templates Chart**
- For applications needing custom Kubernetes resources
- Requires your own templates directory
- More control over deployment configuration

**Option C: Complex Multi-Service Chart**
- For applications with multiple microservices
- Requires sophisticated template structure
- Each service may have its own configuration

### Step 2: Create Chart Directory Structure

#### For Simple Charts (Using simple-service):

1. Create a new directory under `charts/`:
   ```bash
   mkdir -p charts/your-app-name
   ```

2. Create the required files:
   ```bash
   cd charts/your-app-name
   touch Chart.yaml values.yaml .helmignore
   ```

3. Create `Chart.yaml`:
   ```yaml
   apiVersion: v2
   name: your-app-name
   description: |
     A brief description of your vulnerable application.
     Explain what security vulnerabilities it demonstrates.
   type: application
   keywords:
   - your-app-name
   - vulnerability-type
   version: 0.0.1
   appVersion: "1.0.0"
   dependencies:
   - name: simple-service
     version: 0.3.0
     repository: "file://../../simple-service"
   ```

4. Create `values.yaml`:
   ```yaml
   simple-service:
     application:
       image: "owner/your-app-image:tag"
       port: 8080
       env:
         # Environment variables for your app
         ENV_VAR: "value"
       resources:
         requests:
           cpu: 100m
           memory: 256Mi
         limits:
           cpu: 500m
           memory: 512Mi
       livenessProbe:
         httpGet:
           path: /health
           port: 8080
           scheme: HTTP
         initialDelaySeconds: 30
         periodSeconds: 10
       readinessProbe:
         httpGet:
           path: /ready
           port: 8080
           scheme: HTTP
         initialDelaySeconds: 10
         periodSeconds: 5
     
     ingress:
       cert: "distributorwildcard"
     
     global:
       repeaterIDs: null
       token: null
       cluster: null
       timeout: "30000"
       repeaterImageTag: null
   ```

#### For Custom Template Charts:

1. Create the directory structure:
   ```bash
   mkdir -p charts/your-app-name/templates
   cd charts/your-app-name
   touch Chart.yaml values.yaml .helmignore
   ```

2. Create `Chart.yaml` (without dependencies):
   ```yaml
   apiVersion: v2
   name: your-app-name
   description: |
     A brief description of your vulnerable application.
   type: application
   keywords:
   - your-app-name
   version: 0.0.1
   appVersion: "1.0.0"
   ```

3. Create template files in `templates/`:
   - `deployment.yaml` - Kubernetes Deployment
   - `service.yaml` - Kubernetes Service
   - `ingress.yaml` - Ingress configuration
   - `config.yaml` - ConfigMap for environment variables
   - `_helpers.tpl` - Template helpers (optional)
   - `NOTES.txt` - Post-installation notes (optional)

4. Reference existing charts like `brokencrystals` or `dvwa` for template examples.

### Step 3: Create .helmignore

Add a `.helmignore` file to exclude unnecessary files from the chart package:

```
# Patterns to ignore when building packages.
.DS_Store
# Common VCS dirs
.git/
.gitignore
.bzr/
.bzrignore
.hg/
.hgignore
.svn/
# Common backup files
*.swp
*.bak
*.tmp
*.orig
*~
# Various IDEs
.project
.idea/
*.tmproj
.vscode/
```

### Step 4: Test Your Chart Locally

1. **Lint the chart:**
   ```bash
   helm lint charts/your-app-name
   ```

2. **Package the chart:**
   ```bash
   helm package charts/your-app-name
   ```

3. **Install locally (dry-run):**
   ```bash
   helm install --dry-run --debug test-release charts/your-app-name
   ```

4. **Deploy to a test namespace:**
   ```bash
   kubectl create namespace test-your-app
   helm install test-release charts/your-app-name --namespace test-your-app
   ```

5. **Verify the deployment:**
   ```bash
   kubectl get all -n test-your-app
   kubectl logs -n test-your-app deployment/test-release
   ```

6. **Clean up:**
   ```bash
   helm delete test-release --namespace test-your-app
   kubectl delete namespace test-your-app
   ```

### Step 5: Version Your Chart

- Follow semantic versioning for the `version` field in `Chart.yaml`
- Start with `0.0.1` for initial releases
- Increment the version for each change:
  - **Patch** (0.0.x): Bug fixes, minor changes
  - **Minor** (0.x.0): New features, backward-compatible changes
  - **Major** (x.0.0): Breaking changes

### Step 6: Document Your Chart

Consider adding:
- `README.md` in your chart directory with:
  - Application description
  - Security vulnerabilities demonstrated
  - Installation instructions
  - Configuration options
  - Known issues or limitations

Example charts with good documentation:
- `charts/chaotic-shop/README.md`

## Configuration Best Practices

### Resource Limits
Always define resource requests and limits appropriate for your application:
- Set reasonable CPU and memory requests
- Define limits to prevent resource exhaustion
- Consider ephemeral storage if needed

### Health Checks
Configure proper liveness and readiness probes:
- **Liveness probe**: Restarts container if unhealthy
- **Readiness probe**: Controls traffic routing
- Use appropriate initial delays based on startup time

### Environment Variables
- Define all configurable values in `values.yaml`
- Use ConfigMaps for non-sensitive configuration
- Document all environment variables

### Ingress Configuration
- Use the standard ingress template pattern
- Default to `distributorwildcard` certificate
- Target domain: `{{ .Release.Name }}.k3s.brokencrystals.nexploit.app`

### Repeater Integration
Include global repeater configuration for Bright Security integration:
```yaml
global:
  repeaterIDs: null
  token: null
  cluster: null
  timeout: "30000"
  repeaterImageTag: null
```

## Chart Naming Conventions

- Use lowercase names with hyphens for multi-word names
- Chart name should match the application name
- Use descriptive keywords in `Chart.yaml`
- Keep names concise and recognizable

## Common Patterns

### Simple Service Pattern
Most charts follow this pattern:
1. Depend on `simple-service`
2. Configure via `simple-service:` prefix in values
3. Customize image, port, environment, and resources

### Custom Templates Pattern
For more control:
1. Copy template structure from similar charts
2. Use Helm template functions and helpers
3. Follow Kubernetes best practices
4. Include appropriate labels and annotations

## Testing Checklist

Before submitting your chart:

- [ ] Chart lints successfully (`helm lint`)
- [ ] Chart packages without errors (`helm package`)
- [ ] Chart deploys successfully (`helm install`)
- [ ] Application is accessible via ingress
- [ ] Health checks work correctly
- [ ] Resource limits are appropriate
- [ ] All configuration options are documented
- [ ] Version number is correctly set
- [ ] Chart follows naming conventions
- [ ] `.helmignore` excludes unnecessary files

## Examples by Complexity

### Simple Charts
- `juice-shop` - Basic single-service app using simple-service
- `webgoat` - Java-based vulnerable app
- `vampi` - API security testing app

### Medium Complexity
- `brokencrystals` - Custom templates with multiple configs
- `dvwa` - Custom templates with specific requirements
- `dvna` - Node.js app with database

### Complex Charts
- `crapi` - Multi-service microservices architecture
- `beebox` - Application with multiple components
- `definitely-secure-bank` - Complex banking application

## Getting Help

- Review existing charts for reference implementations
- Check the `simple-service` chart for available template features
- Consult the [Helm documentation](https://helm.sh/docs/)
- Review Kubernetes resource definitions

## Submission

Once your chart is ready:
1. Ensure all tests pass
2. Update this CONTRIBUTING.md if you've discovered new patterns
3. Submit your changes via pull request
4. Include a description of the vulnerable application and its purpose

---

**Note**: This repository contains intentionally vulnerable applications for security testing purposes only. Never deploy these applications in production environments.
