// =================================================================
// Google Apps Script: Convertir les Google Sheets en Google Forms
// VERSION V5 : Sélection manuelle du questionnaire
// =================================================================

var ID_DOSSIER = "1Rsl7KH0OFiRLm8DqQsGs7KJVVUi85Ja2"; 

/**
 * Cherche un formulaire existant avec le titre spécifié
 */
function trouverFormulaireExistant(titre) {
  try {
    var files = DriveApp.getFilesByType(MimeType.GOOGLE_FORMS);
    while (files.hasNext()) {
      var file = files.next();
      if (file.getName() === titre) {
        return file.getId();
      }
    }
  } catch (e) {
    Logger.log("Erreur lors de la recherche : " + e);
  }
  return null;
}

/**
 * Nettoie et normalise la question
 */
function creerTitreQuestion(question, codeBlock) {
  var titreNettoyé = question.trim();
  
  // Retirer les préfixes inutiles si présents
  titreNettoyé = titreNettoyé.replace(/^Après ce code[,:]\s*/i, "");
  titreNettoyé = titreNettoyé.replace(/^Soit le code[:\s]*/i, "");
  
  return titreNettoyé;
}

/**
 * Convertit un code brut en format lisible pour Google Forms
 */
function formatCodeForDescription(codeString) {
  if (!codeString || codeString.trim() === "") {
    return "";
  }
  
  // Remplacer \n littéral par des vrais retours à la ligne
  var code = codeString.replace(/\\n/g, "\n");
  
  // Formater avec backticks
  var formatted = "```\n" + code + "\n```";
  
  return formatted;
}

/**
 * NOUVELLE FONCTION : Créer un formulaire à partir d'une Sheet spécifique
 */
