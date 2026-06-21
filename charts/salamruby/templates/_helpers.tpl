{{/*
Expand the name of the chart.
This function ensures that the chart name is either taken from `nameOverride` or defaults to `.Chart.Name`.
It also truncates the name to a maximum of 63 characters and removes trailing hyphens.
*/}}
{{- define "salamruby.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Hub resource name: base name truncated to 59 chars then "-hub" so the suffix is never lost (63 char limit).
*/}}
{{- define "salamruby.hubname" -}}
{{- $base := include "salamruby.name" . | trunc 59 | trimSuffix "-" }}
{{- printf "%s-hub" $base | trimSuffix "-" }}
{{- end }}

{{/*
Cube.js resource name.
*/}}
{{- define "salamruby.cubeName" -}}
{{- $base := include "salamruby.name" . | trunc 58 | trimSuffix "-" }}
{{- printf "%s-cube" $base | trimSuffix "-" }}
{{- end }}


{{/*
Define the application version to be used in labels.
The version is taken from `.Values.deployment.image.tag` if provided, otherwise it defaults to `.Chart.Version`.
It ensures the version only contains alphanumeric characters, underscores, dots, or hyphens, replacing any invalid characters with a hyphen.
*/}}
{{- define "salamruby.version" -}}
  {{- $appVersion := default .Chart.Version .Values.deployment.image.tag -}}
  {{- regexReplaceAll "[^a-zA-Z0-9_\\.\\-]" $appVersion "-" | trunc 63 | trimSuffix "-" -}}
{{- end }}


