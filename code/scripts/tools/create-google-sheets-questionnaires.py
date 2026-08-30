#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Create Google Sheets for Questionnaires and Upload TSV Data

Ce script crée automatiquement des Google Sheets pour chaque questionnaire
et y importe les données TSV.

PRÉREQUIS :
1. Google Cloud Project avec accès à Google Sheets API et Google Drive API
2. Fichier de credentials JSON (credentials.json)
3. Installer : pip install google-auth-oauthlib google-auth-httplib2 google-api-python-client

USAGE :
  python3 create-google-sheets-questionnaires.py [--folder-id FOLDER_ID]

OPTIONS :
  --folder-id FOLDER_ID   ID du dossier Google Drive où créer les Sheets
                          (par défaut : demande interactivement)
"""

import os
import sys
import argparse
from pathlib import Path
from typing import Optional, Dict, List

try:
    from google.auth.transport.requests import Request
    from google.oauth2.service_account import Credentials
    from google.oauth2 import service_account
    from google.auth.oauthlib.flow import InstalledAppFlow
    from google.oauth2.credentials import Credentials
    from googleapiclient.discovery import build
    from googleapiclient.errors import HttpError
except ImportError:
    print("❌ Erreur : Google API client non installée")
    print("Installation : pip install google-auth-oauthlib google-auth-httplib2 google-api-python-client")
    sys.exit(1)


class QuestionnaireSheetCreator:
    """Crée des Google Sheets pour les questionnaires et importe les données."""
    
    SCOPES = [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/spreadsheets'
    ]
    
    def __init__(self, credentials_file: str = 'credentials.json'):
        """Initialise avec les credentials."""
        self.credentials_file = credentials_file
        self.credentials = self._authenticate()
        self.drive_service = build('drive', 'v3', credentials=self.credentials)
        self.sheets_service = build('sheets', 'v4', credentials=self.credentials)
    
    def _authenticate(self):
        """Authentifie avec Google API."""
        creds = None
        token_file = 'token.json'
        
        # Si token.json existe, on l'utilise
        if os.path.exists(token_file):
            creds = Credentials.from_authorized_user_file(token_file, self.SCOPES)
        
        # Sinon, on crée un nouveau token
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                flow = InstalledAppFlow.from_client_secrets_file(
                    self.credentials_file, self.SCOPES)
                creds = flow.run_local_server(port=0)
            
            # Sauvegarder le token pour la prochaine fois
            with open(token_file, 'w') as token:
                token.write(creds.to_json())
        
        return creds
    
    def create_sheet(self, title: str, folder_id: Optional[str] = None) -> str:
        """Crée une Google Sheet avec le titre donné."""
        try:
            spreadsheet = {
                'properties': {'title': title}
            }
            result = self.sheets_service.spreadsheets().create(
                body=spreadsheet,
                fields='spreadsheetId'
            ).execute()
            
            sheet_id = result.get('spreadsheetId')
            
            # Déplacer dans le dossier si spécifié
            if folder_id:
                file = self.drive_service.files().get(
                    fileId=sheet_id,
                    fields='parents'
                ).execute()
                
                previous_parents = ",".join(file.get('parents', []))
                
                self.drive_service.files().update(
                    fileId=sheet_id,
                    addParents=folder_id,
                    removeParents=previous_parents,
                    fields='id, parents'
                ).execute()
            
            return sheet_id
        except HttpError as e:
            print(f"❌ Erreur lors de la création de la Sheet : {e}")
            return None
    
    def upload_tsv_data(self, sheet_id: str, tsv_file: str) -> bool:
        """Upload les données TSV dans la Sheet."""
        try:
            # Lire le fichier TSV
            with open(tsv_file, 'r', encoding='utf-8') as f:
                lines = f.readlines()
            
            # Parser TSV
            data = []
            for line in lines:
                # Gérer les guillemets et \n
                row = self._parse_tsv_line(line)
                data.append(row)
            
            # Insérer les données
            values = data
            body = {'values': values}
            
            result = self.sheets_service.spreadsheets().values().update(
                spreadsheetId=sheet_id,
                range='A1',
                valueInputOption='RAW',
                body=body
            ).execute()
            
            return True
        except Exception as e:
            print(f"❌ Erreur lors de l'upload TSV : {e}")
            return False
    
    def _parse_tsv_line(self, line: str) -> List[str]:
        """Parse une ligne TSV en tenant compte des guillemets et échappements."""
        line = line.rstrip('\n\r')
        
        # Algorithme simple : split par \t, mais respecter les guillemets
        row = []
        current = ""
        in_quotes = False
        i = 0
        
        while i < len(line):
            char = line[i]
            
            if char == '"' and not in_quotes and current == "":
                # Début d'une valeur entre guillemets
                in_quotes = True
            elif char == '"' and in_quotes:
                # Fin de guillemets
                in_quotes = False
            elif char == '\t' and not in_quotes:
                # Séparateur TSV (hors guillemets)
                row.append(current)
                current = ""
            else:
                current += char
            
            i += 1
        
        row.append(current)
        return row
    
    def process_questionnaire(self, tsv_file: str, folder_id: Optional[str] = None) -> Optional[str]:
        """Crée une Sheet et upload les données TSV."""
        # Déterminer le titre
        filename = Path(tsv_file).stem
        # Format attendu : Questionnaire-R3-import-google-forms
        title = filename.replace('-import-google-forms', '')
        
        print(f"📝 Création de la Sheet : {title}")
        sheet_id = self.create_sheet(title, folder_id)
        
        if not sheet_id:
            return None
        
        print(f"📤 Upload des données TSV...")
        success = self.upload_tsv_data(sheet_id, tsv_file)
        
        if success:
            sheet_url = f"https://docs.google.com/spreadsheets/d/{sheet_id}"
            print(f"✅ Sheet créée : {sheet_url}")
            return sheet_id
        else:
            print(f"❌ Erreur lors de l'upload")
            return None


def main():
    parser = argparse.ArgumentParser(
        description='Crée des Google Sheets pour les questionnaires'
    )
    parser.add_argument(
        '--folder-id',
        help='ID du dossier Google Drive cible',
        default=None
    )
    parser.add_argument(
        '--tsv-dir',
        help='Répertoire contenant les fichiers TSV',
        default=str(Path.home() / 'notes-vault/420-SN1/Automne-2026')
    )
    
    args = parser.parse_args()
    
    # Vérifier les credentials
    if not os.path.exists('credentials.json'):
        print("❌ Erreur : credentials.json non trouvé")
        print("\nPour configurer :")
        print("1. Aller sur https://console.cloud.google.com")
        print("2. Créer un projet")
        print("3. Activer Google Sheets API et Google Drive API")
        print("4. Créer une clé d'authentification (OAuth 2.0)")
        print("5. Télécharger en tant que JSON et renommer en credentials.json")
        sys.exit(1)
    
    # Créer le service
    creator = QuestionnaireSheetCreator('credentials.json')
    
    # Chercher tous les fichiers TSV
    tsv_dir = Path(args.tsv_dir)
    tsv_files = sorted(tsv_dir.glob('Questionnaire-R*-import-google-forms.tsv'))
    
    if not tsv_files:
        print(f"❌ Aucun fichier TSV trouvé dans {tsv_dir}")
        sys.exit(1)
    
    print(f"🔍 Trouvé {len(tsv_files)} fichiers TSV")
    print(f"📁 Répertoire : {tsv_dir}")
    if args.folder_id:
        print(f"📂 Dossier destination : {args.folder_id}")
    print("")
    
    # Demander le folder ID si non fourni
    if not args.folder_id:
        print("📌 ID du dossier Google Drive cible (laisser vide pour créer à la racine) :")
        args.folder_id = input().strip() or None
    
    # Traiter chaque fichier TSV
    results = {}
    for tsv_file in tsv_files:
        print(f"\n📄 Traitement : {tsv_file.name}")
        sheet_id = creator.process_questionnaire(str(tsv_file), args.folder_id)
        
        if sheet_id:
            results[tsv_file.stem] = sheet_id
    
    # Afficher le résumé
    print("\n" + "=" * 50)
    print("✅ RÉSUMÉ")
    print("=" * 50)
    print(f"Sheets créées : {len(results)}")
    print("")
    for name, sheet_id in results.items():
        url = f"https://docs.google.com/spreadsheets/d/{sheet_id}"
        print(f"📊 {name}")
        print(f"   {url}")
    
    print("\n💡 Prochaines étapes :")
    print("1. Ouvrir chaque Sheet")
    print("2. Vérifier que les données sont bien importées")
    print("3. Utiliser sheets-to-google-forms.gs pour créer les formulaires")
    print("4. Remplacer ID_DOSSIER dans le script GAS par l'ID du dossier")


if __name__ == '__main__':
    main()
