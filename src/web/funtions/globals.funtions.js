const fs = require("fs");
const path = require("path");

/**
 * Find a single file by name in the project.
 * @param {string} filename - The file to find (e.g. ".auto-translate-config").
 * @param {string} [startDir=process.cwd()] - Directory to start searching from.
 * @returns {string|null} Full absolute path if found, otherwise null.
 */
function findFile(filename, startDir = process.cwd()) {
  function search(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isFile() && entry.name === filename) {
        return fullPath; // ✅ Found the file → stop immediately
      }

      if (entry.isDirectory()) {
        const found = search(fullPath);
        if (found) return found; // ✅ Propagate found path upward
      }
    }

    return null;
  }

  return search(startDir);
}

module.exports = {
  findFile
};
