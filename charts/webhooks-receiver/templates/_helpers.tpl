# webhooks-receiver/templates/_helpers.tpl
{{- define "webhooks-receiver.name" -}}
webhooks-receiver
{{- end -}}

{{- define "webhooks-receiver.fullname" -}}
{{- .Release.Name }}-webhooks-receiver
{{- end -}}
