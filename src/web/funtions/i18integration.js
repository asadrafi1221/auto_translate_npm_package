const fs = require("fs");
const path = require("path");
const { askQuestion } = require("./cli.commands.js");
const { writeFile, createDirectory } = require("./handlefile.js");


const setupI18nStructure = async () => {
  console.log("🌍 Setting up i18n structure...\n");

  // Ask user where to create i18n folder
  console.log("Where would you like to create the i18n folder?");
  console.log("1. Inside src/ directory (src/i18n/)");
  console.log("2. In current/root directory (./i18n/)");

  const locationChoice = await askQuestion("\nEnter your choice (1 or 2): ");

  let i18BasePath;
  if (locationChoice === "1") {
    const srcPath = path.join(process.cwd(), "src");
    createDirectory(srcPath);
    i18BasePath = srcPath;
    console.log("📁 Creating i18n folder inside src/");
  } else if (locationChoice === "2") {
    i18BasePath = process.cwd();
    console.log("📁 Creating i18n folder in current directory");
  } else {
    console.log("❌ Invalid choice. Defaulting to src/ directory");
    const srcPath = path.join(process.cwd(), "src");
    createDirectory(srcPath);
    i18BasePath = srcPath;
  }

  // Ask user about structure type
  console.log("\nChoose translation structure:");
  console.log("1. Single file (all translations in one file)");
  console.log("2. File-based (separate files for different sections)");

  const structureChoice = await askQuestion("\nEnter your choice (1 or 2): ");

  const i18Path = path.join(i18BasePath, "i18n");
  const jsonFilesPath = path.join(i18Path, "localization");

  // Create directories
  createDirectory(i18Path);
  createDirectory(jsonFilesPath);

  if (structureChoice === "2") {
    // File-based structure
    console.log("\n📁 Setting up file-based structure...\n");

    // Ask for initial file name
    const fileName = await askQuestion(
      "Enter name for your first translation file (e.g., 'commons', 'dashboard'): "
    );
    const sanitizedFileName = fileName
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, "");

    // Create the first file
    const firstFilePath = path.join(jsonFilesPath, `${sanitizedFileName}.js`);
    const sampleFileContent = `export const ${sanitizedFileName} = {
  hello: "hello",
  welcome: "Welcome",
  goodbye: "Goodbye",
};`;

    writeFile(firstFilePath, sampleFileContent);

    // Create index.js file
    const indexPath = path.join(jsonFilesPath, "index.js");
    const indexContent = `import { ${sanitizedFileName} } from './${sanitizedFileName}';

const enJSON = {
  // ${sanitizedFileName.charAt(0).toUpperCase() + sanitizedFileName.slice(1)}
  ...${sanitizedFileName},
};

export default enJSON;`;

    writeFile(indexPath, indexContent);

    // Create i18n.ts configuration file for file-based
    const i18nTsPath = path.join(i18Path, "i18n.ts");
    const i18nConfig = `import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from './localization/index.js';

const resources = {
  en: {
    translation: enTranslations,
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
`;

    writeFile(i18nTsPath, i18nConfig);

    // Store config for file-based structure
    const configPath = path.join(
      process.cwd(),
      ".auto-translation-config.json"
    );
    const config = {
      i18nPath: i18Path,
      jsonFilesPath: jsonFilesPath,
      locationChoice: locationChoice,
      structureType: "file-based",
      currentFile: sanitizedFileName,
      files: [sanitizedFileName],
    };
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    console.log(`✅ File-based structure created!`);
    console.log(`📄 First file: ${sanitizedFileName}.js`);
    console.log(`📄 Index file: index.js`);
    console.log(`🔧 Use 'npx auto-translation file-update' to manage files`);
  } else {
    // Single file structure (original)
    const enJsonPath = path.join(jsonFilesPath, "en.json");
    const sampleTranslations = {
      hello: "hello",
      welcome: "Welcome",
      goodbye: "Goodbye",
    };

    if (!fs.existsSync(enJsonPath)) {
      writeFile(enJsonPath, JSON.stringify(sampleTranslations, null, 2));
    }

    // Create i18n.ts configuration file with correct import path
    const i18nTsPath = path.join(i18Path, "i18n.ts");
    const i18nConfig = `
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from './localization/en.json';

const resources = {
  en: {
    translation: enTranslations,
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
`;

    if (!fs.existsSync(i18nTsPath)) {
      writeFile(i18nTsPath, i18nConfig);
    }

    // Store the choice for scanning later
    const configPath = path.join(
      process.cwd(),
      ".auto-translation-config.json"
    );
    const config = {
      i18nPath: i18Path,
      jsonFilesPath: jsonFilesPath,
      locationChoice: locationChoice,
      structureType: "single-file",
    };
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    console.log(`\n✅ Single file structure created at: ${i18Path}`);
    console.log(
      `📄 Translation file: ${path.relative(process.cwd(), enJsonPath)}`
    );
  }

  return i18Path;
};

module.exports = {
  setupI18nStructure,
};
