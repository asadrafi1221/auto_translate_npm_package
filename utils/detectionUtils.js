const fs = require("fs");
const path = require("path");
const { searchDirectory } = require('./fileUtils.js');

const detectExistingI18nSetup = () => {
  const possiblePaths = [
    path.join(process.cwd(), "src/i18n"),
    path.join(process.cwd(), "i18n"),
    path.join(process.cwd(), "locales"),
    path.join(process.cwd(), "src/locales"),
    path.join(process.cwd(), "translations"),
    path.join(process.cwd(), "src/translations"),
    path.join(process.cwd(), "public/locales"),
    path.join(process.cwd(), "assets/i18n"),
    path.join(process.cwd(), "src/assets/i18n"),
  ];

  const found = [];

  possiblePaths.forEach((dirPath) => {
    if (fs.existsSync(dirPath)) {
      const setup = analyzeI18nDirectory(dirPath);
      if (setup.translationFiles.length > 0 || setup.subdirs.length > 0) {
        found.push(setup);
      }
    }
  });

  return found;
};

const analyzeI18nDirectory = (dirPath) => {
  const files = fs.readdirSync(dirPath, { withFileTypes: true });
  const translationFiles = [];
  const subdirs = [];

  files.forEach((file) => {
    if (file.isFile()) {
      if (isTranslationFile(file.name)) {
        translationFiles.push(file.name);
      }
    } else if (file.isDirectory()) {
      const subPath = path.join(dirPath, file.name);
      try {
        const subFiles = fs.readdirSync(subPath);
        const hasTranslations = subFiles.some(f => isTranslationFile(f));
        if (hasTranslations) {
          subdirs.push({ 
            name: file.name, 
            path: subPath, 
            files: subFiles.filter(f => isTranslationFile(f))
          });
        }
      } catch (e) {
        // Skip if can't read subdirectory
      }
    }
  });

  return {
    path: dirPath,
    translationFiles,
    subdirs,
  };
};

const isTranslationFile = (fileName) => {
  return (
    fileName.match(/\.(json|js|ts)$/) &&
    !fileName.includes("config") &&
    !fileName.includes("index") &&
    (fileName.length <= 10 || // Short files likely to be locale codes
      fileName.includes("en") ||
      fileName.includes("translation") ||
      fileName.includes("locale") ||
      fileName.match(/^[a-z]{2}(-[A-Z]{2})?\./) // Language codes like en.json, en-US.json
    )
  );
};

const findAllTranslationFiles = (basePath) => {
  const files = [];

  const searchRecursively = (currentPath) => {
    try {
      const items = fs.readdirSync(currentPath, { withFileTypes: true });

      items.forEach((item) => {
        const fullPath = path.join(currentPath, item.name);

        if (item.isDirectory() && !["node_modules", ".git"].includes(item.name)) {
          searchRecursively(fullPath);
        } else if (item.isFile() && isTranslationFile(item.name)) {
          files.push({
            path: fullPath,
            name: item.name,
            relativePath: path.relative(basePath, fullPath),
          });
        }
      });
    } catch (e) {
      // Skip directories we can't read
    }
  };

  searchRecursively(basePath);
  return files;
};

const detectProjectType = () => {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    return { type: 'unknown', frameworks: [] };
  }

  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    const frameworks = [];
    if (dependencies.react) frameworks.push('react');
    if (dependencies.vue) frameworks.push('vue');
    if (dependencies.angular) frameworks.push('angular');
    if (dependencies.next) frameworks.push('next');
    if (dependencies.nuxt) frameworks.push('nuxt');

    const hasI18n = !!(
      dependencies['react-i18next'] ||
      dependencies['vue-i18n'] ||
      dependencies['@angular/localize'] ||
      dependencies['i18next']
    );

    return {
      type: 'javascript',
      frameworks,
      hasI18n,
      dependencies: Object.keys(dependencies)
    };
  } catch (error) {
    return { type: 'unknown', frameworks: [] };
  }
};

module.exports = {
  detectExistingI18nSetup,
  analyzeI18nDirectory,
  findAllTranslationFiles,
  isTranslationFile,
  detectProjectType,
};