#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { askQuestion } = require("./cli.commands.js");

const createDirectory = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`📁 Created directory: ${dirPath}`);
  }
};

const writeFile = (filePath, content) => {
  fs.writeFileSync(filePath, content);
  console.log(`📄 Created file: ${filePath}`);
};

const manageFiles = async () => {
  const configPath = path.join(process.cwd(), ".auto-translation-config.json");

  if (!fs.existsSync(configPath)) {
    console.log("❌ No config found! Run 'npx auto-translation init' first.");
    return;
  }

  let config;
  try {
    config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  } catch (error) {
    console.log("❌ Invalid config file!");
    return;
  }

  if (config.structureType !== "file-based") {
    console.log("❌ This command is only for file-based structures!");
    console.log(
      "💡 Your current structure is single-file. Use 'npx auto-translation scan' instead."
    );
    return;
  }

  console.log("📁 File Management Options:\n");
  console.log("1. Update existing file");
  console.log("2. Create new file");
  console.log("3. Switch active file");
  console.log("4. List all files");

  const choice = await askQuestion("\nEnter your choice (1-4): ");

  switch (choice) {
    case "1":
      await updateExistingFile(config);
      break;
    case "2":
      await createNewFile(config);
      break;
    case "3":
      await switchActiveFile(config);
      break;
    case "4":
      listAllFiles(config);
      break;
    default:
      console.log("❌ Invalid choice!");
      break;
  }
};

const updateExistingFile = async (config) => {
  if (!config.files || config.files.length === 0) {
    console.log("❌ No files found!");
    return;
  }

  console.log("\n📄 Available files:");
  config.files.forEach((file, index) => {
    const indicator = file === config.currentFile ? " (current)" : "";
    console.log(`  ${index + 1}. ${file}${indicator}`);
  });

  const choice = await askQuestion("\nEnter file number to update: ");
  const fileIndex = parseInt(choice) - 1;

  if (fileIndex < 0 || fileIndex >= config.files.length) {
    console.log("❌ Invalid file number!");
    return;
  }

  const selectedFile = config.files[fileIndex];
  config.currentFile = selectedFile;

  // Save updated config
  const configPath = path.join(process.cwd(), ".auto-translation-config.json");
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

  console.log(`✅ Switched to file: ${selectedFile}`);
  console.log("🔍 Now run 'npx auto-translation scan' to update this file");
};

const createNewFile = async (config) => {
  const fileName = await askQuestion("Enter name for new translation file: ");
  const sanitizedFileName = fileName.toLowerCase().replace(/[^a-zA-Z0-9]/g, "");

  if (config.files.includes(sanitizedFileName)) {
    console.log(`❌ File '${sanitizedFileName}' already exists!`);
    return;
  }

  // Create the new file
  const newFilePath = path.join(
    config.jsonFilesPath,
    `${sanitizedFileName}.js`
  );
  const newFileContent = `export const ${sanitizedFileName} = {
  // Add your ${sanitizedFileName} translations here
};`;

  writeFile(newFilePath, newFileContent);

  // Update index.js
  const indexPath = path.join(config.jsonFilesPath, "index.js");

  // Read current index.js
  let indexContent = "";
  if (fs.existsSync(indexPath)) {
    indexContent = fs.readFileSync(indexPath, "utf-8");
  }

  // Add import for new file
  const importLine = `import { ${sanitizedFileName} } from './${sanitizedFileName}';`;
  const spreadLine = `  // ${
    sanitizedFileName.charAt(0).toUpperCase() + sanitizedFileName.slice(1)
  }\n  ...${sanitizedFileName},`;

  // Update imports section
  if (indexContent.includes("import {")) {
    // Add to existing imports
    const lines = indexContent.split("\n");
    let importInserted = false;

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes("import {") && !importInserted) {
        lines.splice(i + 1, 0, importLine);
        importInserted = true;
        break;
      }
    }

    // Add to enJSON object
    const enJSONIndex = lines.findIndex((line) =>
      line.includes("const enJSON = {")
    );
    if (enJSONIndex !== -1) {
      // Find the closing brace
      for (let i = enJSONIndex + 1; i < lines.length; i++) {
        if (lines[i].includes("};")) {
          lines.splice(i, 0, spreadLine);
          break;
        }
      }
    }

    indexContent = lines.join("\n");
  } else {
    // Create new index.js
    indexContent = `${importLine}

const enJSON = {
${spreadLine}
};

export default enJSON;`;
  }

  fs.writeFileSync(indexPath, indexContent);

  // Update config
  config.files.push(sanitizedFileName);
  config.currentFile = sanitizedFileName;

  const configPath = path.join(process.cwd(), ".auto-translation-config.json");
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

  console.log(`✅ Created new file: ${sanitizedFileName}.js`);
  console.log(`📝 Updated index.js with import`);
  console.log(`🎯 Switched to new file: ${sanitizedFileName}`);
  console.log(
    "🔍 Now run 'npx auto-translation scan' to add keys to this file"
  );
};

const switchActiveFile = async (config) => {
  if (!config.files || config.files.length === 0) {
    console.log("❌ No files found!");
    return;
  }

  console.log("\n📄 Available files:");
  config.files.forEach((file, index) => {
    const indicator = file === config.currentFile ? " (current)" : "";
    console.log(`  ${index + 1}. ${file}${indicator}`);
  });

  const choice = await askQuestion("\nEnter file number to switch to: ");
  const fileIndex = parseInt(choice) - 1;

  if (fileIndex < 0 || fileIndex >= config.files.length) {
    console.log("❌ Invalid file number!");
    return;
  }

  const selectedFile = config.files[fileIndex];

  if (selectedFile === config.currentFile) {
    console.log(`ℹ️  Already using file: ${selectedFile}`);
    return;
  }

  config.currentFile = selectedFile;

  // Save updated config
  const configPath = path.join(process.cwd(), ".auto-translation-config.json");
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

  console.log(`✅ Switched to file: ${selectedFile}`);
  console.log("🔍 Now run 'npx auto-translation scan' to update this file");
};

const listAllFiles = (config) => {
  if (!config.files || config.files.length === 0) {
    console.log("❌ No files found!");
    return;
  }

  console.log("\n📄 All translation files:");
  config.files.forEach((file, index) => {
    const indicator = file === config.currentFile ? " (current)" : "";
    const filePath = path.join(config.jsonFilesPath, `${file}.js`);
    const exists = fs.existsSync(filePath) ? "✅" : "❌";
    console.log(`  ${index + 1}. ${file}${indicator} ${exists}`);
  });

  console.log(`\n🎯 Current active file: ${config.currentFile}`);
  console.log("💡 Use 'npx auto-translation scan' to update the current file");
};

module.exports = {
  createDirectory,
  writeFile,
  listAllFiles,
  switchActiveFile,
  createNewFile,
  manageFiles,
  updateExistingFile,
};
