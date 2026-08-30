# Google Sheets → Google Forms Auto-Converter

Script Google Apps Script pour convertir automatiquement des Google Sheets en Google Forms (questionnaires à correction automatique).

## 📋 Prérequis

- Google Account avec accès à Google Drive
- Dossier Google Drive contenant des Google Sheets au format:

| Colonne | Contenu |
|---------|---------|
| A | Question (text) |
| B | Option A |
| C | Option B |
| D | Option C |
| E | Option D |
| F | Réponse correcte (A, B, C ou D) |

Exemple :
```
Quel est le nom du scientifique? | Darwin | Curie | Einstein | Newton | A
```

## 🚀 Usage

1. **Ouvrir Google Apps Script** : https://script.google.com
2. **Créer un nouveau projet** (ou copier le code dans un existant)
3. **Coller le contenu de `sheets-to-google-forms.gs`**
4. **Remplacer `ID_DOSSIER`** par l'ID de ton dossier Google Drive
   - Ouvrir le dossier sur drive.google.com → L'ID est dans l'URL
   - Format : `https://drive.google.com/drive/folders/1Rsl7KH0OFiRLm8DqQsGs7KJVVUi85Ja2`
   - ID = `1Rsl7KH0OFiRLm8DqQsGs7KJVVUi85Ja2`

5. **Exécuter la fonction**
   - Cliquer sur `creerFormulairesPourToutLeDossier`
   - Cliquer sur ▶️ Run
   - Autoriser l'accès quand demandé

## ✅ Résultat

Pour chaque Google Sheet du dossier :
- ✅ Crée un Google Form avec questions à choix multiples
- ✅ Configure la correction automatique
- ✅ Définit les points (1 point par bonne réponse)
- ✅ Ajoute un champ "Nom et Prénom"
- ✅ Affiche les liens d'édition et de partage

## 📊 Logs d'exécution

Après exécution, vérifie les logs dans Google Apps Script (View → Logs) :
```
=========================================
✅ TERMINÉ ! 3 fichiers convertis.
=========================================
📄 FICHIER : Quiz R02
Questions : 12
🔗 Lien Édition : https://docs.google.com/forms/d/...
🔗 Lien Élèves  : https://docs.google.com/forms/d/.../viewform
-----------------------------------------
```

## ⚙️ Configuration avancée

### Modifier le nom du formulaire
Ligne 37 : `var formTitle = sheet.getName() + " - Auto-evaluation";`

### Modifier le titre du champ nom
Ligne 42 : `nomItem.setTitle("Votre Nom et Prénom");`

### Personnaliser les logs
Sections "Logger.log(...)" à la fin du script

## 🐛 Troubleshooting

| Problème | Solution |
|----------|----------|
| "ID_DOSSIER not found" | Vérifier l'ID du dossier, s'assurer qu'il existe |
| Aucun formulaire créé | Vérifier que les Sheets existent dans le dossier |
| Questions vides | Vérifier que colonne A n'est pas vide, que colonnes B-E ont des réponses |
| Erreur de permissions | Autoriser l'accès quand l'UI demande (première exécution) |

## 📝 Notes

- Les formulaires sont créés dans le **même Drive** que les Sheets
- Les réponses sont enregistrées dans un **nouvel onglet** de la Spreadsheet
- Les anciens formulaires ne sont pas supprimés (vérifier manuellement si besoin)
