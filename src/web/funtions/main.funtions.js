#!/usr/bin/env node


const readline = require('readline');
const path = require('path');
const fs = require('fs');


const createReadlineInterface = () => {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
};

// Ask question helper
const askQuestion = (rl, question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
};

const findReactFiles = (dir, extensions = [".tsx", ".jsx", ".js", ".ts"]) => {
  let results = [];
  if (!fs.existsSync(dir)) return results;

  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory() &&
        !["node_modules","dist","build",".git",".next","coverage","public",".vscode",".idea"].includes(item.name)
    ) {
      results = results.concat(findReactFiles(fullPath, extensions));
    } else if (item.isFile() && extensions.some(ext => item.name.endsWith(ext))) {
      results.push(fullPath);
    }
  }
  return results;
};

// Select files to scan
// Select files to scan (updated: recursive search by file name)
const selectFilesToScan = async () => {
  const rl = createReadlineInterface();
  
  try {
    console.log("🔍 File Scanning Options:");
    console.log("1. Scan entire project");
    console.log("2. Scan specific files by name");
    console.log("");

    const choice = await askQuestion(rl, "Select option (1 or 2): ");

    if (choice === "1") {
      console.log("📁 Will scan entire project for translation keys...");
      return null; // null means scan whole project
    }

    if (choice === "2") {
      console.log("\n📄 Specify file names to scan (comma or space separated, e.g., app.tsx header.tsx):");

      const projectRoot = process.cwd();
      const allFiles = findReactFiles(projectRoot);
      const relativeFiles = allFiles.map(f => path.relative(projectRoot, f));

      const filesInput = await askQuestion(rl, "Enter file names: ");
      if (!filesInput) {
        console.log("⚠️ No file names entered. Aborting.");
        return [];
      }

      const names = filesInput.split(/[\s,]+/).filter(Boolean);
      if (names.length === 0) {
        console.log("⚠️ No valid file names entered. Aborting.");
        return [];
      }

      const matchedFiles = [];
      names.forEach(name => {
        const matches = relativeFiles.filter(f => f.endsWith(name));
        if (matches.length === 0) console.log(`❌ No matches found for: ${name}`);
        else matches.forEach(m => matchedFiles.push(path.join(projectRoot, m)));
      });

      if (matchedFiles.length === 0) {
        console.log("⚠️ No valid files to scan. Operation cancelled.");
        return [];
      }

      console.log("\n📝 Files selected for scanning:");
      matchedFiles.forEach((f, idx) => console.log(`  ${idx+1}. ${f}`));

      const confirm = await askQuestion(rl, "\nProceed with these files? (y/n, default yes): ");
      if (confirm && !['y','yes'].includes(confirm.toLowerCase())) {
        console.log("⚠️ Operation cancelled by user.");
        return [];
      }

      return matchedFiles;
    }

    console.log("⚠️ Invalid option. Please select 1 or 2.");
    return await selectFilesToScan(); // retry
  } finally {
    rl.close();
  }
};


module.exports = {
    selectFilesToScan,
    findReactFiles
}