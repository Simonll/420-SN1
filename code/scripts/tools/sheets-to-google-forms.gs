// =================================================================
// Google Apps Script: Convertir les Google Sheets en Google Forms
// =================================================================
// 
// USAGE:
// 1. Ouvrir Google Apps Script Editor (tools.google.com/apps/script)
// 2. Coller ce code dans l'éditeur
// 3. Remplacer ID_DOSSIER par ton dossier Google Drive
// 4. Exécuter creerFormulairesPourToutLeDossier()
// 5. Autoriser les permissions Google
//
// =================================================================

// =================================================================
// 1. INSÈRE L'ID DE TON DOSSIER GOOGLE DRIVE JUSTE EN DESSOUS :
// =================================================================
var ID_DOSSIER = "1Rsl7KH0OFiRLm8DqQsGs7KJVVUi85Ja2"; 

/**
 * Cherche un formulaire existant avec le titre spécifié
 * @param {string} titre - Le titre du formulaire à chercher
 * @return {string|null} - L'ID du formulaire trouvé, ou null
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
 * Affiche une alerte avec options
 * @param {string} titre - Titre de l'alerte
 * @param {string} message - Message à afficher
 * @return {string} - "continuer" ou "passer"
 */
function afficherAlerte(titre, message) {
  // Note: Google Apps Script n'a pas de UI.alert() standard
  // On utilise Logger pour montrer le message et une interface manuelle
  Logger.log("⚠️ ATTENTION : " + titre);
  Logger.log(message);
  Logger.log("ACTION REQUISE : Vérifier les logs et décider manuellement");
  return "manuellement";
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
    
    var nomItem = form.addTextItem();
    nomItem.setTitle("Votre Nom et Prénom");
    nomItem.setRequired(true);
    
    var nbCree = 0;
    
    // Création des questions pour ce fichier
    for (var i = 2; i < data.length; i++) {
      var question = data[i][0];
      var optA = data[i][1];
      var optB = data[i][2];
      var optC = data[i][3];
      var optD = data[i][4];
      var reponse = String(data[i][5] || "").trim().toUpperCase();

      if (!question || question.toString().trim() === "") continue;

      var options = [optA, optB, optC, optD].filter(function (o) {
        return o !== null && o !== undefined && String(o).trim() !== "";
      });
      
      if (options.length === 0) continue;

      var questionItem = form.addMultipleChoiceItem();
      questionItem.setTitle(String(question)).setRequired(true);

      var indexLettre = "ABCD".indexOf(reponse);
      var choix = [];

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
    
    // On sauvegarde les infos de ce formulaire pour le bilan final
    nbFichiersTraites++;
    nbNouvelsFormulaires++;
    resultats.push({
      nom: fichier.getName(),
      editUrl: form.getEditUrl(),
      pubUrl: form.getPublishedUrl(),
      questions: nbCree,
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
