{{/*
Expand the name of the chart.
*/}}
{{- define "simple.name" -}}
{{- default .Release.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}