function creerFormulaireDepuisSheet() {
  var ui = SpreadsheetApp.getUi();
  
  // Afficher un message d'instruction
  ui.alert(
    '📋 CRÉATION DE FORMULAIRE\n\n' +
    'Cette fonction lit les données de la Sheet courante\n' +
    'et crée un Google Form avec auto-correction.\n\n' +
    'Format attendu des colonnes :\n' +
    'A: CODE (code Python)\n' +
    'B: QUESTION\n' +
    'C: OPTION A\n' +
    'D: OPTION B\n' +
    'E: OPTION C\n' +
    'F: OPTION D\n' +
    'G: REPONSE (A, B, C ou D)\n\n' +
    'Cliquez OK pour continuer...',
    ui.ButtonSet.OK_CANCEL
  );
  
  // Récupérer la Sheet courante
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheets()[0];
  var data = sheet.getDataRange().getValues();
  
  var formTitle = sheet.getName() + " - Auto-evaluation";
  
  // ===== VÉRIFICATION : formulaire existant ? =====
  var formulaireExistantId = trouverFormulaireExistant(formTitle);
  
  if (formulaireExistantId) {
    var urlExistant = "https://docs.google.com/forms/d/" + formulaireExistantId + "/edit";
    
    var response = ui.alert(
      '⚠️ FORMULAIRE EXISTANT\n\n' +
      'Un formulaire avec ce nom existe déjà :\n' +
      formTitle + '\n\n' +
      'Voulez-vous :\n' +
      '- OK : Continuer et créer un nouveau formulaire\n' +
      '- ANNULER : Arrêter',
      ui.ButtonSet.OK_CANCEL
    );
    
    if (response == ui.Button.CANCEL) {
      ui.alert('❌ Opération annulée.\n\nFormulaire existant : ' + urlExistant);
      return;
    }
  }
  
  // ===== CRÉER NOUVEAU FORMULAIRE =====
  var form = FormApp.create(formTitle);
  form.setIsQuiz(true);
  
  try { form.setRequireLogin(false); } catch (e) {}
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
  
  // Ajouter un champ nom
  var nomItem = form.addTextItem();
  nomItem.setTitle("Votre Nom et Prénom");
  nomItem.setRequired(true);
  
  var nbCree = 0;
  var nbAvecCode = 0;
  var questionsVues = {};
  var erreurs = [];
  
  // Création des questions pour cette Sheet
  for (var i = 1; i < data.length; i++) {
    // Ignorer les lignes d'en-tête
    if (i === 0 && String(data[i][0]).toUpperCase() === "CODE") {
      continue;
    }
    
    var codeBlock = String(data[i][0] || "").trim();
    var question = String(data[i][1] || "").trim();
    var optA = String(data[i][2] || "").trim();
    var optB = String(data[i][3] || "").trim();
    var optC = String(data[i][4] || "").trim();
    var optD = String(data[i][5] || "").trim();
    var reponse = String(data[i][6] || "").trim().toUpperCase();

    // Valider la question
    if (!question || question === "") {
      continue;
    }

    // Collecter les options valides
    var options = [];
    if (optA) options.push(optA);
    if (optB) options.push(optB);
    if (optC) options.push(optC);
    if (optD) options.push(optD);
    
    if (options.length < 2) {
      erreurs.push("Ligne " + (i + 1) + " : besoin au minimum 2 options");
      continue;
    }

    // Créer le titre
    var titreQuestion = creerTitreQuestion(question, codeBlock);
    
    // Gérer les doublons : ajouter un numéro
    var titreOriginal = titreQuestion;
    var compteur = 1;
    while (questionsVues[titreQuestion]) {
      compteur++;
      titreQuestion = titreOriginal + " (" + compteur + ")";
    }
    questionsVues[titreQuestion] = true;

    // Créer l'item de question
    var questionItem = form.addMultipleChoiceItem();
    questionItem.setTitle(titreQuestion).setRequired(true);

    // ===== AJOUTER LE CODE EN DESCRIPTION =====
    if (codeBlock && codeBlock !== "") {
      var codeFormate = formatCodeForDescription(codeBlock);
      questionItem.setHelpText("Code à analyser:\n" + codeFormate);
      nbAvecCode++;
    }

    // ===== CRÉER LES CHOIX =====
    var choix = [];
    var indexLettre = "ABCD".indexOf(reponse);

    for (var j = 0; j < options.length; j++) {
      var isCorrect = (reponse !== "" && j === indexLettre);
      choix.push(questionItem.createChoice(String(options[j]), isCorrect));
    }

    questionItem.setChoices(choix);
    
    // ===== ASSIGNER LES POINTS =====
    if (reponse && indexLettre >= 0 && indexLettre < options.length) {
      questionItem.setPoints(1);
    }

    nbCree++;
  }
  
  // ===== AFFICHER LE RÉSULTAT =====
  var editUrl = form.getEditUrl();
  var pubUrl = form.getPublishedUrl();
  
  var message = 
    '✅ FORMULAIRE CRÉÉ\n\n' +
    'Titre : ' + formTitle + '\n' +
    'Questions : ' + nbCree + '\n' +
    'Questions avec code : ' + nbAvecCode + '\n\n' +
    '🔗 Lien Édition :\n' + editUrl + '\n\n' +
    '🔗 Lien Élèves :\n' + pubUrl;
  
  if (erreurs.length > 0) {
    message += '\n\n⚠️ AVERTISSEMENTS :\n' + erreurs.join('\n');
  }
  
  ui.alert(message);
  
  Logger.log('✅ Formulaire créé : ' + formTitle);
  Logger.log('Questions : ' + nbCree);
  Logger.log('Questions avec code : ' + nbAvecCode);
  Logger.log('Édition : ' + editUrl);
  Logger.log('Élèves : ' + pubUrl);
}

/**
 * ANCIENNE FONCTION : Créer tous les formulaires du dossier (pour compatibilité)
 */
