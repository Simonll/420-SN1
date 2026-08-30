#!/bin/bash
# Convert all Questionnaire MD files to TSV with code blocks

VAULT_PATH="$HOME/notes-vault/420-SN1/Automne-2026"
SCRIPT_PATH="$HOME/420-SN1/code/scripts/tools/questionnaire-md-to-tsv.py"

echo "🚀 Conversion de tous les questionnaires..."
echo ""

for r in 1 2 3 4 5 6 9; do
  input="$VAULT_PATH/Questionnaire-R${r}.md"
  output="$VAULT_PATH/Questionnaire-R${r}-import-google-forms.tsv"
  
  if [ -f "$input" ]; then
    echo "🔄 Rencontre $r..."
    python3 "$SCRIPT_PATH" "$input" "$output"
    lines=$(grep -c '^' "$output")
    questions=$((lines - 1))
    echo "✅ R$r : $questions questions converties"
    echo ""
  else
    echo "⏭️ R$r : fichier non trouvé ($input)"
    echo ""
  fi
done

echo "✅ Conversion complète !"
echo "📁 Fichiers TSV dans : $VAULT_PATH"
