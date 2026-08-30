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

## 🔄 Gestion des doublons (Mode Safe)

**Le script détecte automatiquement les formulaires existants.**

### Comportement si formulaire existe déjà :

```
⚠️ ATTENTION : Formulaire existant détecté
Fichier : Quiz R02
Titre : Quiz R02 - Auto-evaluation
URL Existant : https://docs.google.com/forms/d/.../edit
DÉCISION : Vérifiez manuellement
  - Si vous voulez recréer → supprimez le formulaire et relancez
  - Si vous voulez garder → continuez sans action
```

**Aucun doublon ne sera créé.**

### Pour recréer un formulaire :

1. Supprimer manuellement le formulaire existant dans Google Drive
2. Relancer le script
3. Un nouveau formulaire sera créé

## 📊 Logs d'exécution

Après exécution, vérifie les logs dans Google Apps Script (View → Logs) :

### Exécution normale (premiers formulaires) :
```
=========================================
✅ EXÉCUTION TERMINÉE
=========================================
Fichiers traités : 3
Nouveaux formulaires : 3
Formulaires existants détectés : 0
=========================================

FORMULAIRES CRÉÉS :
-----------------------------------------
✅ CRÉÉ FICHIER : Quiz R02
Questions : 12
🔗 Lien Édition : https://docs.google.com/forms/d/.../edit
🔗 Lien Élèves  : https://docs.google.com/forms/d/.../viewform
-----------------------------------------
```

### 2e exécution (formulaires existants) :
```
=========================================
✅ EXÉCUTION TERMINÉE
=========================================
Fichiers traités : 3
Nouveaux formulaires : 0
Formulaires existants détectés : 3
=========================================

⚠️ AVERTISSEMENTS (Formulaires existants):
=========================================
⚠️ FORMULAIRE EXISTANT - Quiz R02
Titre : Quiz R02 - Auto-evaluation
URL : https://docs.google.com/forms/d/.../edit
Message : Ce formulaire existe déjà. Vérifier avant de recréer.
-----------------------------------------
```

## ⚙️ Configuration avancée

### Modifier le nom du formulaire
Ligne 59 : `var formTitle = sheet.getName() + " - Auto-evaluation";`

### Modifier le titre du champ nom
Ligne 76 : `nomItem.setTitle("Votre Nom et Prénom");`

### Personnaliser les logs
Sections "Logger.log(...)" à la fin du script

## 🐛 Troubleshooting

| Problème | Solution |
|----------|----------|
| "ID_DOSSIER not found" | Vérifier l'ID du dossier, s'assurer qu'il existe |
| Aucun formulaire créé | Vérifier que les Sheets existent dans le dossier |
| Questions vides | Vérifier que colonne A n'est pas vide, que colonnes B-E ont des réponses |
| Erreur de permissions | Autoriser l'accès quand l'UI demande (première exécution) |
| Doublons créés | Vérifier la version du script (mise à jour 2026-08-30) |

## 📝 Notes

- Les formulaires sont créés dans le **même Drive** que les Sheets
- Les réponses sont enregistrées dans un **nouvel onglet** de la Spreadsheet
- Le script **détecte et prévient les doublons** automatiquement
- Aucun formulaire n'est supprimé automatiquement (safe mode)
- Pour recréer un formulaire, supprimer manuellement l'ancien d'abord

## 🔧 Historique des mises à jour

- **2026-08-30** : Ajout de la détection des doublons (Mode Safe avec confirmation manuelle)
- **2026-08-30** : Création initiale du script
