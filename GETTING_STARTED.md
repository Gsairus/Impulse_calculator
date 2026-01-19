# Quick Start Guide

## Welcome to the Impulse Current Calculator! ⚡

This guide helps you get started quickly with the web application.

## For First-Time Users

### 1. Try the Web App (Recommended)
Once deployed to Vercel, simply visit the URL and start calculating:
- No installation needed
- Works on any device (phone, tablet, computer)
- Instant results with interactive charts

### 2. Local Development Setup

If you want to run the app locally or contribute:

```bash
# 1. Install Node.js 18+ from https://nodejs.org (if not already installed)

# 2. Clone or navigate to the repository
cd Current_Impulses

# 3. Install dependencies (first time only)
npm install

# 4. Start development server
npm run dev

# 5. Open http://localhost:3000 in your browser
```

## Using the Calculator

### Step 1: Select Impulse Type
Choose from dropdown:
- **PEB (10/350 µs)** - Positive first stroke, 200 kA default
- **NEB (1/200 µs)** - Negative first stroke, 100 kA default  
- **NFB (0.25/100 µs)** - Negative subsequent stroke, 50 kA default
- **SEB/SC (8/20 µs)** - Surge current, 10 kA default

### Step 2: Choose Function Type
- **Heidler** - Natural lightning model (recommended)
- **Double Exponential** - Laboratory impulse model
- **Both** - Compare both functions side-by-side
- **Damped Sine** - For SEB/SC surge currents (auto-selected)

### Step 3: Set Peak Current
Enter desired peak current in kiloamperes (kA):
- Default values auto-populate based on impulse type
- Can use custom values (e.g., 282 kA for custom analysis)

### Step 4: Optional Settings
Click "▶ Advanced Options" to customize:
- **Duration**: Leave as "infinity" for auto-calculation
- **Time Step**: Default 1e-8 (10 ns) works well
- **Show di/dt**: Check to see current steepness plot

### Step 5: Calculate
Click "Calculate" button and view:
- Interactive current waveform chart
- Key parameters (Peak, Energy, Charge, Steepness)
- Optional derivative plot (if enabled)
- Comparison table (if "Both" selected)

## Example Calculations

### Standard Lightning Protection Analysis
```
Impulse Type: PEB (10/350 µs)
Function: Heidler
Peak Current: 200 kA
→ Energy: ~10.24 MJ/Ω, Charge: ~100 C
```

### Custom High-Current Scenario
```
Impulse Type: PEB
Function: Both (compare)
Peak Current: 282 kA
→ Compare Heidler vs Double-Exp results
```

### Surge Protection Device Testing
```
Impulse Type: SEB (8/20 µs)
Function: Damped Sine
Peak Current: 15 kA
→ Energy: ~0.003 MJ/Ω, Charge: ~0.4 C
```

## Understanding Results

### Parameter Cards
- **Peak Current**: Maximum current value in kA
- **Specific Energy (W/R)**: Energy per unit resistance (MJ/Ω or kJ/Ω)
- **Charge (Q)**: Total charge transfer in Coulombs
- **Max Steepness (di/dt)**: Maximum current rise rate in kA/µs

### Interactive Chart
- **Zoom**: Scroll or pinch to zoom
- **Pan**: Drag to move around
- **Hover**: See exact values at any point
- **Time axis**: Microseconds (µs)
- **Current axis**: Kiloamperes (kA)

### Comparison Mode
When using "Both" function type:
- Two charts show Heidler vs Double-Exponential
- Side-by-side parameter comparison
- Differences typically small but measurable
- Heidler often preferred for natural lightning

## Tips & Best Practices

### For Mobile Users
- Rotate to landscape for better chart viewing
- Use two-finger zoom on charts
- Scroll down to see all results

### For Accurate Results
- Use default time step (1e-8) for most cases
- For faster impulses (NEB, NFB), consider smaller step (1e-9)
- Leave duration as "infinity" for auto-calculation
- Enable derivative plot to analyze current steepness

### For Comparisons
- Select "Both" to compare Heidler and Double-Exp
- Parameters should be very close (< 1% difference typically)
- Energy and charge most critical for protection design
- Peak current should match exactly (normalized)

## Python Notebooks (Advanced Users)

Original Python implementations available in `/Python` folder:
- More detailed analysis capabilities
- CSV export options
- Batch processing
- Custom parameter exploration

See [README.md](README.md) for Python usage instructions.

## Troubleshooting

### App won't load
- Clear browser cache
- Try different browser (Chrome, Firefox, Safari)
- Check internet connection

### Results seem wrong
- Verify input units (kA, not A)
- Check impulse type matches your needs
- Compare with reference values in README
- Try Python notebooks for verification

### Charts not displaying
- Enable JavaScript in browser
- Update browser to latest version
- Try desktop if mobile has issues

### Build errors (developers)
```bash
# Clean install
rm -rf node_modules .next
npm install
npm run build
```

## Next Steps

1. **Deploy to Vercel**: See [DEPLOYMENT.md](DEPLOYMENT.md)
2. **Learn More**: Read [README.md](README.md) for technical details
3. **Python Version**: Explore notebooks in `/Python` folder
4. **Contribute**: Fork on GitHub and submit improvements

## Support

- GitHub: https://github.com/Gsairus/Impulse_calculator
- Documentation: README.md, DEPLOYMENT.md
- Python reference: /Python/impulse_calculator_LITE.ipynb

---

**Ready to calculate? Let's go!** ⚡
