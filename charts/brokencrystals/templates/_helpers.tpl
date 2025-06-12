{{/*
Expand the name of the chart.
*/}}
{{- define "brokencrystals.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "brokencrystals.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 50 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 50 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 50 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "brokencrystals.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "brokencrystals.labels" -}}
helm.sh/chart: {{ include "brokencrystals.chart" . }}
{{ include "brokencrystals.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "brokencrystals.selectorLabels" -}}
app.kubernetes.io/name: {{ include "brokencrystals.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "brokencrystals.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "brokencrystals.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Safe IngressClass detection
*/}}
{{- define "brokencrystals.ingressClass" -}}
{{- if .Values.ingress.className -}}
{{- .Values.ingress.className -}}
{{- else -}}
{{- $availableClasses := list -}}

{{/* Only try lookup if we're not in template mode */}}
{{- $allIngressClasses := (lookup "networking.k8s.io/v1" "IngressClass" "" "") -}}
{{- if $allIngressClasses -}}
{{- if $allIngressClasses.items -}}
{{- range $allIngressClasses.items -}}
{{- if and .metadata .metadata.name -}}
{{- $availableClasses = append $availableClasses .metadata.name -}}
{{- end -}}
{{- end -}}
{{- end -}}
{{- end -}}

{{/* Use priority order if classes found, otherwise default */}}
{{- if $availableClasses -}}
{{- if has "traefik" $availableClasses -}}
traefik
{{- else if has "nginx" $availableClasses -}}
nginx
{{- else -}}
{{- index $availableClasses 0 -}}
{{- end -}}
{{- else -}}
nginx
{{- end -}}
{{- end -}}
{{- end -}}
