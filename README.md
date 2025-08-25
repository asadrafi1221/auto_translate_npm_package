# Auto Translation 🌐

A powerful CLI tool for automating internationalization (i18n) in your React projects. Streamline your translation workflow with intelligent text extraction, automated wrapping, and seamless i18n setup.

## ✨ Features

- 🚀 **One-command setup** - Initialize complete i18n structure instantly
- 🔍 **Smart text scanning** - Automatically detect translatable content
- 🔄 **Automatic wrapping** - Convert plain text to translation calls
- 📁 **File management** - Organize and maintain translation files
- 🎯 **Mode-based workflow** - Project-specific configurations
- 🔒 **Strict mode** - Lock project to prevent mode conflicts
- 📊 **Configuration tracking** - Persistent project settings

## 🏗️ Architecture

The package operates in different modes to support various project types:

- **React Mode** 🔵 - Full React i18n support (Currently Available)
- **React Native Mode** 📱 - Mobile app support (Coming Soon)
- **Node.js Mode** 🟢 - Backend/server support (Coming Soon)

## 📦 Installation

```bash
npm install -g auto-translation
# or
npx auto-translation
```

**Links:**

- 📦 [NPM Package](https://www.npmjs.com/package/auto-translation)
- 🐙 [GitHub Repository](https://github.com/asadrafi1221/auto_translate_npm_package)

## 🚀 Quick Start

### 1. Initialize Your Project

```bash
npx auto-translation
```

Select **React** mode when prompted. This will:

- Set up your project configuration
- Create the necessary folder structure

### 2. Complete React i18n Setup

```bash
npx auto-translation init
```

This command will:

- ✅ Install required dependencies (`react-i18next`, `i18next`)
- 🏗️ Create i18n folder structure
- 📝 Generate configuration files
- 🔧 Set up translation namespace files

### 3. Scan and Extract Translation Keys

```bash
npx auto-translation scan
```

Interactive file selection process:

- 📂 Choose directories or specific files to scan
- 🔍 Automatically detect translatable text
- 📝 Extract keys to translation files
- 🎯 Smart detection of JSX text content

### 4. Auto-wrap Plain Text (Optional)

```bash
npx auto-translation wrap
```

Automatically converts plain text to translation calls:

```jsx
// Before
<h1>Welcome to our app</h1>

// After
<h1>{t('welcome_to_our_app')}</h1>
```

## 📋 Available Commands

### Core Commands (Auto-prefixed based on your project mode)

| Command       | Description                                  |
| ------------- | -------------------------------------------- |
| `init`        | Complete i18n setup with dependencies        |
| `scan`        | Scan and extract translation keys from files |
| `wrap`        | Wrap plain text with t() translation calls   |
| `file-update` | Manage translation files and structure       |
| `setup`       | Setup i18n folder structure only             |
| `ignore-init` | Initialize .ignoreKeys file                  |

> 💡 **Smart Mode System**: Commands are automatically prefixed based on your project mode. When in React mode, `scan` becomes `react-scan` internally.

### Configuration Commands

| Command        | Description                        |
| -------------- | ---------------------------------- |
| `config`       | Show current project configuration |
| `reset-config` | Reset configuration to defaults    |

### Mode Management

| Command                | Description                     |
| ---------------------- | ------------------------------- |
| `npx auto-translation` | Interactive mode selection menu |

## 🎯 Project Modes & Smart Command System

### Mode Selection

When you first run the CLI, you'll select a project mode that determines available commands and behavior.

### Smart Command Prefixing 🎯

The package automatically handles command prefixing based on your selected mode:

- In **React mode**: `scan` → `react-scan` (handled internally)
- In **React Native mode**: `scan` → `rn-scan` (coming soon)
- In **Node.js mode**: `scan` → `node-scan` (coming soon)

You simply use the clean commands like `scan`, `init`, `wrap` - the mode system handles the rest!

### Strict Mode 🔒

Once you run mode-specific commands, the project enters **strict mode**:

- Prevents accidental cross-mode command usage
- Locks the project to the selected mode
- Ensures consistency across team members

### Unlocking Modes

To change modes or disable strict mode:

```bash
npx auto-translation
# Select "Unlock strict mode" from the menu
```

## 📁 Generated Structure

After running `init`, your project will have:

```
your-project/
├── src/
│   └── i18n/
│       ├── index.js          # i18n configuration
│       ├── locales/
│       │   ├── en/
│       │   │   └── common.json
│       │   └── es/
│       │       └── common.json
│       └── resources.js      # Resource loader
└── .translate-package-config  # Project configuration
```

## 🔧 Configuration File

The `.translate-package-config` file stores:

```json
{
  "mode": "react",
  "strictLocked": true,
  "createdAt": "2025-01-15T10:30:00.000Z",
  "lastModified": "2025-01-15T10:35:00.000Z"
}
```

## 🎮 Interactive Workflows

### File Selection During Scan

When running `scan`, you'll get an interactive file picker:

- Select individual files or entire directories
- Preview files before processing
- Skip files that shouldn't be translated

### Ignore Keys Setup

Use `ignore-init` to create an `.ignoreKeys` file for:

- Technical terms that shouldn't be translated
- Brand names and proper nouns
- Code-specific terminology

## 💡 Best Practices

### 1. Project Setup Workflow

```bash
# 1. Initialize project mode
npx auto-translation

# 2. Complete i18n setup
npx auto-translation init

# 3. Import i18n in your main component
import '../i18n'

# 4. Scan for translation keys
npx auto-translation scan

# 5. (Optional) Auto-wrap remaining text
npx auto-translation wrap
```

### 2. Team Collaboration

- Commit `.translate-package-config` to version control
- Use strict mode to ensure consistency
- Share `.ignoreKeys` file across team members

### 3. Maintenance

- Run `scan` regularly for new components
- Use `file-update` to reorganize translation files
- Monitor configuration with `config` command

## 🔍 Usage Examples

### Basic React Setup

```bash
# Initialize new React project for i18n
npx auto-translation
# Choose "React" mode

# Complete setup with dependencies
npx auto-translation init

# Scan components for translatable text
npx auto-translation scan
# Select files/folders to process
```

### Advanced Workflow

```bash
# Check project status
npx auto-translation config

# Initialize ignore patterns
npx auto-translation ignore-init

# Scan specific components
npx auto-translation scan

# Manage translation files
npx auto-translation file-update

# Auto-wrap any remaining plain text
npx auto-translation wrap
```

## 🚧 Coming Soon

- **React Native Mode** 📱 - Complete mobile app i18n support
- **Node.js Mode** 🟢 - Backend translation management
- **Advanced scanning options** - Custom patterns and rules
- **Translation validation** - Consistency checking
- **Bulk operations** - Mass file processing

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the [repository](https://github.com/asadrafi1221/auto_translate_npm_package)
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

**Repository:** [https://github.com/asadrafi1221/auto_translate_npm_package](https://github.com/asadrafi1221/auto_translate_npm_package)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For issues, questions, or feature requests:

- 🐛 **Issues & Bugs**: [Create an issue on GitHub](https://github.com/asadrafi1221/auto_translate_npm_package/issues)
- 💬 **Questions**: Check existing documentation or open a discussion
- 📧 **Direct Contact**: [asadradi1221@gmail.com](mailto:asadradi1221@gmail.com)
- 📦 **NPM Package**: [auto-translation on npm](https://www.npmjs.com/package/auto-translation)

## 🔗 Links

- **GitHub Repository**: [https://github.com/asadrafi1221/auto_translate_npm_package](https://github.com/asadrafi1221/auto_translate_npm_package)
- **NPM Package**: [https://www.npmjs.com/package/auto-translation](https://www.npmjs.com/package/auto-translation)
- **Author**: [asadradi1221@gmail.com](mailto:asadradi1221@gmail.com)

---

**Made with ❤️ for the international development community**
