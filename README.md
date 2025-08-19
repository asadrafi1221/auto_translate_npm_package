Auto-Translation CLI
🌍 Automated internationalization (i18n) setup and management tool for modern web applications

A powerful command-line interface that streamlines the process of setting up, managing, and maintaining translation keys in your projects. Automatically extract translatable strings, wrap them with translation functions, and manage your i18n workflow with ease.

✨ Features
🏗️ One-command setup: Initialize complete i18n structure with dependencies
🔍 Smart scanning: Automatically detect and extract translation keys from your codebase
🔄 Auto-wrapping: Intelligently wrap plain text with translation function calls
📁 File management: Organize and maintain translation files effortlessly
🎯 Zero configuration: Works out of the box with sensible defaults
🚀 Framework agnostic: Compatible with React, Vue, Angular, and more
🚀 Quick Start
Installation
bash
# Install globally
npm install -g auto-translation

# Or use with npx (recommended)
npx auto-translation init
Initialize Your Project
bash
# Set up i18n structure and install dependencies
npx auto-translation init
This command will:

Create the necessary folder structure
Install required i18n dependencies
Generate configuration files
Provide setup instructions
📖 Commands
init - Complete Setup
bash
npx auto-translation init
What it does:

🏗️ Sets up the complete i18n folder structure
📦 Installs necessary dependencies
⚙️ Creates configuration files
📋 Provides step-by-step next steps
Perfect for: First-time setup of internationalization in your project

scan - Extract Translation Keys
bash
npx auto-translation scan
What it does:

🔍 Scans your entire codebase for translatable strings
🗝️ Extracts and catalogs translation keys
📝 Updates translation files with new keys
🔄 Maintains existing translations
Perfect for: Regular maintenance and discovering new strings to translate

wrap - Auto-wrap Plain Text
bash
npx auto-translation wrap
What it does:

🔄 Identifies plain text strings in your code
🏷️ Automatically wraps them with t() translation calls
🎯 Smart detection to avoid wrapping non-translatable content
💾 Updates your source files in place
Perfect for: Converting existing projects to use internationalization

file-update - Manage Translation Files
bash
npx auto-translation file-update
What it does:

📁 Organizes translation file structure
🧹 Cleans up unused translation keys
🔄 Synchronizes keys across language files
📊 Provides translation status reports
Perfect for: Maintaining clean and organized translation files

setup - Folder Structure Only
bash
npx auto-translation setup
What it does:

📁 Creates the i18n folder structure
📄 Sets up basic configuration files
⚙️ Prepares your project for internationalization
Perfect for: When you only need the folder structure without dependencies

🗂️ Project Structure
After running init, your project will have this structure:

your-project/
├── i18n/
│   ├── locales/
│   │   ├── en/
│   │   │   └── common.json
│   │   ├── es/
│   │   │   └── common.json
│   │   └── fr/
│   │       └── common.json
│   ├── config.js
│   └── index.js
├── components/
├── pages/
└── package.json
🔧 Configuration
The tool creates a configuration file at i18n/config.js with customizable options:

javascript
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
    'build/**'
  ],
  
  // Translation function names
  translationFunctions: ['t', 'translate', '$t']
};
💻 Usage Examples
Basic Workflow
Initialize your project:
bash
npx auto-translation init
Import i18n in your layout/app file:
javascript
import './i18n';
Scan for translation keys:
bash
npx auto-translation scan
Wrap existing plain text:
bash
npx auto-translation wrap
Before and After
Before wrapping:

jsx
const WelcomeComponent = () => {
  return <h1>Welcome to our application</h1>;
};
After wrapping:

jsx
const WelcomeComponent = () => {
  return <h1>{t('welcome_to_our_application')}</h1>;
};
Generated translation file (en/common.json):

json
{
  "welcome_to_our_application": "Welcome to our application"
}
🛠️ Advanced Usage
Custom File Patterns
Modify the scan patterns in your config to target specific files:

javascript
// i18n/config.js
module.exports = {
  scanPatterns: [
    'src/**/*.vue',           // Vue files
    'src/**/*.svelte',        // Svelte files
    'app/**/*.php'            // PHP files
  ]
};
Integration with Build Tools
Add scripts to your package.json:

json
{
  "scripts": {
    "i18n:scan": "auto-translation scan",
    "i18n:wrap": "auto-translation wrap",
    "i18n:update": "auto-translation file-update",
    "build": "auto-translation scan && next build"
  }
}
🎯 Best Practices
1. Regular Scanning
Run scan regularly during development to catch new translatable strings:

bash
# Add to your git hooks
npx auto-translation scan
2. Meaningful Key Names
The tool generates semantic key names based on content:

"Hello World" → hello_world
"User Profile Settings" → user_profile_settings
3. Namespace Organization
Organize translations by feature or component:

json
{
  "navigation": {
    "home": "Home",
    "about": "About",
    "contact": "Contact"
  },
  "forms": {
    "submit": "Submit",
    "cancel": "Cancel"
  }
}
🔍 Troubleshooting
Common Issues
Q: The tool isn't finding my files

Check your scanPatterns in the config file
Ensure file extensions are included in the patterns
Verify paths are relative to your project root
Q: Dependencies aren't installing

Ensure you have Node.js 16+ installed
Check your package manager (npm/yarn/pnpm) is working
Try running with --verbose flag for detailed output
Q: Wrapped text looks incorrect

Review the generated changes before committing
Adjust translationFunctions array in config if using custom function names
Use git diff to review changes
Getting Help
bash
# Show available commands
npx auto-translation

# Check version
npx auto-translation --version
🛣️ Roadmap
 Support for nested translation keys
 Integration with popular i18n libraries
 Translation validation and checking
 Automated translation services integration
 VS Code extension
 Git hooks integration
 Translation statistics and coverage reports
📋 Requirements
Node.js: 16.0.0 or higher
NPM/Yarn/PNPM: Latest stable version
Supported frameworks: React, Vue, Angular, Svelte, and more
🤝 Contributing
We welcome contributions! Here's how you can help:

🐛 Report bugs - Open an issue with reproduction steps
💡 Suggest features - Share your ideas for improvements
🔧 Submit PRs - Fix bugs or add new features
📚 Improve docs - Help make the documentation better
📄 License
MIT License - feel free to use this tool in your projects!

🙏 Acknowledgments
Built with ❤️ for the developer community. Special thanks to all contributors and users who help make internationalization easier for everyone.

Made your internationalization workflow smoother? ⭐ Star this project and share it with your team!

