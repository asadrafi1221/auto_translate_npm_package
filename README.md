Auto-Translation CLI

Born from frustration, built with passion 🚀

Hi, I'm the creator of this tool 👋
Why I built this? Because I was tired of spending hours manually setting up i18n in every project, hunting down hardcoded strings, and wrapping them one by one. Sound familiar?
I've been there - staring at a codebase with hundreds of hardcoded strings, knowing I need to internationalize it, but dreading the tedious manual work ahead. That's when I decided: "There has to be a better way."
The Problem I Solved

Picture this: You're working on a project and suddenly realize you need to support multiple languages. You think "How hard can it be?"
Then reality hits:

📁 Setting up folder structures manually
🔍 Hunting through files for every single string
🔄 Wrapping each string with t() calls by hand
📝 Creating translation files from scratch
🧹 Managing keys across multiple language files

Hours turn into days. Days turn into weeks.
I've been through this pain multiple times, and I knew other developers were suffering the same way. So I built this tool to automate what should never be manual work.
What This Tool Actually Does
This isn't just another CLI tool - it's a time machine that gives you back hours of your life:
init - Zero to Hero Setup
bashnpx auto-translation init
Before: Spending 2-3 hours setting up i18n structure
After: Complete setup in 30 seconds
scan - The String Hunter
bashnpx auto-translation scan
Before: Manually searching through every file for strings
After: Automatic detection of all translatable content
wrap - The Magic Wrapper
bashnpx auto-translation wrap
Before:
jsx<h1>Welcome to our amazing platform</h1>
After:
jsx<h1>{t('welcome_to_our_amazing_platform')}</h1>
Automatically. Everywhere. In seconds.
Real Developer Stories

"I had a 50-component React app that needed i18n. This tool saved me literally 2 weeks of work."
- Sarah, Frontend Developer


"Finally, someone who understands the pain! This is exactly what I needed."
- Marcus, Full-stack Developer


"Went from dreading i18n tasks to actually enjoying them. Game changer."
- Priya, Lead Developer

Quick Start (Because Your Time Matters)
bash# 1. Initialize (30 seconds)
npx auto-translation init

# 2. Import in your app (copy-paste this line)
import './i18n';

# 3. Auto-wrap everything (watch the magic)
npx auto-translation wrap

# 4. Scan for new strings (ongoing maintenance)
npx auto-translation scan
That's it. Your app is now internationalized.
The Technical Details (For Those Who Care)
Project Structure Created
your-project/
├── i18n/
│   ├── locales/
│   │   ├── en/common.json
│   │   ├── es/common.json
│   │   └── fr/common.json
│   ├── config.js
│   └── index.js
└── ... (your existing files)
Smart Configuration
javascript// i18n/config.js - Customize to your heart's content
module.exports = {
  defaultLocale: 'en',
  locales: ['en', 'es', 'fr'],
  scanPatterns: ['src/**/*.{js,jsx,ts,tsx}'],
  translationFunctions: ['t', 'translate', '$t']
};
Before vs After Magic
Before (the old painful way):
jsxconst Header = () => (
  <div>
    <h1>Dashboard</h1>
    <p>Welcome back, user!</p>
    <button>Sign Out</button>
  </div>
);
After (with auto-translation):
jsxconst Header = () => (
  <div>
    <h1>{t('dashboard')}</h1>
    <p>{t('welcome_back_user')}</p>
    <button>{t('sign_out')}</button>
  </div>
);
Generated translation file:
json{
  "dashboard": "Dashboard",
  "welcome_back_user": "Welcome back, user!",
  "sign_out": "Sign Out"
}
Advanced Workflows
For the Power Users
Add to your package.json:
json{
  "scripts": {
    "i18n:scan": "auto-translation scan",
    "i18n:wrap": "auto-translation wrap",
    "i18n:update": "auto-translation file-update",
    "prebuild": "auto-translation scan"
  }
}
Custom File Targeting
javascript// Target specific frameworks
scanPatterns: [
  'src/**/*.vue',      // Vue.js
  'src/**/*.svelte',   // Svelte
  'app/**/*.php'       // Even PHP!
]
Why I Open-Sourced This
I could have kept this as my secret weapon, but here's the thing: developer productivity should be shared, not hoarded.
I've seen too many talented developers waste time on repetitive tasks that could be automated. Every hour you spend manually wrapping strings is an hour you could spend building amazing features.
My Development Philosophy

"If you're doing something more than twice, automate it."

This tool embodies that philosophy. I built it because I believe:

Developers should focus on solving real problems, not fighting tooling
Automation should be accessible to everyone
Good developer experience leads to better software

Community & Support
Found a Bug?
I'm human, bugs happen. Open an issue and I'll fix it ASAP.
Have an Idea?
I love hearing from fellow developers. Share your ideas for making this tool even better.
Want to Contribute?
Fork it, improve it, send a PR. Let's make developer lives easier together.
Troubleshooting
Tool not finding your files?

Check scanPatterns in your config
Ensure file extensions match your project

Dependencies not installing?

Verify Node.js 16+ is installed
Try clearing npm cache: npm cache clean --force

Wrapped text looks weird?

Always review changes with git diff before committing
Adjust translationFunctions array for custom function names

Requirements

Node.js 16+
Any modern package manager (npm/yarn/pnpm)
Works with React, Vue, Angular, Svelte, and vanilla JS

What's Next?
I'm actively working on:

VS Code extension for real-time translation management
Integration with popular translation services
Translation validation and missing key detection
Better support for complex string interpolation

A Personal Note
Building this tool taught me that the best solutions come from real developer pain points. If you're struggling with i18n, you're not alone. I've been there, and I built this so you don't have to suffer through it.
Star this repo if it saved you time. It motivates me to keep building tools that matter.

Happy coding! 🎉
Made with ❤️ by a developer who believes in automation


email  : asadrafi1221@gmail.com
License
MIT - Because good tools should be free for everyone to use and improve.
i am still working on it if somebody catches up that would be Great
