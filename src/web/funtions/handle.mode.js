const fs = require("fs");
const path  = require("path")


const findProjectRoot = (startDir = process.cwd()) => {
  let dir = startDir;

  while (true) {
    const pkgPath = path.join(dir, "package.json");
    if (fs.existsSync(pkgPath)) {
      return dir;
    }

    const parent = path.dirname(dir);
    if (parent === dir) break; // reached filesystem root
    dir = parent;
  }

  return process.cwd(); // fallback
};


const PROJECT_ROOT = findProjectRoot();
const CONFIG_FILE = path.join(PROJECT_ROOT, ".translate-package-config");


const DEFAULT_CONFIG = {
  mode: null,
  strictLocked: false,
  createdAt: new Date().toISOString(),
  lastModified: new Date().toISOString(),
};

const readConfig = () => {
  try {
    if (!fs.existsSync(CONFIG_FILE)) return { ...DEFAULT_CONFIG };
    const configData = fs.readFileSync(CONFIG_FILE, "utf8").trim();

    if (configData && !configData.startsWith("{")) {
      return {
        ...DEFAULT_CONFIG,
        mode: configData,
        lastModified: new Date().toISOString(),
      };
    }

    return { ...DEFAULT_CONFIG, ...JSON.parse(configData) };
  } catch (error) {
    console.log("⚠️  Config file corrupted, resetting to defaults...");
    return { ...DEFAULT_CONFIG };
  }
};


const getCurrentMode = () => readConfig().mode;
const currentMode = getCurrentMode();
console.log('see',currentMode)

module.exports = {
    getCurrentMode 
}