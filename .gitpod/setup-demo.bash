for task in $(yq -r -oy '.pipeline."@salamruby/demo#go".dependsOn[]' turbo.json); do
  package="${task%#*}"
  command="${task#*#}"
  turbo --filter "$package" $command
done