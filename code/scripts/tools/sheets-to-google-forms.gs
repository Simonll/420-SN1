// =================================================================
// Google Apps Script: Convertir les Google Sheets en Google Forms
// VERSION AMÉLIORÉE : Code en description pour meilleur affichage
// =================================================================
// 
// USAGE:
// 1. Ouvrir Google Apps Script (tools.google.com/apps/script)
// 2. Coller ce code dans l'éditeur
// 3. Remplacer ID_DOSSIER par ton dossier Google Drive
// 4. Exécuter creerFormulairesPourToutLeDossier()
// 5. Autoriser les permissions Google
//
// CHANGEMENTS PAR RAPPORT À LA V1 :
// - Le code est mis dans la DESCRIPTION de la question (mieux affiché)
// - La question est nettoyée (sans "Après ce code")
// - Support pour code multi-ligne dans la description
// =================================================================

// =================================================================
// 1. INSÈRE L'ID DE TON DOSSIER GOOGLE DRIVE JUSTE EN DESSOUS :
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
 * Nettoie la question : retire "Après ce code" et autres préfixes
 */
function nettoyerQuestion(question) {
  // Retirer "Après ce code, " ou "Après ce code:"
  question = question.replace(/^Après ce code[,:]\s*/i, "");
  
  // Retirer "Soit le code suivant:" ou "Soit le code :"
  question = question.replace(/^Soit le code[:\s]*/i, "");
  
  // Trim
  question = question.trim();
  
  return question;
}

/**
 * Convertit un code brut en format lisible pour Google Forms
 * Remplace les \n par des vrais retours à la ligne
 */
function formatCodeForDescription(codeString) {
  if (!codeString || codeString.trim() === "") {
    return "";
  }
  
  // Remplacer \n littéral par des vrais retours à la ligne
  var code = codeString.replace(/\\n/g, "\n");
  
  // Formater avec un préfixe pour la clarté
  var formatted = "```\n" + code + "\n```";
  
  return formatted;
}

function creerFormulairesPourToutLeDossier() {
  // 2. Cibler le dossier et récupérer uniquement les Google Sheets
  var dossier = DriveApp.getFolderById(ID_DOSSIER);
  var fichiers = dossier.getFilesByType(MimeType.GOOGLE_SHEETS);
  
  var nbFichiersTraites = 0;
  var nbFormulairesExistants = 0;
  var nbNouvelsFormulaires = 0;
  var resultats = [];
  var avertissements = [];
  
  // 3. Boucle : on passe au fichier suivant tant qu'il y en a
  while (fichiers.hasNext()) {
    var fichier = fichiers.next();
    var ss = SpreadsheetApp.openById(fichier.getId());
    var sheet = ss.getSheets()[0]; // On prend le premier onglet de chaque fichier
    var data = sheet.getDataRange().getValues();
    
    var formTitle = sheet.getName() + " - Auto-evaluation";
    
    // ===== VÉRIFICATION : formulaire existant ? =====
    var formulaireExistantId = trouverFormulaireExistant(formTitle);
    
    if (formulaireExistantId) {
      // Le formulaire existe déjà
      nbFormulairesExistants++;
      var urlExistant = "https://docs.google.com/forms/d/" + formulaireExistantId + "/edit";
      var warning = {
        fichier: fichier.getName(),
        titre: formTitle,
        action: "⚠️ FORMULAIRE EXISTANT",
        url: urlExistant,
        message: "Ce formulaire existe déjà. Vérifier avant de recréer."
      };
      avertissements.push(warning);
      
      Logger.log("");
      Logger.log("⚠️ ATTENTION : Formulaire existant détecté");
      Logger.log("Fichier : " + fichier.getName());
      Logger.log("Titre : " + formTitle);
      Logger.log("URL Existant : " + urlExistant);
      Logger.log("DÉCISION : Vérifiez manuellement");
      Logger.log("  - Si vous voulez recréer → supprimez le formulaire et relancez");
      Logger.log("  - Si vous voulez garder → continuez sans action");
      Logger.log("");
      
      continue; // Passer au fichier suivant (ne pas créer de doublons)
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
    
    // Création des questions pour ce fichier
    // Format attendu des colonnes :
    // [0] = CODE (peut être vide)
    // [1] = QUESTION
    // [2] = OPT_A
    // [3] = OPT_B
    // [4] = OPT_C
    // [5] = OPT_D
    // [6] = REPONSE (A, B, C, ou D)
    
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
        continue; // Besoin au moins 2 options
      }

      // Nettoyer la question
      var questionNettoyee = nettoyerQuestion(question);

      // Créer l'item de question
      var questionItem = form.addMultipleChoiceItem();
      questionItem.setTitle(questionNettoyee).setRequired(true);

      // ===== AJOUTER LE CODE EN DESCRIPTION =====
      if (codeBlock && codeBlock !== "") {
        var codeFormate = formatCodeForDescription(codeBlock);
        questionItem.setHelpText("Code:\n" + codeFormate);
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
  
  // Afficher les avertissements
  if (avertissements.length > 0) {
    Logger.log("");
    Logger.log("⚠️ AVERTISSEMENTS (Formulaires existants):");
    Logger.log("=========================================");
    for (var m = 0; m < avertissements.length; m++) {
      Logger.log(avertissements[m].action + " - " + avertissements[m].fichier);
      Logger.log("Titre : " + avertissements[m].titre);
      Logger.log("URL : " + avertissements[m].url);
      Logger.log("Message : " + avertissements[m].message);
      Logger.log("-----------------------------------------");
    }
  }
  
  Logger.log("");
  Logger.log("ℹ️ Consultez les logs pour plus de détails (View → Logs)");
}
