# vulnerable apps helm repository

1. Add repository to your local list 

```sh
$ helm repo add vulnerable-apps \     
  --username "${GITHUB_TOKEN}" \
  --password "${GITHUB_TOKEN}" \
  "https://neuralegion.github.io/helmcharts/"
```

2. Update your local repository 

```sh
$ helm repo update
```

3. Find chart and show version 

```sh
$ helm search repo [vulnerable apps]
```

4. Install chart to cluster 

```sh
$ helm install --namespace [vulnerable-apps] --set ingress.url=[uniquedomainname].dev.vuln.nexploit.app [uniquename] vulnerable-apps/[vulnerable apps]
```

Instalation will be available to url https://github.com/NeuraLegion/helmcharts/releases

5. For delete 

```sh
$ helm delete --namespace [vulnerable apps] [uniquename]
```
On the example of broken crystals:
```sh
$ helm repo add vulnerable-apps \     
  --username "${GITHUB_TOKEN}" \
  --password "${GITHUB_TOKEN}" \
  "https://neuralegion.github.io/helmcharts/"

$ helm repo update
$ helm search repo brokencrystals
$ helm install --namespace brokencrystals app-brokencrystals vulnerable-apps/brokencrystals
```
Instalation will be available to url https://uniquename.brokencrystals.dev.vuln.nexploit.app/

```sh
$ helm delete --namespace brokencrystals app-brokencrystals
```

---
Source code https://github.com/NeuraLegion/cluster-vulnerable-apps/tree/main/vulnerable-apps/helm/charts/brokencrystals
Manual https://dev.to/frosnerd/using-a-private-github-repository-as-a-helm-chart-repository-5fa8
