import racine
import inspect
import ast
import math

def print_vert(texte):
    print(f"\033[32m{texte}\033[0m")

def print_rouge(texte):
    print(f"\033[31m{texte}\033[0m")

def print_jaune(texte):
    print(f"\033[93m{texte}\033[0m")

def verifier_racine_base_diverse(methode, nombre, base):
    if base == 2:
        attendu = round(math.sqrt(nombre), racine.PRECISION)
    elif base == 3:
        attendu = round(math.cbrt(nombre), racine.PRECISION)
    elif base == 4:
        attendu = round(math.sqrt(math.sqrt(nombre)), racine.PRECISION)

    obtenu = methode(nombre, base)

    if obtenu == attendu:
        print_vert("Succès")
    else:
        print_rouge("Échec")
        print_rouge(f"     attendu : {attendu}")
        print_rouge(f"      obtenu : {obtenu}")
        global erreur_detecte_partie_2
        erreur_detecte_partie_2 = True

def verifier_racine_carre(methode, nombre):
    attendu = round(math.sqrt(nombre), racine.PRECISION)
    obtenu = methode(nombre)

    if obtenu == attendu:
        print_vert("Succès")
    else:
        print_rouge(f"Échec")
        print_rouge(f"     attendu : {attendu}")
        print_rouge(f"      obtenu : {obtenu}")
        global erreur_detecte_partie_1
        erreur_detecte_partie_1 = True


def obtenir_nombre_instruction_globale(module):
    '''
    Une assignation compte comme 1 operation, une définition de fonction comme 1 également
    '''
    try:
        source = inspect.getsource(module)
        tree = ast.parse(source)

        nodes_a_ignorer = (
            ast.Import,  # import os
            ast.ImportFrom,  # from math import sqrt
            ast.FunctionDef,  # def ma_fonction():
            ast.AsyncFunctionDef  # async def ma_fonction():
        )

        instructions_globales = []

        for node in tree.body:
            # 1. On vérifie si le nœud est dans notre liste d'exclusion
            if isinstance(node, nodes_a_ignorer):
                continue

            # 2. On exclut les Docstrings (qui sont des ast.Expr contenant un ast.Constant string)
            if isinstance(node, ast.Expr) and isinstance(node.value, ast.Constant):
                if isinstance(node.value.value, str):
                    continue

            instructions_globales.append(node)

        return len(instructions_globales)

    except Exception as e:
        print(f"Erreur lors de l'analyse : {e}")
        return False

version = "1.0.3"
print("*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*")
print(f"  SCRIPT DE VALIDATION DES 2 FONCTIONS CALCULANT LA RACINE CARRÉE ({version})")
print()
print("    🤖 ÉTAPE 1 de 3 - Validation de la structure du module racine.py ")
print("*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*\n")

liste_methodes = []
liste_methode_cas_n_possibles = []
fonctions = inspect.getmembers(racine, inspect.isfunction)

if len(fonctions) == 0 :
    print_rouge(f"❌ Aucune fonction détectée dans le module racine")
    exit()
elif len(fonctions) > 2 :
    print_rouge(f"❌ Le module racine doit possèder uniquement 2 fonctions, pas {len(fonctions)}")
    exit()
else :
    if len(fonctions) == 1 :
        print(f"1 fonction détectée :\n")
    else:
        print(f"2 fonctions détectées :\n")
    for f in fonctions:
        print(f"  - Fonction : {f[0]}")  # Nom de la fonction
        liste_methodes.append(f[1])  # La fonction callable

        sig = inspect.signature(f[1])
        compteur_param = 0
        for name, param in sig.parameters.items():
            compteur_param += 1
            print(f"       Paramètre nom : {name:<10}", end="")
            if param.default is inspect.Parameter.empty:
                print(f"      (aucune valeur par défaut)")
                if compteur_param == 2:
                    print_rouge(f"       ❌ Ce paramètre doit posséder une valeur par défaut")
                    exit()
            else:
                print(f"      (valeur par défaut : {param.default})")
                if compteur_param == 1:
                    print_rouge(f"       ❌ Ce paramètre ne doit pas posséder une valeur par défaut")
                    exit()
                liste_methode_cas_n_possibles.append(f[0])
        if len(sig.parameters.items()) == 0:
            print("       Aucun paramètre")
        if len(sig.parameters.items()) > 2:
            print_rouge(f"    ❌ La fonction possède trop de paramètres, elle doit en avoir 2 uniquement!")
            exit()
        if f[1].__doc__ is None:
            print_rouge(f"    ❌ La fonction ne possède pas une documentation sous forme de DOCSTRING!")
            exit()
        print()

try:
    valeur = racine.PRECISION
    print("Le module possède la variable globale PRECISION.")
    if racine.PRECISION < 4 or racine.PRECISION > 14 :
        print_rouge("La variable précision doit posséder une variable entière comprise entre 4 et 14.")
        exit()

except AttributeError:
    print_rouge("❌ Oups, la variable PRECISION est manquante dans le module racine! (elle doit être nommée en majuscule!")
    exit()


if obtenir_nombre_instruction_globale(racine) > 1:
    print()
    print_rouge("❌ Oups, le fichier racine.py doit posséder que vos 2 définitions de fonction et la variable PRECISION")
    print_rouge("   Il doit y avoir aucune autre instruction dans la portée globale.")
    exit()