function creerFormulairesPourToutLeDossier() {
  var dossier = DriveApp.getFolderById(ID_DOSSIER);
  var fichiers = dossier.getFilesByType(MimeType.GOOGLE_SHEETS);
  
  var nbFichiersTraites = 0;
  var nbFormulairesExistants = 0;
  var nbNouvelsFormulaires = 0;
  var resultats = [];
  
  while (fichiers.hasNext()) {
    var fichier = fichiers.next();
    var ss = SpreadsheetApp.openById(fichier.getId());
    var sheet = ss.getSheets()[0];
    var data = sheet.getDataRange().getValues();
    
    var formTitle = sheet.getName() + " - Auto-evaluation";
    
    var formulaireExistantId = trouverFormulaireExistant(formTitle);
    
    if (formulaireExistantId) {
      nbFormulairesExistants++;
      Logger.log("⚠️ " + formTitle + " existe déjà");
      continue;
    }
    
    var form = FormApp.create(formTitle);
    form.setIsQuiz(true);
    
    try { form.setRequireLogin(false); } catch (e) {}
    form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
    
    var nomItem = form.addTextItem();
    nomItem.setTitle("Votre Nom et Prénom");
    nomItem.setRequired(true);
    
    var nbCree = 0;
    var nbAvecCode = 0;
    var questionsVues = {};
    
    for (var i = 1; i < data.length; i++) {
      if (i === 0 && String(data[i][0]).toUpperCase() === "CODE") {
        continue;
      }
      
      var codeBlock = String(data[i][0] || "").trim();
      var question = String(data[i][1] || "").trim();
      var optA = String(data[i][2] || "").trim();
      var optB = String(data[i][3] || "").trim();
      var optC = String(data[i][4] || "").trim();
      var optD = String(data[i][5] || "").trim();
      var reponse = String(data[i][6] || "").trim().toUpperCase();

      if (!question || question === "") {
        continue;
      }

      var options = [];
      if (optA) options.push(optA);
      if (optB) options.push(optB);
      if (optC) options.push(optC);
      if (optD) options.push(optD);
      
      if (options.length < 2) {
        continue;
      }

      var titreQuestion = creerTitreQuestion(question, codeBlock);
      
      var titreOriginal = titreQuestion;
      var compteur = 1;
      while (questionsVues[titreQuestion]) {
        compteur++;
        titreQuestion = titreOriginal + " (" + compteur + ")";
      }
      questionsVues[titreQuestion] = true;

      var questionItem = form.addMultipleChoiceItem();
      questionItem.setTitle(titreQuestion).setRequired(true);

      if (codeBlock && codeBlock !== "") {
        var codeFormate = formatCodeForDescription(codeBlock);
        questionItem.setHelpText("Code à analyser:\n" + codeFormate);
        nbAvecCode++;
      }

      var choix = [];
      var indexLettre = "ABCD".indexOf(reponse);

      for (var j = 0; j < options.length; j++) {
        var isCorrect = (reponse !== "" && j === indexLettre);
        choix.push(questionItem.createChoice(String(options[j]), isCorrect));
      }

      questionItem.setChoices(choix);
      
      if (reponse && indexLettre >= 0 && indexLettre < options.length) {
        questionItem.setPoints(1);
      }

      nbCree++;
    }
    
    nbFichiersTraites++;
    nbNouvelsFormulaires++;
    resultats.push({
      nom: fichier.getName(),
      editUrl: form.getEditUrl(),
      pubUrl: form.getPublishedUrl(),
      questions: nbCree,
      avecCode: nbAvecCode
    });
  }
  
  Logger.log("");
  Logger.log("✅ EXÉCUTION TERMINÉE");
  Logger.log("Fichiers traités : " + nbFichiersTraites);
  Logger.log("Nouveaux formulaires : " + nbNouvelsFormulaires);
  Logger.log("Formulaires existants : " + nbFormulairesExistants);
  Logger.log("");
  
  for (var k = 0; k < resultats.length; k++) {
    Logger.log("✅ " + resultats[k].nom);
    Logger.log("Questions : " + resultats[k].questions);
    Logger.log("Questions avec code : " + resultats[k].avecCode);
    Logger.log("Édition : " + resultats[k].editUrl);
    Logger.log("Élèves : " + resultats[k].pubUrl);
    Logger.log("---");
  }
}
