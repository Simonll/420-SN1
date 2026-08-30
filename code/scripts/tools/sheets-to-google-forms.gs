// =================================================================
// Google Apps Script: Convertir les Google Sheets en Google Forms
// VERSION V4 : Formulation standard + code en description
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
 * Remplace les formulations génériques par la standard
 */
function creerTitreQuestion(question, codeBlock) {
  // Retirer les préfixes "Après ce code", "Soit le code", etc.
  var titreNettoyé = question.replace(/^Après ce code[,:]\s*/i, "");
  titreNettoyé = titreNettoyé.replace(/^Soit le code[:\s]*/i, "");
  titreNettoyé = titreNettoyé.trim();
  
  // SI un code existe, utiliser la formulation standard
  if (codeBlock && codeBlock.trim() !== "") {
    // Remplacer les formulations génériques
    if (/^que s'affiche\s*\?/i.test(titreNettoyé)) {
      titreNettoyé = "Quel est le résultat final du code suivant ?";
    }
    else if (/^que vaut/i.test(titreNettoyé)) {
      titreNettoyé = "Quel est le résultat final du code suivant ?";
    }
    else if (/^soit le code/i.test(titreNettoyé)) {
      titreNettoyé = "Quel est le résultat final du code suivant ?";
    }
    // Si le titre commence par la formulation standard, laisser tel quel
    else if (/^quel est/i.test(titreNettoyé)) {
      // Garder tel quel
    }
    else if (titreNettoyé.length < 30) {
      // Pour les titres courts sans formulation standard,
      // préfixer avec la formulation standard
      titreNettoyé = "Quel est le résultat final du code suivant ? (" + titreNettoyé + ")";
    }
  }
  
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

function creerFormulairesPourToutLeDossier() {
  var dossier = DriveApp.getFolderById(ID_DOSSIER);
  var fichiers = dossier.getFilesByType(MimeType.GOOGLE_SHEETS);
  
  var nbFichiersTraites = 0;
  var nbFormulairesExistants = 0;
  var nbNouvelsFormulaires = 0;
  var resultats = [];
  var avertissements = [];
  
  while (fichiers.hasNext()) {
    var fichier = fichiers.next();
    var ss = SpreadsheetApp.openById(fichier.getId());
    var sheet = ss.getSheets()[0];
    var data = sheet.getDataRange().getValues();
    
    var formTitle = sheet.getName() + " - Auto-evaluation";
    
    // ===== VÉRIFICATION : formulaire existant ? =====
    var formulaireExistantId = trouverFormulaireExistant(formTitle);
    
    if (formulaireExistantId) {
      nbFormulairesExistants++;
      var urlExistant = "https://docs.google.com/forms/d/" + formulaireExistantId + "/edit";
      
      Logger.log("");
      Logger.log("⚠️ ATTENTION : Formulaire existant détecté");
      Logger.log("Fichier : " + fichier.getName());
      Logger.log("Titre : " + formTitle);
      Logger.log("URL Existant : " + urlExistant);
      Logger.log("");
      
      continue;
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
    var questionsVues = {}; // Pour tracker les doublons
    
    // Création des questions pour ce fichier
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
        continue;
      }

      // Créer le titre (avec formulation standard)
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
    
    // On sauvegarde les infos de ce formulaire pour le bilan final
    nbFichiersTraites++;
    nbNouvelsFormulaires++;
    resultats.push({
      nom: fichier.getName(),
      editUrl: form.getEditUrl(),
      pubUrl: form.getPublishedUrl(),
      questions: nbCree,
      avecCode: nbAvecCode,
      statut: "✅ CRÉÉ"
    });
  }
  
  // ===== AFFICHER LE BILAN GLOBAL =====
  Logger.log("");
  Logger.log("=========================================");
  Logger.log("✅ EXÉCUTION TERMINÉE");
  Logger.log("=========================================");
  Logger.log("Fichiers traités : " + nbFichiersTraites);
  Logger.log("Nouveaux formulaires : " + nbNouvelsFormulaires);
  Logger.log("Formulaires existants détectés : " + nbFormulairesExistants);
  Logger.log("=========================================");
  Logger.log("");
  
  // Afficher les détails des formulaires créés
  if (resultats.length > 0) {
    Logger.log("FORMULAIRES CRÉÉS :");
    Logger.log("-----------------------------------------");
    for (var k = 0; k < resultats.length; k++) {
      Logger.log(resultats[k].statut + " FICHIER : " + resultats[k].nom);
      Logger.log("Questions : " + resultats[k].questions);
      Logger.log("Questions avec code : " + resultats[k].avecCode);
      Logger.log("🔗 Lien Édition : " + resultats[k].editUrl);
      Logger.log("🔗 Lien Élèves  : " + resultats[k].pubUrl);
      Logger.log("-----------------------------------------");
    }
  }
  
  Logger.log("");
  Logger.log("ℹ️ Consultez les logs pour plus de détails (View → Logs)");
}
