#!/bin/bash
# PreToolUse hook: blokuje cd do katalogów poza F:/cbt-toolkit
# Wejście: JSON na stdin z kluczem tool_input.command

input=$(cat)

# Wyciągnij komendę bash z JSON
cmd=$(echo "$input" | python3 -c "import sys, json; d = json.load(sys.stdin); print(d.get('tool_input', {}).get('command', ''))" 2>/dev/null)

# Nie jest cd → przepuszczamy od razu
if ! echo "$cmd" | grep -qE '^\s*cd(\s+|$)'; then
  echo '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"allow"}}'
  exit 0
fi

# Wyciągnij docelową ścieżkę (po 'cd ')
target=$(echo "$cmd" | sed 's/^\s*cd\s*//' | sed 's/[[:space:]]*$//')

deny() {
  echo "{\"hookSpecificOutput\":{\"hookEventName\":\"PreToolUse\",\"permissionDecision\":\"deny\",\"permissionDecisionReason\":\"$1\"}}"
  exit 0
}

allow() {
  echo '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"allow"}}'
  exit 0
}

# cd bez argumentu → katalog domowy → blokuj
[ -z "$target" ] && deny "cd bez ścieżki (katalog domowy) jest poza projektem"

# Blokuj ~ i $HOME / $USERPROFILE
case "$target" in
  "~"|"~/"*) deny "cd ~ jest poza projektem" ;;
esac
echo "$target" | grep -qE '^\$(HOME|USERPROFILE)' && deny "cd z \$HOME/\$USERPROFILE jest poza projektem"

# Normalizuj: małe litery + ukośniki
tl=$(echo "$target" | tr '[:upper:]' '[:lower:]' | sed 's/\\/\//g')

# Ścieżka absolutna → sprawdź czy jest w obrębie cbt-toolkit
if echo "$tl" | grep -qE '^(/|[a-z]:)'; then
  case "$tl" in
    /f/cbt-toolkit*)  allow ;;
    f:/cbt-toolkit*)  allow ;;
    *) deny "cd do '${target}' jest poza F:/cbt-toolkit — zablokowane dla bezpieczeństwa" ;;
  esac
fi

# Ścieżka relatywna → przepuszczamy (agent zostaje w swoim drzewie)
allow
