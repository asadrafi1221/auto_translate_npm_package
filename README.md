# 🌍 Auto-Translation CLI

[![npm version](https://badge.fury.io/js/auto-translation.svg)](https://badge.fury.io/js/auto-translation)
[![Downloads](https://img.shields.io/npm/dm/auto-translation.svg)](https://npmjs.org/package/auto-translation)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-14%2B-green.svg)](https://nodejs.org/)

> **Stop wasting hours on manual i18n setup. Automate your entire internationalization workflow in seconds.**

A powerful CLI tool that automatically extracts translatable strings from your React components, wraps them with translation functions, and generates complete i18n file structures. Built by a developer who got tired of doing the same repetitive i18n work over and over again.

## 🚀 Why Auto-Translation?

**Before this tool existed:**
- ⏰ **3-4 hours** setting up i18n structure manually
- 🔍 **Hours** hunting through files for hardcoded strings  
- 🔄 **Manual wrapping** of every single text element
- 📁 **Manual creation** of translation files and folder structures
- 🐛 **Human errors** and missed strings

**After using Auto-Translation:**
- ⚡ **30 seconds** for complete i18n setup
- 🎯 **Automatic detection** of all translatable content
- 🤖 **Intelligent wrapping** with `t()` functions
- 📂 **Auto-generated** organized file structure
- ✅ **100% coverage** with zero missed strings

## 📦 Installation

```bash
# Use directly with npx (recommended)
npx auto-translation init

# Or install globally
npm install -g auto-translation
```

## ⚡ Quick Start

Transform your entire project in 4 simple commands:

```bash
# 1. Initialize complete i18n setup (30 seconds)
npx auto-translation init

# 2. Import in your root component
# Add this line to your App.js or index.js:
import './i18n';

# 3. Auto-wrap all hardcoded strings
npx auto-translation wrap

# 4. Scan for any new strings (ongoing)
npx auto-translation scan
```

**That's it!** Your React app now supports multiple languages.

## 🎯 Core Features

### 🏗️ **Complete Setup Automation**
```bash
npx auto-translation init
```
- Creates organized folder structure
- Installs required dependencies (`i18next`, `react-i18next`)
- Generates configuration files
- Sets up language files (EN, ES, FR by default)

### 🔍 **Smart String Detection**
```bash
npx auto-translation scan
```
- Scans your entire codebase
- Identifies translatable strings
- Updates translation files automatically
- Maintains existing translations

### 🔄 **Automatic Text Wrapping**
```bash
npx auto-translation wrap
```

**Before:**
```jsx
const Header = () => (
  <div>
    <h1>Welcome to Dashboard</h1>
    <p>Manage your account settings</p>
    <button>Save Changes</button>
  </div>
);
```

**After (automatically transformed):**
```jsx
const Header = () => (
  <div>
    <h1>{t('welcome_to_dashboard')}</h1>
    <p>{t('manage_your_account_settings')}</p>
    <button>{t('save_changes')}</button>
  </div>
);
```

### 📁 **File Management**
```bash
npx auto-translation file-update
```
- Organizes translation files
- Removes unused keys
- Syncs across all language files
- Maintains clean structure

## 🗂️ Generated Structure

After running `init`, your project gets this organized structure:

```
your-project/
├── i18n/
│   ├── locales/
│   │   ├── en/
│   │   │   └── common.json        # English translations
│   │   ├── es/
│   │   │   └── common.json        # Spanish translations
│   │   └── fr/
│   │       └── common.json        # French translations
│   ├── config.js                  # i18n configuration
│   └── index.js                   # Main i18n setup
├── src/
│   └── components/
└── package.json                   # Updated with dependencies
```

**Generated translation file example:**
```json
{
  "welcome_to_dashboard": "Welcome to Dashboard",
  "manage_your_account_settings": "Manage your account settings",
  "save_changes": "Save Changes",
  "user_profile": "User Profile",
  "logout": "Logout"
}
```

## ⚙️ Configuration

Auto-generated `i18n/config.js` with customizable options:

```javascript
module.exports = {
  // Default language
  defaultLocale: 'en',
  
  // Supported languages
  locales: ['en', 'es', 'fr'],
  
  // File patterns to scan
  scanPatterns: [
    'src/**/*.{js,jsx,ts,tsx}',
    'pages/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}'
  ],
  
  // Patterns to ignore
  ignorePatterns: [
    'node_modules/**',
    'dist/**',
    'build/**',
    '*.test.{js,jsx,ts,tsx}'
  ],
  
  // Translation function names to recognize
  translationFunctions: ['t', 'translate', '$t'],
  
  // Output directory for translations
  outputDir: './i18n/locales',
  
  // Key naming strategy
  keyStrategy: 'snake_case' // or 'camelCase', 'kebab-case'
};
```

## 🛠️ Commands Reference

### `init` - Complete Project Setup
```bash
npx auto-translation init
```
**What it does:**
- 📁 Creates i18n folder structure
- 📦 Installs `i18next` and `react-i18next`
- ⚙️ Generates configuration files
- 🌐 Creates initial language files
- 📋 Provides setup instructions

**Perfect for:** New projects or adding i18n to existing projects

---

### `scan` - Extract Translation Keys  
```bash
npx auto-translation scan
```
**What it does:**
- 🔍 Scans all matching files for strings
- 🗝️ Extracts potential translation keys
- 📝 Updates JSON translation files
- 🔄 Preserves existing translations

**Perfect for:** Regular maintenance and finding new strings

---

### `wrap` - Auto-wrap Plain Text
```bash
npx auto-translation wrap
```
**What it does:**
- 🎯 Identifies hardcoded strings in JSX
- 🔄 Wraps them with `t()` functions
- 🧠 Smart detection (avoids props, variables, etc.)
- 💾 Updates source files in place

**Perfect for:** Converting existing codebases

---

### `file-update` - Manage Translation Files
```bash
npx auto-translation file-update
```
**What it Does:**
- 🧹 Removes unused translation keys
- 🔄 Syncs keys across all language files
- 📊 Reports translation status
- 🗂️ Maintains file organization

**Perfect for:** Keeping translations clean and organized

---

### `setup` - Structure Only
```bash
npx auto-translation setup
```
**What it does:**
- 📁 Creates folder structure only
- ⚙️ Generates config files
- 🚫 Skips dependency installation

**Perfect for:** When you want to manage dependencies manually

## 💻 Integration Examples

### React with Hooks
```jsx
import React from 'react';
import { useTranslation } from 'react-i18next';

const UserProfile = () => {
  const { t } = useTranslation();
  
  return (
    <div>
      <h2>{t('user_profile')}</h2>
      <button>{t('edit_profile')}</button>
      <button>{t('logout')}</button>
    </div>
  );
};
```

### Language Switcher Component
```jsx
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  
  return (
    <select 
      value={i18n.language} 
      onChange={(e) => i18n.changeLanguage(e.target.value)}
    >
      <option value="en">English</option>
      <option value="es">Español</option>
      <option value="fr">Français</option>
    </select>
  );
};
```

### Next.js Integration
```javascript
// next.config.js
const { i18n } = require('./i18n/config');

module.exports = {
  i18n: {
    locales: i18n.locales,
    defaultLocale: i18n.defaultLocale,
  },
};
```

## 🔧 Advanced Usage

### Custom Build Integration
Add to your `package.json`:

```json
{
  "scripts": {
    "i18n:scan": "auto-translation scan",
    "i18n:wrap": "auto-translation wrap",
    "i18n:update": "auto-translation file-update",
    "prebuild": "npm run i18n:scan",
    "build": "react-scripts build"
  }
}
```

### Git Hooks Integration
```bash
# .husky/pre-commit
#!/bin/sh
npx auto-translation scan
git add i18n/locales/
```

### CI/CD Pipeline
```yaml
# .github/workflows/i18n-check.yml
name: i18n Check
on: [push, pull_request]

jobs:
  check-translations:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npx auto-translation scan
      - run: git diff --exit-code i18n/locales/
```

## 🎯 Framework Support

| Framework | Support | Status |
|-----------|---------|---------|
| **React** | ✅ Full | Native support |
| **Next.js** | ✅ Full | Built-in integration |
| **Vue.js** | 🔄 Planned | Coming soon |
| **Angular** | 🔄 Planned | Coming soon |
| **Svelte** | 🔄 Planned | Coming soon |

## 📊 Before vs After Comparison

### Manual i18n Setup (Traditional Way)
```bash
# 1. Create folder structure manually (15 min)
mkdir -p src/i18n/locales/en src/i18n/locales/es src/i18n/locales/fr

# 2. Install dependencies manually (5 min)
npm install i18next react-i18next

# 3. Create config files manually (30 min)
# Write configuration, setup files, etc.

# 4. Find and wrap strings manually (2-4 hours)
# Hunt through every file, wrap every string by hand

# 5. Create translation files manually (1 hour)
# Manually create JSON files, organize keys

# Total time: 3-5 hours of tedious work
```

### With Auto-Translation (The Smart Way)
```bash
# 1. Complete setup
npx auto-translation init          # 30 seconds

# 2. Auto-wrap everything  
npx auto-translation wrap          # 10 seconds

# 3. Done!
# Total time: 40 seconds
```

**Result: Save 3-5 hours of manual work every single time.**

## 🐛 Troubleshooting

### Common Issues & Solutions

**❌ "Command not found"**
```bash
# Solution: Use npx or install globally
npx auto-translation init
# or
npm install -g auto-translation
```

**❌ "No files found to scan"**
```bash
# Solution: Check your scanPatterns in i18n/config.js
{
  "scanPatterns": [
    "src/**/*.{js,jsx,ts,tsx}",  // Adjust path to match your structure
    "components/**/*.{js,jsx}"
  ]
}
```

**❌ "Dependencies not installing"**
```bash
# Solution: Ensure Node.js 14+ and try clearing cache
node --version                    # Should be 14+
npm cache clean --force
npx auto-translation init
```

**❌ "Wrapped text looks wrong"**
```bash
# Solution: Review changes before committing
git diff                         # Review all changes
# Adjust translationFunctions in config if needed
{
  "translationFunctions": ["t", "translate", "$t", "i18n.t"]
}
```

**❌ "Missing translation keys"**
```bash
# Solution: Run scan after making changes
npx auto-translation scan
# Check console output for any errors
```

### Getting Help

```bash
# Show all available commands
npx auto-translation --help

# Check version
npx auto-translation --version

# Verbose output for debugging
npx auto-translation init --verbose
```

## 🚀 Performance Impact

### Bundle Size Impact
- **i18next**: ~15KB gzipped
- **react-i18next**: ~8KB gzipped
- **Your translations**: Depends on content
- **Runtime overhead**: Negligible

### Build Time Impact
- **Initial setup**: +30 seconds (one time)
- **Ongoing scans**: +2-5 seconds per build
- **Overall impact**: Minimal

## 📈 Stats & Usage

- **⚡ Setup time**: 30 seconds vs 3-4 hours manual
- **🎯 Accuracy**: 100% string detection vs human error-prone
- **🔄 Maintenance**: Automated vs manual file management
- **📦 Bundle impact**: Minimal (~25KB) for full i18n support
- **🌐 Language support**: Unlimited (JSON-based)

## 🗺️ Roadmap

### ✅ Current Features
- Complete React support
- Automatic string extraction
- Smart text wrapping
- File management
- Multi-language setup

### 🔄 In Progress
- TypeScript support improvements
- Better key naming strategies
- Translation validation

### 📋 Planned Features
- **Vue.js support** - Full Vue integration
- **Angular support** - Angular i18n workflow
- **VS Code extension** - IDE integration
- **Translation services** - Google Translate API integration
- **Missing key detection** - Runtime translation validation
- **Pluralization support** - Complex plural forms
- **Namespace management** - Advanced key organization

## 🤝 Contributing

Found a bug? Have a feature request? Contributions are welcome!

1. **Report Issues**: [GitHub Issues](https://github.com/asadrafi1221/auto_translate_npm_package/issues)
2. **Feature Requests**: Open an issue with your idea
3. **Pull Requests**: Fork, improve, and submit a PR
4. **Documentation**: Help improve these docs

## 📄 License

MIT License - Use freely in personal and commercial projects.

## 👨‍💻 About the Author

Built by **Asad Rafi** - A developer who got tired of spending hours on manual i18n setup and decided to automate it once and for all.

- 📧 Email: [asadrafi1221@gmail.com](mailto:asadrafi1221@gmail.com)
- 🐙 GitHub: [asadrafi1221](https://github.com/asadrafi1221)
- 🌐 Package: [auto-translation](https://www.npmjs.com/package/auto-translation)

---

## ⭐ Show Your Support

If this tool saved you hours of work, please:
- ⭐ **Star this package** on npm
- 🐙 **Star the GitHub repo**
- 📢 **Share with your team**
- 🐛 **Report issues** you find
- 💡 **Suggest improvements**

**Every star motivates me to keep building tools that make developers' lives easier!**

---

*Made with ❤️ for the developer community. Because your time should be spent building amazing features, not fighting with i18n setup.*