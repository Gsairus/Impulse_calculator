# Deployment Guide - Vercel

## Prerequisites

1. GitHub account with repository: https://github.com/Gsairus/Impulse_calculator.git
2. Vercel account (free tier available at https://vercel.com)
3. Node.js 18+ installed locally for testing

## Local Development

### First Time Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open http://localhost:3000 in your browser.

### Building for Production

```bash
# Test production build locally
npm run build
npm start
```

## Deploying to Vercel

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Create Vercel Account**
   - Go to https://vercel.com
   - Sign up with your GitHub account

2. **Import GitHub Repository**
   - Click "Add New Project"
   - Select "Import Git Repository"
   - Choose `Gsairus/Impulse_calculator`
   - Click "Import"

3. **Configure Project**
   - Framework Preset: Next.js (auto-detected)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
   - Install Command: `npm install` (default)
   - No environment variables needed for Phase 1

4. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes for build to complete
   - Your app will be live at: `https://impulse-calculator-[random].vercel.app`

5. **Custom Domain (Optional)**
   - Go to Project Settings → Domains
   - Add your custom domain
   - Follow DNS configuration instructions

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy (from project root)
vercel

# Deploy to production
vercel --prod
```

## Automatic Deployments

Once connected to GitHub, Vercel will automatically:
- Deploy every push to `main` branch → Production
- Deploy every pull request → Preview deployment
- Run builds and tests before deploying

## Post-Deployment Checklist

- [ ] Test app on production URL
- [ ] Test on mobile devices (iPhone, Android)
- [ ] Test on tablet (iPad)
- [ ] Verify calculations match Python notebook outputs
- [ ] Check responsive design on different screen sizes
- [ ] Test all impulse types (PEB, NEB, NFB, SEB, SC)
- [ ] Test function comparisons (Heidler vs Double-Exp)

## Updating Your Deployment

Simply push changes to GitHub:

```bash
git add .
git commit -m "Update calculator"
git push origin main
```

Vercel will automatically rebuild and redeploy (usually takes 2-3 minutes).

## Troubleshooting

### Build Fails

Check build logs in Vercel dashboard:
- Common issues: TypeScript errors, missing dependencies
- Fix locally first: `npm run build`

### App Not Loading

- Check browser console for errors
- Verify all dependencies installed: `npm install`
- Clear browser cache

### Performance Issues

- Charts loading slowly: Already optimized with downsampling
- Large time arrays: Use larger time steps (dt) in advanced options

## Production URL

After deployment, update README.md with your live URL:
```
🌐 **Live App**: https://your-app-name.vercel.app
```

## Future Enhancements (Phase 2)

When adding authentication:
1. Add environment variables in Vercel dashboard
2. Update `.env.example` template
3. Configure database connection strings
4. Enable authentication providers