print()
print("*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*")
print("    🤖 ÉTAPE 2 de 3 - Exécution des tests avec des paramètres valides ")
print("*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*\n")

liste_precisions = [4, 5, 6, 7, 8, 9, 10]
liste_cas_racine_carre = [0, 0.1, 0.2, 0.9, 8, 9, 81, 123, 999]
liste_cas_racine_diverses = [8, 9, 81, 123]

erreur_detecte_partie_2 = False
for methode in liste_methodes:

    for precision in liste_precisions:

        racine.PRECISION = precision  # Modifier la précision du module

        for cas in liste_cas_racine_carre:
            instruction = f"{methode.__name__}({cas})"
            print(f"  {instruction:<50} précision {precision:<2} base par défaut        ", end="")
            verifier_racine_carre(methode, cas)

        if methode.__name__ in liste_methode_cas_n_possibles:
            for base in [2, 3, 4]:
                for cas in liste_cas_racine_diverses:
                    instruction = f"{methode.__name__}({cas})"
                    print(f"  {instruction:<50} précision {precision:<2} base {base}                 ", end="")
                    verifier_racine_base_diverse(methode, cas, base)

print()
print("*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*")
print("🤖 ÉTAPE 3 de 3 - Exécution des tests avec des paramètres invalides ")
print("*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*\n")

erreur_detecte_partie_3 = False
for methode in liste_methodes:

    try:
        instruction = f"{methode.__name__}(-3)"
        print(f"  {instruction:<50}", end="")
        methode(-3)
        print_rouge("Échec")
        print_rouge("La racine négative n'est pas possible (avec base 2), exception non levée.")
        erreur_detecte_partie_3 = True
    except ValueError as e:
        print_vert(f"Succès")

if methode.__name__ in liste_methode_cas_n_possibles:

    for methode in liste_methodes:

        try:
            instruction = f"{methode.__name__}(-4, 4)"
            print(f"  {instruction:<50}", end="")
            methode(-4, 4)
            print_rouge("Échec")
            print_rouge("La racine d'un nombre négatif est possible uniquement avec une base impaire, exception non levée.")
            erreur_detecte_partie_3 = True
        except ValueError as e:
            print_vert("Succès")

        try:
            instruction = f"{methode.__name__}(4, 1.5)"
            print(f"  {instruction:<50}", end="")
            methode(4, 1.5)
            print_rouge("Échec")
            print_rouge("La base doit être supérieure ou égale à 2, exception non levée.")
            erreur_detecte_partie_3 = True
        except ValueError as e:
            print_vert("Succès")
print()

erreur = erreur_detecte_partie_2 or erreur_detecte_partie_3

if len(liste_methodes) == 1:

    if erreur :
        print_rouge("🛑 DES CORRECTIONS SONT NÉCESSAIRES!")
        print_jaune("⚠️ ATTENTION! CERTAINS CAS N'ONT PAS ÉTÉ TESTÉS.")
    else:
        print_vert("   LA PORTION LANCÉE DES TESTS ONT PASSÉS AVEC SUCCÈS.")
        print_jaune("⚠️ ATTENTION! LE TRAVAIL N'EST PAS FINI. CERTAINS CAS N'ONT PAS ÉTÉ TESTÉS.")
    print_jaune("   1 DE VOS 2 FONCTION N'A PAS ENCORE ÉTÉ CODÉE.")

elif len(liste_methodes) == 2:

    if len(liste_methode_cas_n_possibles) == 1 :
        if erreur:
            print_rouge("🛑 DES CORRECTIONS SONT NÉCESSAIRES!")
            print_jaune("⚠️ ATTENTION! CERTAINS CAS N'ONT PAS ÉTÉ TESTÉS.")
        else:
            print_vert("   LA PORTION LANCÉE DES TESTS ONT PASSÉS AVEC SUCCÈS.")
            print_jaune("⚠️ ATTENTION! LE TRAVAIL N'EST PAS FINI. CERTAINS CAS N'ONT PAS ÉTÉ TESTÉS.")
        print_jaune("   1 DE VOS 2 FONCTIONS NE SUPPORTE PAS LES RACINES N (CUBIQUE, 4, etc).")

    elif len(liste_methode_cas_n_possibles) == 0:
        if erreur:
            print_rouge("🛑 DES CORRECTIONS SONT NÉCESSAIRES!")
            print_jaune("⚠️ ATTENTION! CERTAINS CAS N'ONT PAS ÉTÉ TESTÉS.")
        else:
            print_vert("   LA PORTION LANCÉE DES TESTS ONT PASSÉS AVEC SUCCÈS.")
            print_jaune("⚠️ ATTENTION! LE TRAVAIL N'EST PAS FINI. CERTAINS CAS N'ONT PAS ÉTÉ TESTÉS.")
        print_jaune("   VOS 2 FONCTIONS NE SUPPORTENT PAS LES RACINES N (CUBIQUE, 4, etc).")

    elif len(liste_methode_cas_n_possibles) == 2:
        if erreur:
            print_rouge("🛑 DES CORRECTIONS SONT NÉCESSAIRES!")
        else:
            print_vert("*** ✅ TOUS LES TESTS ONT PASSÉS AVEC SUCCÈS 🎉 BRAVO! ***")