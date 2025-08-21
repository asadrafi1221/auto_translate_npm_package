const { askQuestion, installDependencies } = require("./cli.commands.js");
const { createDirectory,  createNewFile, manageFiles, listAllFiles, switchActiveFile, updateExistingFile, writeFile } = require("./handlefile.js");
const { scanAndUpdateTranslations, wrapPlainTextWithTranslation, initIgnoreKeys } = require("./i18.logic.js");
const { setupI18nStructure } = require("./i18integration.js");
const { showBanner, showUsage, showImportAlert } = require("./logs.js");
const { selectFilesToScan } = require("./main.funtions.js");

module.exports = {
  askQuestion,
  showBanner,
  showUsage,
  showImportAlert,
  createDirectory,
  writeFile,
  createNewFile,
  manageFiles,
  listAllFiles,
  switchActiveFile,
  updateExistingFile,
  setupI18nStructure,
  installDependencies,
  scanAndUpdateTranslations,
  wrapPlainTextWithTranslation,
  initIgnoreKeys,
  selectFilesToScan
};
