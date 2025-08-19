const fs = require("fs");

const flattenObject = (obj, prefix = "") => {
  const flattened = {};

  Object.keys(obj || {}).forEach((key) => {
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (
      typeof obj[key] === "object" &&
      obj[key] !== null &&
      !Array.isArray(obj[key])
    ) {
      Object.assign(flattened, flattenObject(obj[key], newKey));
    } else {
      flattened[newKey] = obj[key];
    }
  });

  return flattened;
};

const updateNestedObject = (obj) => {
  const updated = {};
  Object.keys(obj || {}).forEach((key) => {
    if (
      typeof obj[key] === "object" &&
      obj[key] !== null &&
      !Array.isArray(obj[key])
    ) {
      updated[key] = updateNestedObject(obj[key]);
    } else {
      updated[key] = key;
    }
  });
  return updated;
};

const deepMerge = (target, source) => {
  const result = { ...target };

  Object.keys(source).forEach((key) => {
    if (
      typeof source[key] === "object" &&
      source[key] !== null &&
      !Array.isArray(source[key])
    ) {
      if (
        typeof result[key] === "object" &&
        result[key] !== null &&
        !Array.isArray(result[key])
      ) {
        result[key] = deepMerge(result[key], source[key]);
      } else {
        result[key] = source[key];
      }
    } else {
      // Only add if key doesn't exist
      if (!(key in result)) {
        result[key] = source[key];
      }
    }
  });

  return result;
};

const processNestedKeys = (existingTranslations, keysIterable) => {
  const allKeys = Array.isArray(keysIterable)
    ? keysIterable
    : Array.from(keysIterable || []);
  const nested = {};
  const flatKeys = {};

  allKeys.forEach((key) => {
    if (typeof key !== "string") return;
    if (key.includes(".")) {
      const parts = key.split(".");
      let current = nested;

      for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) {
          current[parts[i]] = {};
        }
        current = current[parts[i]];
      }

      const lastPart = parts[parts.length - 1];
      current[lastPart] = lastPart;
    } else {
      flatKeys[key] = key;
    }
  });

  return deepMerge(existingTranslations, { ...flatKeys, ...nested });
};

const readTranslationFile = (filePath) => {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    
    if (filePath.endsWith(".json")) {
      return JSON.parse(content);
    } else if (filePath.endsWith(".js") || filePath.endsWith(".ts")) {
      // Try to extract exported object
      const exportMatch = content.match(/export\s+(?:const|default)\s+\w*\s*=\s*({[\s\S]*?});/);
      if (exportMatch) {
        return eval(`(${exportMatch[1]})`);
      }
      // Try module.exports
      const moduleMatch = content.match(/module\.exports\s*=\s*({[\s\S]*?});/);
      if (moduleMatch) {
        return eval(`(${moduleMatch[1]})`);
      }
    }
  } catch (e) {
    console.warn(`⚠️  Couldn't read ${filePath}: ${e.message}`);
  }
  return {};
};

const updateTranslationFile = (filePath, existingData, newKeys) => {
  const processedData = processNestedKeys(existingData, Array.from(newKeys));
  
  try {
    if (filePath.endsWith(".json")) {
      fs.writeFileSync(filePath, JSON.stringify(processedData, null, 2));
    } else if (filePath.endsWith(".js")) {
      const originalContent = fs.readFileSync(filePath, "utf-8");
      const exportMatch = originalContent.match(/export\s+const\s+(\w+)\s*=/);
      
      if (exportMatch) {
        const varName = exportMatch[1];
        const newContent = `export const ${varName} = ${JSON.stringify(processedData, null, 2)};`;
        fs.writeFileSync(filePath, newContent);
      } else {
        const newContent = `export default ${JSON.stringify(processedData, null, 2)};`;
        fs.writeFileSync(filePath, newContent);
      }
    } else if (filePath.endsWith(".ts")) {
      const newContent = `export default ${JSON.stringify(processedData, null, 2)};`;
      fs.writeFileSync(filePath, newContent);
    }
    
    return true;
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
    return false;
  }
};

const getTranslationKeys = (content) => {
  const tPatterns = [
    /\bt\s*\(\s*['"`]([^'"`\n\r]+?)['"`]\s*\)/g,
    /\{\s*t\s*\(\s*['"`]([^'"`\n\r]+?)['"`]\s*\)\s*\}/g,
    /=\s*t\s*\(\s*['"`]([^'"`\n\r]+?)['"`]\s*\)/g,
    /[\(,]\s*t\s*\(\s*['"`]([^'"`\n\r]+?)['"`]\s*\)/g,
    /=\s*\{\s*t\s*\(\s*['"`]([^'"`\n\r]+?)['"`]\s*\)\s*\}/g,
  ];

  const foundKeys = new Set();

  tPatterns.forEach((pattern) => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const key = match[1].trim();
      if (key && key.length > 0) {
        foundKeys.add(key);
      }
    }
    pattern.lastIndex = 0; // Reset regex
  });

  return Array.from(foundKeys);
};

module.exports = {
  flattenObject,
  updateNestedObject,
  deepMerge,
  processNestedKeys,
  readTranslationFile,
  updateTranslationFile,
  getTranslationKeys,
};