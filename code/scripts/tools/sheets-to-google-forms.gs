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

function creerFormulairesPourToutLeDossier() {
  // 2. Cibler le dossier et récupérer uniquement les Google Sheets
  var dossier = DriveApp.getFolderById(ID_DOSSIER);
  var fichiers = dossier.getFilesByType(MimeType.GOOGLE_SHEETS);
  
  var nbFichiersTraites = 0;
  var resultats = [];
  
  // 3. Boucle : on passe au fichier suivant tant qu'il y en a
  while (fichiers.hasNext()) {
    var fichier = fichiers.next();
    var ss = SpreadsheetApp.openById(fichier.getId());
    var sheet = ss.getSheets()[0]; // On prend le premier onglet de chaque fichier
    var data = sheet.getDataRange().getValues();
    
    var formTitle = sheet.getName() + " - Auto-evaluation";
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
    resultats.push({
      nom: fichier.getName(),
      editUrl: form.getEditUrl(),
      pubUrl: form.getPublishedUrl(),
      questions: nbCree
    });
  }
  
  // 4. Afficher le bilan global dans le journal
  Logger.log("=========================================");
  Logger.log("✅ TERMINÉ ! " + nbFichiersTraites + " fichiers convertis.");
  Logger.log("=========================================");
  
  for (var k = 0; k < resultats.length; k++) {
    Logger.log("📄 FICHIER : " + resultats[k].nom);
    Logger.log("Questions : " + resultats[k].questions);
    Logger.log("🔗 Lien Édition : " + resultats[k].editUrl);
    Logger.log("🔗 Lien Élèves  : " + resultats[k].pubUrl);
    Logger.log("-----------------------------------------");
  }
}
