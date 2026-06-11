# static-app-with-delay/templates/_helpers.tpl
{{- define "static-app-with-delay.name" -}}
static-app-with-delay
{{- end -}}

{{- define "static-app-with-delay.fullname" -}}
{{- if contains .Chart.Name .Release.Name -}}
{{- .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name .Chart.Name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}
