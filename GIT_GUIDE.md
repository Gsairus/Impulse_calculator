# Git Commit & Push Guide

## Quick Commands for GitHub

### First Time Setup (if not already done)

```bash
# Navigate to project directory
cd /Users/eduardshulzhenko/myTresor/Sync/DBKeeper/DB_Apps_&_Algorithmus/Python/Current_Impulses

# Initialize git repository (if needed)
git init

# Add all files
git add .

# Make initial commit
git commit -m "feat: Complete Next.js impulse current calculator web app

- Port Python calculation engine to TypeScript
- Implement responsive UI with Chart.js visualizations
- Support all impulse types: PEB, NEB, NFB, SEB/SC
- Add Heidler, Double-Exp, and Damped Sine functions
- Create mobile-friendly interface for iPhone, Android, iPad
- Archive original Python notebooks in /Python folder
- Add comprehensive documentation and deployment guide
- Configure for Vercel deployment
- Include SVG placeholders and AI prompt for branding
- Verify calculations match original Python outputs"

# Add remote repository
git remote add origin https://github.com/Gsairus/Impulse_calculator.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Subsequent Updates

```bash
# Check status
git status

# Add changes
git add .

# Commit with message
git commit -m "Your commit message here"

# Push to GitHub
git push
```

## Verifying Remote Connection

```bash
# Check if remote is set
git remote -v

# Should show:
# origin  https://github.com/Gsairus/Impulse_calculator.git (fetch)
# origin  https://github.com/Gsairus/Impulse_calculator.git (push)
```

## Common Scenarios

### Scenario 1: Repository Already Exists on GitHub (Empty)

```bash
git init
git add .
git commit -m "feat: Initial commit - Impulse Calculator web app"
git remote add origin https://github.com/Gsairus/Impulse_calculator.git
git branch -M main
git push -u origin main
```

### Scenario 2: Repository Already Exists with Files

```bash
git init
git add .
git commit -m "feat: Initial commit - Impulse Calculator web app"
git remote add origin https://github.com/Gsairus/Impulse_calculator.git
git branch -M main
git pull origin main --allow-unrelated-histories  # If needed
git push -u origin main
```

### Scenario 3: Fresh Start

```bash
# If you need to start fresh
rm -rf .git
git init
git add .
git commit -m "feat: Complete impulse calculator web application"
git remote add origin https://github.com/Gsairus/Impulse_calculator.git
git branch -M main
git push -u origin main --force  # Use with caution!
```

## What Will Be Pushed

### Included Files
- ✅ All source code (app/, components/, lib/)
- ✅ Configuration files (package.json, tsconfig.json, etc.)
- ✅ Documentation (README.md, DEPLOYMENT.md, etc.)
- ✅ Assets (public/, assets/)
- ✅ Python notebooks in /Python folder
- ✅ .gitignore file

### Excluded Files (via .gitignore)
- ❌ node_modules/ (dependencies)
- ❌ .next/ (build output)
- ❌ .env.local (environment variables)
- ❌ Build artifacts

## After Pushing to GitHub

### 1. Verify on GitHub
Visit https://github.com/Gsairus/Impulse_calculator.git and check:
- [ ] All files are present
- [ ] README.md displays correctly
- [ ] File structure matches local

### 2. Deploy to Vercel
See DEPLOYMENT.md for detailed instructions:

```bash
# Option A: Use Vercel Dashboard
1. Go to vercel.com
2. Click "Import Project"
3. Select your GitHub repository
4. Click "Deploy"

# Option B: Use Vercel CLI
npm install -g vercel
vercel login
vercel --prod
```

### 3. Update README with Live URL
After deployment, edit README.md:
```markdown
**Live App**: https://your-app-name.vercel.app
```

Then commit and push the update:
```bash
git add README.md
git commit -m "docs: Add live app URL"
git push
```

## Troubleshooting

### Authentication Error
```bash
# Use GitHub Personal Access Token
# Create token at: https://github.com/settings/tokens
# Use token as password when prompted
```

### Remote Already Exists
```bash
# Remove old remote
git remote remove origin

# Add new remote
git remote add origin https://github.com/Gsairus/Impulse_calculator.git
```

### Large Files Warning
```bash
# If you get warnings about large files
# Check file size
du -sh Python/SOURCES/myThesis.pdf

# Large PDFs are fine for GitHub (< 100MB)
# If needed, use Git LFS for very large files
```

### Permission Denied
```bash
# Check if you're logged in to correct GitHub account
git config user.name
git config user.email

# Set if needed
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

## Branch Management (Future)

For future development:

```bash
# Create feature branch
git checkout -b feature/new-feature

# Work on feature, commit changes
git add .
git commit -m "feat: Add new feature"

# Push feature branch
git push -u origin feature/new-feature

# Create Pull Request on GitHub
# After review, merge to main
```

## Git Best Practices

### Commit Message Format
```
type: Brief description

Optional detailed explanation

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation changes
- style: Code style changes (formatting)
- refactor: Code refactoring
- test: Adding tests
- chore: Maintenance tasks
```

### Examples
```bash
git commit -m "feat: Add derivative plotting option"
git commit -m "fix: Correct Heidler function normalization"
git commit -m "docs: Update deployment instructions"
git commit -m "style: Format TypeScript files"
```

## Quick Reference

```bash
# See what changed
git status
git diff

# Stage files
git add .                    # All files
git add app/page.tsx         # Specific file

# Commit
git commit -m "message"

# Push
git push

# Pull latest changes
git pull

# View commit history
git log --oneline

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Discard local changes
git checkout -- filename
```

## Summary

**Ready to push?**

```bash
cd /Users/eduardshulzhenko/myTresor/Sync/DBKeeper/DB_Apps_\&_Algorithmus/Python/Current_Impulses
git init
git add .
git commit -m "feat: Complete Next.js impulse current calculator web app"
git remote add origin https://github.com/Gsairus/Impulse_calculator.git
git branch -M main
git push -u origin main
```

Then deploy to Vercel and enjoy your live app! 🚀
