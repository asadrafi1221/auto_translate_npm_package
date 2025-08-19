const fs = require("fs");
const path = require("path");

const createDirectory = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`📁 Created directory: ${dirPath}`);
    return true;
  }
  return false;
};

const writeFile = (filePath, content) => {
  fs.writeFileSync(filePath, content);
  console.log(`📄 Created file: ${filePath}`);
};

const fileExists = (filePath) => {
  return fs.existsSync(filePath);
};

const readJsonFile = (filePath) => {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    console.warn(`⚠️  Couldn't read JSON file ${filePath}: ${error.message}`);
    return {};
  }
};

const writeJsonFile = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`❌ Error writing JSON file ${filePath}:`, error.message);
    return false;
  }
};

const findFiles = (dir, extensions = [".tsx", ".jsx", ".js", ".ts"], excludeDirs = []) => {
  let results = [];

  if (!fs.existsSync(dir)) {
    return results;
  }

  const defaultExcludeDirs = [
    "node_modules",
    "dist",
    "build",
    ".git",
    ".next",
    "coverage",
    "public",
    ".vscode",
    ".idea",
    ...excludeDirs
  ];

  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dir, item.name);

    if (item.isDirectory() && !defaultExcludeDirs.includes(item.name)) {
      results = results.concat(findFiles(fullPath, extensions, excludeDirs));
    } else if (
      item.isFile() &&
      extensions.some((ext) => item.name.endsWith(ext))
    ) {
      results.push(fullPath);
    }
  }

  return results;
};

const searchDirectory = (basePath, targetDirs = [], targetFiles = []) => {
  const found = [];

  const searchRecursively = (currentPath, depth = 0) => {
    if (depth > 3) return; // Limit search depth

    try {
      const items = fs.readdirSync(currentPath, { withFileTypes: true });

      items.forEach((item) => {
        const fullPath = path.join(currentPath, item.name);

        if (item.isDirectory()) {
          // Check if this directory matches our target
          if (targetDirs.includes(item.name)) {
            found.push({
              type: 'directory',
              path: fullPath,
              name: item.name
            });
          }
          
          // Continue searching if not excluded
          if (!["node_modules", ".git", "dist", "build"].includes(item.name)) {
            searchRecursively(fullPath, depth + 1);
          }
        } else if (item.isFile()) {
          // Check if this file matches our target
          if (targetFiles.some(pattern => item.name.includes(pattern))) {
            found.push({
              type: 'file',
              path: fullPath,
              name: item.name
            });
          }
        }
      });
    } catch (e) {
      // Skip directories we can't read
    }
  };

  searchRecursively(basePath);
  return found;
};

module.exports = {
  createDirectory,
  writeFile,
  fileExists,
  readJsonFile,
  writeJsonFile,
  findFiles,
  searchDirectory,
};