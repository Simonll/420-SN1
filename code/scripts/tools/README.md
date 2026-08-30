# Google Sheets → Google Forms Auto-Converter

Script Google Apps Script pour convertir automatiquement des Google Sheets en Google Forms (questionnaires à correction automatique) **avec code affiché dans la description**.

## 📋 Prérequis

- Google Account avec accès à Google Drive
- Google Sheets avec format TSV converti (voir `questionnaire-md-to-tsv.py`)

### Format de la Spreadsheet

| Colonne | Contenu | Obligatoire |
|---------|---------|-----------|
| A | CODE (Python, multi-ligne) | Non |
| B | QUESTION | ✅ Oui |
| C | Option A | ✅ Oui |
| D | Option B | ✅ Oui |
| E | Option C | ✅ Oui |
| F | Option D | ✅ Oui |
| G | REPONSE correcte (A, B, C ou D) | ✅ Oui |

### Exemple de Spreadsheet

```
CODE                           | QUESTION                  | A | B | C | D | REPONSE
def double(x):\n    return...  | Que s'affiche ?          | 2 | 4 | 6 | 8 | D
[vide]                         | Qu'est-ce qu'un param?   | X | Y | Z | W | A
```

## 🚀 Usage

### Étape 1 : Préparer les Questionnaires

```bash
# Convertir les fichiers Markdown en Sheets
python3 questionnaire-md-to-tsv.py Questionnaire-R3.md
# Crée : Questionnaire-R3-import-google-forms.tsv
```

### Étape 2 : Importer dans Google Sheets

1. Créer une nouvelle Google Sheet
2. Menu **File** → **Import** → **Upload**
3. Sélectionner le fichier `.tsv`
4. Options :
   - ✅ **Replace spreadsheet** (ou créer dans un onglet)
   - ✅ **Detect delimiter** (should be TAB)

### Étape 3 : Créer les Formulaires

1. Ouvrir [Google Apps Script](https://script.google.com)
2. Créer un **nouveau projet**
3. Coller le code de `sheets-to-google-forms.gs`
4. Remplacer `ID_DOSSIER` par l'ID de ton dossier Google Drive
5. Sauvegarder et exécuter `creerFormulairesPourToutLeDossier()`
6. **Autoriser l'accès** quand demandé

### Étape 4 : Vérifier les Formulaires

- Les formulaires sont créés dans le même dossier
- Les réponses sont enregistrées dans la **Spreadsheet source**
- Chaque question a le code en **description** (bien formaté)

## ✅ Ce que le script fait

Pour chaque Google Sheet du dossier :
- ✅ Crée un **Google Form** avec quiz auto-évaluation
- ✅ Ajoute un champ **"Nom et Prénom"**
- ✅ Pour chaque question :
  - Titre : Question nettoyée (sans "Après ce code")
  - Description : Code formaté (avec backticks)
  - Réponses : Options A/B/C/D avec correction auto
  - Points : 1 point par bonne réponse
- ✅ Détecte les **doublons** (pas de crash, pas de recréation)
- ✅ Affiche les **URLs d'édition et de partage**

## 🔄 Gestion des doublons (Mode Safe)

Le script détecte automatiquement les formulaires existants et ne les recrée pas.

**Si un formulaire existe :**
```
⚠️ ATTENTION : Formulaire existant détecté
Fichier : Quiz R3
Titre : Quiz R3 - Auto-evaluation
URL Existant : https://docs.google.com/forms/d/.../edit

DÉCISION : Vérifiez manuellement
  - Pour recréer → supprimez le formulaire et relancez
  - Pour garder → continuez sans action
```

## 📊 Logs d'exécution

Après exécution, consultez les logs dans Google Apps Script (**View → Logs**) :

```
=========================================
✅ EXÉCUTION TERMINÉE
=========================================
Fichiers traités : 1
Nouveaux formulaires : 1
Formulaires existants détectés : 0
=========================================

FORMULAIRES CRÉÉS :
-----------------------------------------
✅ CRÉÉ FICHIER : Quiz R3
Questions : 20
Questions avec code : 18
🔗 Lien Édition : https://docs.google.com/forms/d/.../edit
🔗 Lien Élèves  : https://docs.google.com/forms/d/.../viewform
-----------------------------------------
```

## 🎨 Affichage du Code dans Google Forms

### Dans l'éditeur (vue professeur) :
```
TITRE : "Que s'affiche ?"

DESCRIPTION (Help Text) :
Code:
```
def double(x):
    return x * 2

print(double(4))
```
```

### Pour les étudiants :
- Quand ils ouvrent la question, le **code s'affiche clairement en gris**
- Puis les **options A/B/C/D** en dessous
- Format lisible et professionnel

## ⚙️ Configuration avancée

### Modifier le titre du formulaire
Ligne 55 : `var formTitle = sheet.getName() + " - Auto-evaluation";`

### Modifier le préfixe du code en description
Ligne 128 : `questionItem.setHelpText("Code:\n" + codeFormate);`

### Modifier le format du code (ex: sans backticks)
Fonction `formatCodeForDescription()` ligne 91

## 🐛 Troubleshooting

| Problème | Solution |
|----------|----------|
| "ID_DOSSIER not found" | Vérifier l'ID du dossier Google Drive |
| Code ne s'affiche pas | Vérifier colonne A du Sheet (non vide) |
| Questions vides | Vérifier colonne B non vide |
| Erreur de permissions | Autoriser dans la popup (première exécution) |
| Formulaires en doublons | Utiliser version V2+ avec détection (cette version) |

## 📝 Historique des mises à jour

- **2026-08-30 V2** : ✨ **Code en description** (meilleur affichage)
  - Code s'affiche en description (Help Text)
  - Question nettoyée (sans "Après ce code")
  - Support \n multi-ligne converti en vrais retours à ligne
  
- **2026-08-30 V1** : Création initiale avec détection doublons

## 🔗 Workflow complet

```
Questionnaire-R3.md
    ↓ (questionnaire-md-to-tsv.py)
Questionnaire-R3-import-google-forms.tsv
    ↓ (import dans Google Sheets)
Google Sheet: Questionnaire-R3
    ↓ (sheets-to-google-forms.gs)
Google Form: "Quiz R3 - Auto-evaluation"
    ↓ (étudiants répondent)
Google Sheet: Réponses enregistrées automatiquement
```

## 💡 Conseils

- **Format du code** : Bien indenter le code dans le `.md` (sera préservé)
- **Options** : Garder courtes et claires
- **Bon réponse** : Vérifier que la lettre (A/B/C/D) est correcte dans le Sheet
- **Doublons** : Ne pas paniquer, le script détecte et prévient
- **Partage** : Récupérer le lien "Lien Élèves" pour partager aux étudiants
