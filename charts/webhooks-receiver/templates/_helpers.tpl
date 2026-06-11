# webhooks-receiver/templates/_helpers.tpl
{{- define "webhooks-receiver.name" -}}
webhooks-receiver
{{- end -}}

{{- define "webhooks-receiver.fullname" -}}
{{- if contains .Chart.Name .Release.Name -}}
{{- .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name .Chart.Name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}
