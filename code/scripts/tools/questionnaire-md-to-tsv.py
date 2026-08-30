#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Questionnaire MD to TSV Converter
Transforme les fichiers Questionnaire-RX.md en Questionnaire-RX-import-google-forms.tsv

Format d'entrée (Markdown) :
    **Question N** — Après ce code, que s'affiche ?
    ```
    def double(x):
        return x * 2
    print(double(4))
    ```
    - A) 2
    - B) 4
    - C) 6
    - D) 8

Format de sortie (TSV) :
    CODE\tQUESTION\tOPT_A\tOPT_B\tOPT_C\tOPT_D\tREPONSE
    def double(x):\n    return x * 2\nprint(double(4))\t"Après ce code, que s'affiche ?"\t2\t4\t6\t8\tD
"""

import re
import sys
from pathlib import Path


def extract_code_block(text):
    """
    Extrait un bloc de code entre ``` et retourne le code et le reste du texte.
    
    Returns:
        tuple: (code, remaining_text) où code est le contenu du bloc (ou vide), 
               remaining_text est le reste après le bloc
    """
    # Chercher le pattern ```...```
    match = re.search(r'```\n(.*?)\n```', text, re.DOTALL)
    
    if match:
        code = match.group(1).strip()
        # Retirer le bloc du texte
        remaining = text[:match.start()] + text[match.end():]
        return code, remaining
    
    return "", text


def extract_question_and_options(text):
    """
    Extrait la question et les options (A, B, C, D) du texte.
    
    Returns:
        tuple: (question, options_dict) où options_dict = {'A': '...', 'B': '...', etc}
               ou (None, None) si le format n'est pas reconnu
    """
    # Chercher le pattern **Question N** — ...
    question_match = re.search(r'\*\*Question \d+\*\*\s*[—–]\s*([^\n]+)', text)
    
    if not question_match:
        return None, None
    
    question = question_match.group(1).strip()
    
    # Extraire les options A, B, C, D
    options = {}
    
    # Chercher les lignes avec - A) ..., - B) ..., etc
    option_pattern = r'^-\s*([A-D])\)\s*(.+)$'
    
    for line in text.split('\n'):
        match = re.match(option_pattern, line)
        if match:
            letter = match.group(1)
            option_text = match.group(2).strip()
            # Retirer les backticks si présents
            option_text = option_text.replace('`', '')
            options[letter] = option_text
    
    if len(options) < 4:
        # Il manque des options
        return question, None
    
    return question, options


def find_correct_answer(text):
    """
    Cherche la bonne réponse dans le texte.
    Heuristique : chercher après "Réponse correcte :" ou simplement "Bonne réponse"
    
    Returns:
        str: La lettre de la bonne réponse (A, B, C, D) ou ""
    """
    # Chercher explicitement la réponse dans le texte
    answer_pattern = r'[Rr]éponse\s*(?:correcte)?\s*:\s*([A-D])|[Bb]onne\s+réponse\s*:\s*([A-D])'
    match = re.search(answer_pattern, text)
    
    if match:
        return match.group(1) or match.group(2)
    
    return ""


def parse_questionnaire(md_content):
    """
    Parse le contenu du fichier Questionnaire MD et retourne une liste de questions.
    
    Returns:
        list: Liste de dict {'code': '...', 'question': '...', 'options': {...}, 'answer': 'A'}
    """
    questions = []
    
    # Splitter par "**Question N**"
    question_blocks = re.split(r'(\*\*Question \d+\*\*)', md_content)
    
    # Reconstruire les blocs (on a [préambule, **Q1**, contenu1, **Q2**, contenu2, ...])
    i = 1
    while i < len(question_blocks):
        if i + 1 < len(question_blocks):
            question_header = question_blocks[i]
            question_content = question_blocks[i + 1]
            
            # Chercher le code
            code, text_without_code = extract_code_block(question_content)
            
            # Chercher la question et les options
            full_question_text = question_header + question_content
            question, options = extract_question_and_options(full_question_text)
            
            # Chercher la réponse correcte
            answer = find_correct_answer(full_question_text)
            
            if question and options and len(options) == 4:
                questions.append({
                    'code': code,
                    'question': question,
                    'options': options,
                    'answer': answer
                })
        
        i += 2
    
    return questions


def escape_tsv_field(text):
    """
    Échappe les caractères spéciaux pour TSV (retours à la ligne, tabulations, guillemets).
    """
    if text is None:
        return ""
    
    text = str(text)
    
    # Remplacer les retours à la ligne par \n (littéral)
    text = text.replace('\n', '\\n')
    
    # Remplacer les tabulations par \t (littéral)
    text = text.replace('\t', '\\t')
    
    # Remplacer les guillemets doubles
    text = text.replace('"', '""')
    
    # Entourer de guillemets si contient des caractères spéciaux
    if '\t' in text or '\n' in text or '"' in text or '\r' in text:
        text = f'"{text}"'
    
    return text


def generate_tsv(questions):
    """
    Génère le contenu TSV à partir de la liste de questions.
    """
    lines = []
    
    # Header
    lines.append("CODE\tQUESTION\tA\tB\tC\tD\tREPONSE")
    
    # Rows
    for q in questions:
        code = escape_tsv_field(q['code'])
        question = escape_tsv_field(q['question'])
        opt_a = escape_tsv_field(q['options'].get('A', ''))
        opt_b = escape_tsv_field(q['options'].get('B', ''))
        opt_c = escape_tsv_field(q['options'].get('C', ''))
        opt_d = escape_tsv_field(q['options'].get('D', ''))
        answer = q['answer']
        
        line = f"{code}\t{question}\t{opt_a}\t{opt_b}\t{opt_c}\t{opt_d}\t{answer}"
        lines.append(line)
    
    return '\n'.join(lines)


def convert_md_to_tsv(input_path, output_path):
    """
    Convertit un fichier Questionnaire-RX.md en Questionnaire-RX-import-google-forms.tsv
    """
    # Lire le fichier MD
    with open(input_path, 'r', encoding='utf-8') as f:
        md_content = f.read()
    
    # Parser les questions
    questions = parse_questionnaire(md_content)
    
    # Générer le TSV
    tsv_content = generate_tsv(questions)
    
    # Écrire le fichier TSV
    with open(output_path, 'w', encoding='utf-8', newline='') as f:
        f.write(tsv_content)
    
    return len(questions)


def main():
    """Point d'entrée principal."""
    if len(sys.argv) < 2:
        print("Usage: python questionnaire-md-to-tsv.py <input.md> [output.tsv]")
        print("\nExemple:")
        print("  python questionnaire-md-to-tsv.py Questionnaire-R3.md Questionnaire-R3-import-google-forms.tsv")
        sys.exit(1)
    
    input_path = Path(sys.argv[1])
    
    # Déterminer le chemin de sortie
    if len(sys.argv) >= 3:
        output_path = Path(sys.argv[2])
    else:
        # Générer un nom de sortie basé sur l'entrée
        output_path = input_path.parent / input_path.name.replace('.md', '-import-google-forms.tsv')
    
    # Vérifier que le fichier d'entrée existe
    if not input_path.exists():
        print(f"❌ Erreur : Le fichier '{input_path}' n'existe pas.")
        sys.exit(1)
    
    try:
        print(f"📖 Lecture du fichier : {input_path}")
        nb_questions = convert_md_to_tsv(input_path, output_path)
        print(f"✅ Conversion terminée : {nb_questions} questions extraites")
        print(f"📝 TSV généré : {output_path}")
        print(f"💾 Fichier prêt pour import Google Forms")
    except Exception as e:
        print(f"❌ Erreur lors de la conversion : {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()
