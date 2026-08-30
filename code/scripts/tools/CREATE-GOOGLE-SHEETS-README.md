# Google Sheets Questionnaires Creator

Script Python pour créer automatiquement des Google Sheets et y importer les données TSV des questionnaires.

## 📋 Prérequis

### Logiciels
- Python 3.7+
- pip

### Bibliothèques Python
```bash
pip install google-auth-oauthlib google-auth-httplib2 google-api-python-client
```

### Authentification Google
1. Aller sur [Google Cloud Console](https://console.cloud.google.com)
2. Créer un nouveau projet
3. Activer les APIs :
   - **Google Sheets API**
   - **Google Drive API**
4. Créer une **OAuth 2.0 Client ID** (Desktop Application)
5. Télécharger le JSON et le renommer en `credentials.json`
6. Placer `credentials.json` dans le même répertoire que le script

## 🚀 Usage

### Utilisation basique
```bash
python3 create-google-sheets-questionnaires.py
```

Le script va :
1. Chercher les fichiers `Questionnaire-R*-import-google-forms.tsv`
2. Demander l'ID du dossier Google Drive (optionnel)
3. Créer une Google Sheet pour chaque TSV
4. Importer les données
5. Afficher les URLs

### Utilisation avancée

```bash
# Spécifier le dossier destination
python3 create-google-sheets-questionnaires.py \
  --folder-id 1Rsl7KH0OFiRLm8DqQsGs7KJVVUi85Ja2

# Spécifier le répertoire des TSV
python3 create-google-sheets-questionnaires.py \
  --tsv-dir ~/notes-vault/420-SN1/Automne-2026 \
  --folder-id 1Rsl7KH0OFiRLm8DqQsGs7KJVVUi85Ja2
```

## 📊 Résultat

Pour chaque questionnaire, le script crée :

```
Google Sheet : "Questionnaire-R3"
├── Colonne A : CODE (bloc de code Python)
├── Colonne B : QUESTION
├── Colonne C : OPTION_A
├── Colonne D : OPTION_B
├── Colonne E : OPTION_C
├── Colonne F : OPTION_D
└── Colonne G : REPONSE (A, B, C ou D)
```

Les données sont prêtes à être utilisées par `sheets-to-google-forms.gs`.

## 🔧 Workflow complet

```
Questionnaire-R3.md
    ↓
questionnaire-md-to-tsv.py
    ↓
Questionnaire-R3-import-google-forms.tsv
    ↓
create-google-sheets-questionnaires.py
    ↓
Google Sheet: Questionnaire-R3
    ↓
sheets-to-google-forms.gs (Google Apps Script)
    ↓
Google Form: "Quiz R3 - Auto-evaluation"
```

## 💡 Conseils

### Première authentification
- La première fois, une fenêtre navigateur s'ouvrira
- Connectez-vous avec votre compte Google
- Autorisez l'accès
- Un fichier `token.json` sera créé (le garder secret)

### ID du dossier Google Drive
Pour trouver l'ID d'un dossier :
1. Ouvrir le dossier sur [drive.google.com](https://drive.google.com)
2. L'URL ressemble à : `https://drive.google.com/drive/folders/1Rsl7KH0OFiRLm8DqQsGs7KJVVUi85Ja2`
3. L'ID est : `1Rsl7KH0OFiRLm8DqQsGs7KJVVUi85Ja2`

### Vérifier les données importées
Après exécution, ouvrir chaque Sheet pour vérifier que :
- ✅ Les en-têtes sont en ligne 1
- ✅ Les colonnes sont correctement alignées
- ✅ Les codes multi-ligne conservent leurs retours à la ligne (`\n` affiché)
- ✅ Aucune donnée manquante

## 🐛 Troubleshooting

| Problème | Solution |
|----------|----------|
| `credentials.json` not found | Créer OAuth 2.0 credentials sur Google Cloud Console |
| Erreur d'authentification | Supprimer `token.json` et recommencer (nouvelle connexion) |
| Pas de fichier TSV trouvé | Vérifier le chemin `--tsv-dir` et les noms de fichiers |
| Permission denied | Vérifier que les APIs (Sheets + Drive) sont activées |
| Données vides dans la Sheet | Vérifier que les TSV sont bien formatés (delimiter = TAB) |

## 📝 Notes

- Les Sheets créées sont partagées avec votre compte Google
- Vous pouvez les modifier manuellement si besoin
- Les données TSV importées respectent le formatage original
- Les nouvelles Sheets sont vides sauf si import réussi
- Pour recréer une Sheet : la supprimer d'abord, puis relancer le script

## 🔐 Sécurité

- ⚠️ **Ne pas committer** `credentials.json` ou `token.json` dans Git
- Utiliser un `.gitignore` :
  ```
  credentials.json
  token.json
  ```
- Les credentials sont stockés localement (authentification OAuth sécurisée)
