# brokencrystals helm repository

1. Add repository to your local list 

```sh
$ helm repo add brokencrystals \     
  --username "${GITHUB_TOKEN}" \
  --password "${GITHUB_TOKEN}" \
  "https://raw.githubusercontent.com/NeuraLegion/brokencrystalshelm/main/"
```

2. Update your local repo 

```sh
$ helm repo update
```

3. Find chart and show version 

```sh
$ helm search repo brokencrystals
```

4. Install chart to cluster 

```sh
$ helm install --namespace brokencrystals uniquename brokencrystals/brokencrystals
```

Instalation will be available to url https://uniquename.brokencrystals.dev.vuln.nexploit.app/

5. For delete 

```sh
$ helm delete --namespace brokencrystals uniquename
```

---
Source code https://github.com/NeuraLegion/cluster-vulnerable-apps/tree/main/vulnerable-apps/helm/charts/brokencrystals