{{/*
Generate a chart name and version string to be used in Helm chart labels.
This follows the format: `<ChartName>-<ChartVersion>`, replacing `+` with `_` and truncating to 63 characters.
*/}}
{{- define "salamruby.chart" -}}
  {{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}


{{/*
Common labels applied to Kubernetes resources.
These labels help identify and manage the application.
*/}}
{{- define "salamruby.labels" -}}
helm.sh/chart: {{ include "salamruby.chart" . }}

# Selector labels
{{ include "salamruby.selectorLabels" . }}

# Application version label
{{- with include "salamruby.version" . }}
app.kubernetes.io/version: {{ . | quote }}
{{- end }}

# Managed by Helm
app.kubernetes.io/managed-by: {{ .Release.Service }}

# Part of label, defaults to the chart name if `partOfOverride` is not provided.
app.kubernetes.io/part-of: {{ .Values.partOfOverride | default (include "salamruby.name" .) }}
{{- end }}


{{/*
Selector labels used for identifying workloads in Kubernetes.
These labels ensure that selectors correctly map to the deployed resources.
*/}}
{{- define "salamruby.selectorLabels" -}}
app.kubernetes.io/name: {{ include "salamruby.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/component: {{ .Values.componentOverride | default (include "salamruby.name" .) }}
{{- end }}


{{/*
Renders a value that contains a Helm template.
Usage:
{{ include "salamruby.tplvalues.render" ( dict "value" .Values.path.to.the.Value "context" $) }}
This function allows rendering values dynamically.
*/}}
{{- define "salamruby.tplvalues.render" -}}
    {{- if typeIs "string" .value }}
        {{- tpl .value .context }}
    {{- else }}
        {{- tpl (.value | toYaml) .context }}
    {{- end }}
{{- end }}

{{/*
Render a Kubernetes EnvVar from chart env maps.
Scalar values become quoted string values. Map values are rendered as EnvVar fields,
which keeps advanced forms such as valueFrom supported.
*/}}
{{- define "salamruby.envVarValue" -}}
{{- $value := .value -}}
{{- if kindIs "map" $value -}}
{{- include "salamruby.tplvalues.render" (dict "value" $value "context" .context) -}}
{{- else if kindIs "invalid" $value -}}
value: ""
{{- else -}}
value: {{ include "salamruby.tplvalues.render" (dict "value" (toString $value) "context" .context) | trim | quote }}
{{- end -}}
{{- end }}

{{- define "salamruby.envVar" -}}
- name: {{ include "salamruby.tplvalues.render" (dict "value" .name "context" .context) }}
  {{- include "salamruby.envVarValue" (dict "value" .value "context" .context) | nindent 2 }}
{{- end }}

{{/*
Default OpenAI-compatible base URL for the bundled vLLM router.
*/}}
{{- define "salamruby.llmBaseUrl" -}}
{{- if .Values.llm.salamruby.baseUrl -}}
{{- include "salamruby.tplvalues.render" (dict "value" .Values.llm.salamruby.baseUrl "context" .) -}}
{{- else -}}
{{- printf "http://%s-router-service:%s/v1" .Release.Name (toString .Values.llm.routerSpec.servicePort) -}}
{{- end -}}
{{- end }}

{{/*
Allow the release namespace to be overridden.
If `namespaceOverride` is provided, it will be used; otherwise, it defaults to `.Release.Namespace`.
*/}}
{{- define "salamruby.namespace" -}}
{{- default .Release.Namespace .Values.namespaceOverride -}}
{{- end -}}

{{- define "salamruby.appSecretName" -}}
{{- printf "%s-app-secrets" (include "salamruby.name" .) -}}
{{- end }}

{{- define "salamruby.redisName" -}}
{{- .Values.redis.fullnameOverride | default (printf "%s-redis" (include "salamruby.name" .)) | trunc 63 | trimSuffix "-" -}}
{{- end }}

{{- define "salamruby.redisMasterName" -}}
{{- printf "%s-master" (include "salamruby.redisName" .) | trunc 63 | trimSuffix "-" -}}
{{- end }}

{{- define "salamruby.redisHeadlessName" -}}
{{- printf "%s-headless" (include "salamruby.redisName" .) | trunc 63 | trimSuffix "-" -}}
{{- end }}

{{- define "salamruby.redisImage" -}}
{{- if .Values.redis.image.digest -}}
{{- printf "%s@%s" .Values.redis.image.repository .Values.redis.image.digest -}}
{{- else -}}
{{- printf "%s:%s" .Values.redis.image.repository .Values.redis.image.tag -}}
{{- end -}}
{{- end }}

{{- define "salamruby.redisSecretName" -}}
{{- .Values.redis.auth.existingSecret | default (include "salamruby.appSecretName" .) -}}
{{- end }}

{{- define "salamruby.redisSecretKey" -}}
{{- .Values.redis.auth.existingSecretPasswordKey | default "REDIS_PASSWORD" -}}
{{- end }}

{{- define "salamruby.migrationJobName" -}}
{{- printf "%s-migration" (include "salamruby.name" .) | trunc 63 | trimSuffix "-" -}}
{{- end }}

{{/*
SalamRuby application image reference. A configured digest takes precedence over the tag.
*/}}
{{- define "salamruby.deploymentImage" -}}
{{- if .Values.deployment.image.digest -}}
{{- printf "%s@%s" .Values.deployment.image.repository .Values.deployment.image.digest -}}
{{- else -}}
{{- printf "%s:%s" .Values.deployment.image.repository (.Values.deployment.image.tag | default .Chart.AppVersion | default "latest") -}}
{{- end -}}
{{- end }}

{{- define "salamruby.hubSecretName" -}}
{{- default (include "salamruby.appSecretName" .) .Values.hub.existingSecret -}}
{{- end }}

{{- define "salamruby.hubMigrationWaitServiceAccountName" -}}
{{- printf "%s-migration-wait" (include "salamruby.hubname" .) | trunc 63 | trimSuffix "-" -}}
{{- end }}

{{/*
Hub image reference. Pin by digest in production (hub.image.digest = "sha256:..."); falls back to
hub.image.tag for local/dev. All Hub workloads (deployment, init container, migration job, future
hub-worker) must use this helper so they cannot drift apart.
*/}}
{{- define "salamruby.hubImage" -}}
{{- if .Values.hub.image.digest -}}
{{- printf "%s@%s" .Values.hub.image.repository .Values.hub.image.digest -}}
{{- else -}}
{{- printf "%s:%s" .Values.hub.image.repository (.Values.hub.image.tag | default "latest") -}}
{{- end -}}
{{- end }}

{{/*
Hub worker resource name.
*/}}
{{- define "salamruby.hubWorkerName" -}}
{{- $base := include "salamruby.name" . | trunc 52 | trimSuffix "-" }}
{{- printf "%s-hub-worker" $base | trimSuffix "-" }}
{{- end }}

{{/*
Hub embeddings runtime resource name.
*/}}
{{- define "salamruby.hubEmbeddingsName" -}}
{{- $base := include "salamruby.name" . | trunc 48 | trimSuffix "-" }}
{{- printf "%s-hub-embeddings" $base | trimSuffix "-" }}
{{- end }}

{{/*
Secret used by Hub and the embeddings runtime for the embeddings API key.
*/}}
{{- define "salamruby.hubEmbeddingsSecretName" -}}
{{- default (printf "%s-secret" (include "salamruby.hubEmbeddingsName" .)) .Values.hub.embeddings.auth.existingSecret -}}
{{- end }}

{{/*
Secret used by the embeddings runtime for Hugging Face access.
*/}}
{{- define "salamruby.hubEmbeddingsHuggingFaceSecretName" -}}
{{- default (include "salamruby.hubEmbeddingsSecretName" .) .Values.hub.embeddings.huggingFace.existingSecret -}}
{{- end }}

{{/*
Model name Hub sends to the OpenAI-compatible embeddings endpoint.
*/}}
{{- define "salamruby.hubEmbeddingsServedModelName" -}}
{{- default .Values.hub.embeddings.model .Values.hub.embeddings.servedModelName -}}
{{- end }}

{{/*
OpenAI-compatible embeddings base URL used by Hub.
*/}}
{{- define "salamruby.hubEmbeddingsBaseURL" -}}
{{- if .Values.hub.embeddings.baseUrl -}}
{{- .Values.hub.embeddings.baseUrl -}}
{{- else -}}
{{- printf "http://%s:%v/v1" (include "salamruby.hubEmbeddingsName" .) (.Values.hub.embeddings.service.port | default .Values.hub.embeddings.port) -}}
{{- end -}}
{{- end }}

{{/*
Embedding API key value for the generated embeddings secret.
*/}}
{{- define "salamruby.hubEmbeddingsApiKey" -}}
{{- $secretName := include "salamruby.hubEmbeddingsSecretName" . }}
{{- $secretKey := .Values.hub.embeddings.auth.secretKey | default "EMBEDDING_PROVIDER_API_KEY" }}
{{- $secret := (lookup "v1" "Secret" .Release.Namespace $secretName) }}
{{- $secretData := dig "data" dict $secret }}
{{- if index $secretData $secretKey }}
    {{- index $secretData $secretKey | b64dec -}}
{{- else if .Values.hub.embeddings.auth.apiKey }}
    {{- .Values.hub.embeddings.auth.apiKey -}}
{{- else }}
    {{- randAlphaNum 32 -}}
{{- end -}}
{{- end }}

{{/*
Shared Hub embedding env. These values are managed from hub.embeddings when the
self-hosted runtime is enabled so Hub API and Hub worker cannot drift.
*/}}
{{- define "salamruby.hubEmbeddingEnv" -}}
{{- $root := .root -}}
{{- if $root.Values.hub.embeddings.enabled }}
- name: EMBEDDING_PROVIDER
  value: "openai"
- name: EMBEDDING_MODEL
  value: {{ include "salamruby.hubEmbeddingsServedModelName" $root | quote }}
- name: EMBEDDING_BASE_URL
  value: {{ include "salamruby.hubEmbeddingsBaseURL" $root | quote }}
- name: EMBEDDING_PROVIDER_API_KEY
  valueFrom:
    secretKeyRef:
      name: {{ include "salamruby.hubEmbeddingsSecretName" $root }}
      key: {{ $root.Values.hub.embeddings.auth.secretKey | default "EMBEDDING_PROVIDER_API_KEY" }}
- name: EMBEDDING_MAX_CONCURRENT
  value: {{ $root.Values.hub.embeddings.maxConcurrent | quote }}
- name: EMBEDDING_NORMALIZE
  value: {{ $root.Values.hub.embeddings.normalize | quote }}
{{- end }}
{{- end }}

{{/*
Returns true when an env var is managed by hub.embeddings and should not be rendered from hub.env/worker.env.
*/}}
{{- define "salamruby.hubEmbeddingEnvManaged" -}}
{{- $key := .key -}}
{{- if has $key (list "EMBEDDING_PROVIDER" "EMBEDDING_MODEL" "EMBEDDING_BASE_URL" "EMBEDDING_PROVIDER_API_KEY" "EMBEDDING_MAX_CONCURRENT" "EMBEDDING_NORMALIZE") -}}
true
{{- end -}}
{{- end }}


{{- define "salamruby.postgresAdminPassword" -}}
{{- $secret := (lookup "v1" "Secret" .Release.Namespace (include "salamruby.appSecretName" .)) }}
{{- $secretData := dig "data" dict $secret }}
{{- if index $secretData "POSTGRES_ADMIN_PASSWORD" }}
    {{- index $secretData "POSTGRES_ADMIN_PASSWORD" | b64dec -}}
{{- else }}
    {{- randAlphaNum 16 -}}
{{- end -}}
{{- end }}

{{- define "salamruby.postgresUserPassword" -}}
{{- $secret := (lookup "v1" "Secret" .Release.Namespace (include "salamruby.appSecretName" .)) }}
{{- $secretData := dig "data" dict $secret }}
{{- if index $secretData "POSTGRES_USER_PASSWORD" }}
    {{- index $secretData "POSTGRES_USER_PASSWORD" | b64dec -}}
{{- else }}
    {{- randAlphaNum 16 -}}
{{- end -}}
{{- end }}

{{- define "salamruby.redisPassword" -}}
{{- $redisSecretName := include "salamruby.redisSecretName" . }}
{{- $redisSecretKey := include "salamruby.redisSecretKey" . }}
{{- $secret := (lookup "v1" "Secret" .Release.Namespace $redisSecretName) }}
{{- $secretData := dig "data" dict $secret }}
{{- if index $secretData $redisSecretKey }}
    {{- index $secretData $redisSecretKey | b64dec -}}
{{- else if eq $redisSecretName (include "salamruby.appSecretName" .) }}
    {{- randAlphaNum 16 -}}
{{- else }}
    {{- fail (printf "redis.auth.existingSecret %q must already exist in namespace %q and contain %s when secret.enabled=true so REDIS_URL can use the same password as the bundled Valkey server. Disable secret.enabled and provide app-secrets externally, or pre-create the Redis auth secret." $redisSecretName .Release.Namespace $redisSecretKey) -}}
{{- end -}}
{{- end }}

{{- define "salamruby.cronSecret" -}}
{{- $secret := (lookup "v1" "Secret" .Release.Namespace (include "salamruby.appSecretName" .)) }}
{{- $secretData := dig "data" dict $secret }}
{{- if index $secretData "CRON_SECRET" }}
    {{- index $secretData "CRON_SECRET" | b64dec -}}
{{- else if and $secret (hasKey $secret "data") }}
    {{- fail (printf "Secret %q exists in namespace %q but is missing CRON_SECRET" (include "salamruby.appSecretName" .) .Release.Namespace) -}}
{{- else }}
    {{- randAlphaNum 32 -}}
{{- end -}}
{{- end }}

{{- define "salamruby.encryptionKey" -}}
{{- $secret := (lookup "v1" "Secret" .Release.Namespace (include "salamruby.appSecretName" .)) }}
{{- $secretData := dig "data" dict $secret }}
{{- if index $secretData "ENCRYPTION_KEY" }}
    {{- index $secretData "ENCRYPTION_KEY" | b64dec -}}
{{- else if and $secret (hasKey $secret "data") }}
    {{- fail (printf "Secret %q exists in namespace %q but is missing ENCRYPTION_KEY" (include "salamruby.appSecretName" .) .Release.Namespace) -}}
{{- else }}
    {{- randAlphaNum 32 -}}
{{- end -}}
{{- end }}

{{- define "salamruby.nextAuthSecret" -}}
{{- $secret := (lookup "v1" "Secret" .Release.Namespace (include "salamruby.appSecretName" .)) }}
{{- $secretData := dig "data" dict $secret }}
{{- if index $secretData "NEXTAUTH_SECRET" }}
    {{- index $secretData "NEXTAUTH_SECRET" | b64dec -}}
{{- else if and $secret (hasKey $secret "data") }}
    {{- fail (printf "Secret %q exists in namespace %q but is missing NEXTAUTH_SECRET" (include "salamruby.appSecretName" .) .Release.Namespace) -}}
{{- else }}
    {{- randAlphaNum 32 -}}
{{- end -}}
{{- end }}

{{- define "salamruby.hubApiKey" -}}
{{- $hubSecretName := include "salamruby.hubSecretName" . }}
{{- $secret := (lookup "v1" "Secret" .Release.Namespace $hubSecretName) }}
{{- $secretData := dig "data" dict $secret }}
{{- if index $secretData "HUB_API_KEY" }}
    {{- index $secretData "HUB_API_KEY" | b64dec -}}
{{- else if .Values.hub.existingSecret }}
    {{- fail (printf "hub.existingSecret %q must already exist in namespace %q and contain HUB_API_KEY when rendering the generated app secret. Disable secret.enabled and provide app-secrets externally, or pre-create the Hub secret." $hubSecretName .Release.Namespace) -}}
{{- else }}
    {{- randAlphaNum 32 -}}
{{- end -}}
{{- end }}

{{- define "salamruby.cubejsApiSecret" -}}
{{- $secret := (lookup "v1" "Secret" .Release.Namespace (include "salamruby.appSecretName" .)) }}
{{- $secretData := dig "data" dict $secret }}
{{- if index $secretData "CUBEJS_API_SECRET" }}
    {{- index $secretData "CUBEJS_API_SECRET" | b64dec -}}
{{- else }}
    {{- randAlphaNum 32 -}}
{{- end -}}
{{- end }}
{{- define "salamruby.envoy.gatewayClassName" -}}
{{- if .Values.envoy.salamruby.gatewayClass.name -}}
{{- .Values.envoy.salamruby.gatewayClass.name | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s-envoy" .Release.Name (include "salamruby.namespace" .) | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end }}

{{- define "salamruby.envoy.gatewayName" -}}
{{- if .Values.envoy.salamruby.gateway.name -}}
{{- .Values.envoy.salamruby.gateway.name | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-envoy-gateway" (include "salamruby.name" .) | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end }}

{{- define "salamruby.envoy.proxyName" -}}
{{- if .Values.envoy.salamruby.proxy.name -}}
{{- .Values.envoy.salamruby.proxy.name | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-envoy-proxy" (include "salamruby.name" .) | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end }}

{{- define "salamruby.envoy.proxyServiceName" -}}
{{- if .Values.envoy.salamruby.proxy.service.name -}}
{{- .Values.envoy.salamruby.proxy.service.name | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-envoy" (include "salamruby.name" .) | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end }}

{{- define "salamruby.envoy.ingressHost" -}}
{{- if .Values.envoy.salamruby.ingress.host -}}
{{- tpl .Values.envoy.salamruby.ingress.host $ -}}
{{- else if and .Values.ingress.hosts (gt (len .Values.ingress.hosts) 0) -}}
{{- tpl (index .Values.ingress.hosts 0).host $ -}}
{{- end -}}
{{- end }}

{{- define "salamruby.envoy.defaultRedisUrl" -}}
{{- printf "%s-master:6379" .Values.envoyRedis.fullnameOverride -}}
{{- end }}
