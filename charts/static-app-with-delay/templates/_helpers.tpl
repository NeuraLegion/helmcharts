# static-app-with-delay/templates/_helpers.tpl
{{- define "static-app-with-delay.name" -}}
static-app-with-delay
{{- end -}}

{{- define "static-app-with-delay.fullname" -}}
{{- .Release.Name }}-static-app-with-delay
{{- end -}}
