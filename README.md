# Universal Impulse Current Calculator

A comprehensive web application and Python toolkit for calculating lightning impulse current parameters according to IEC 62305-1 standards.

## 🌐 Web Application

**Live App**: [Deploy to get URL - see DEPLOYMENT.md](DEPLOYMENT.md)

### Features
- **Responsive Design**: Works on iPhone, Android, iPad, and desktop
- **Interactive Charts**: Real-time visualization with Chart.js
- **No Installation Required**: Access from any device with a browser
- **Modern UI**: Clean, professional interface with dark mode support

### Supported Impulse Types
- **PEB (10/350 µs)**: Positive First Stroke - 200 kA (Type 1, LPL-related)
- **NEB (1/200 µs)**: Negative First Stroke - 100 kA
- **NFB (0.25/100 µs)**: Negative Subsequent Stroke - 50 kA
- **SEB/SC (8/20 µs)**: Surge Current - 10 kA (Type 2, switching/surge-related)

### Calculated Parameters
- **Peak Current** (I_peak) in kA
- **Specific Energy** (W/R) in MJ/Ω - integral of i²(t)dt
- **Charge** (Q) in Coulombs - integral of i(t)dt
- **Maximum Current Steepness** (di/dt)_max in kA/µs

### Mathematical Models
- **Heidler Function** (Equation D.1) - Natural lightning currents
- **Double-Exponential Function** (Equation D.2) - Laboratory impulse currents
- **Damped Sine Wave** - Surge currents (8/20 µs)

## 🚀 Quick Start - Web App

### For Users
1. Visit the live app URL (see deployment section)
2. Select impulse type from dropdown
3. Choose function type (Heidler, Double-Exp, or compare both)
4. Enter peak current in kA
5. Click "Calculate" to see results and interactive charts

### For Developers

```bash
# Clone repository
git clone https://github.com/Gsairus/Impulse_calculator.git
cd Impulse_calculator

# Install dependencies
npm install

# Run development server
npm run dev
```

Open http://localhost:3000 in your browser.

#### Build for Production
```bash
npm run build
npm start
```

## 📱 Mobile & Device Support

The web app is optimized for:
- **iOS**: Safari on iPhone and iPad
- **Android**: Chrome, Firefox, Samsung Internet
- **Desktop**: Chrome, Firefox, Safari, Edge
- **Responsive**: Automatically adapts to screen size

## 📓 Python Notebooks (Archive)

Original Python/Jupyter implementations are available in the `/Python` folder:

### Installation
```bash
pip install numpy matplotlib pandas scipy jupyter
```

### Usage
```bash
jupyter notebook Python/impulse_calculator_LITE.ipynb
```

### Python Example
```python
# Calculate 10/350 µs impulse with Heidler function
results = run_impulse_calculation(
    impulse_type='PEB',      # PEB, NEB, NFB, SEB, or SC
    function_type='heidler', # heidler, double_exp, both, or damped_sine
    I_peak=200e3,            # Peak current in Amperes
    duration='infinity',     # Auto-calculate duration
    dt=1e-8,                 # Time step in seconds
    show_derivative=True     # Show di/dt plot
)
```

## 📊 Parameter Database

All parameters from dissertation research (Table D.1 and D.2):

| Impulse | τ₁ (Heidler) | τ₂ (Heidler) | η | n | Reference I_peak |
|---------|--------------|--------------|---|---|------------------|
| PEB     | 18.8 µs      | 485 µs       | 0.93 | 10 | 200 kA |
| NEB     | 1.826 µs     | 285 µs       | 0.988 | 10 | 100 kA |
| NFB     | 0.454 µs     | 143.4 µs     | 0.993 | 10 | 50 kA |
| SEB/SC  | τ=24 µs, ω=120023 | - | 0.615 | - | 10 kA |

## 🛠️ Technology Stack

- **Frontend**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Chart.js with react-chartjs-2
- **Deployment**: Vercel (recommended)
- **Archive**: Python with NumPy, Matplotlib

## 📂 Project Structure

```
.
├── app/                          # Next.js app directory
│   ├── page.tsx                 # Main calculator page
│   ├── layout.tsx               # App layout
│   └── globals.css              # Global styles
├── components/                   # React components
│   ├── CalculatorForm.tsx       # Input form
│   └── ResultsDisplay.tsx       # Results and charts
├── lib/                         # Core calculation engine
│   └── impulseCalculator.ts    # TypeScript port of Python logic
├── public/                      # Static assets
│   ├── banner.svg              # App banner
│   └── icon.svg                # App icon
├── assets/                      # Design assets
│   └── image-prompt.txt        # AI image generation prompt
├── Python/                      # Archived Python notebooks
│   ├── impulse_calculator_LITE.ipynb
│   ├── impulse_current_calculator.ipynb
│   └── SOURCES/
│       ├── myThesis.pdf
│       └── Pipeline_pFS150kA_50m.ipynb
├── package.json                 # Dependencies
├── tailwind.config.ts           # Tailwind configuration
├── next.config.ts               # Next.js configuration
├── vercel.json                  # Vercel deployment config
├── DEPLOYMENT.md                # Deployment guide
└── README.md                    # This file
```

## 🚢 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

### Quick Deploy to Vercel

1. Push code to GitHub: https://github.com/Gsairus/Impulse_calculator.git
2. Import repository in Vercel dashboard
3. Deploy automatically (no configuration needed)
4. Access your live app at provided URL

## 🧪 Testing

Verify calculations match Python notebook outputs:
- PEB 200 kA: W/R ≈ 10.24 MJ/Ω, Q ≈ 100 C
- NEB 100 kA: W/R ≈ 1.44 MJ/Ω, Q ≈ 28.7 C
- NFB 50 kA: W/R ≈ 0.18 MJ/Ω, Q ≈ 7.2 C
- SEB 10 kA: W/R ≈ 0.05 MJ/Ω, Q ≈ 5 C

## 📚 References

- IEC 62305-1 (DIN EN 62305-1) - Lightning Protection Standard
- IEC 61400-24 - Wind Turbine Lightning Protection
- Thesis Appendix D: Lightning Impulse Currents and Functions
- Thesis Appendix E: Frequency Domain Analysis

## 🔮 Future Enhancements (Phase 2)

- User authentication and accounts
- Save calculation history
- Export results as PDF/CSV
- Share calculation URLs
- Custom parameter sets
- Batch calculations

## 👤 Author

Created as a universal tool for lightning impulse current analysis based on IEC standards and dissertation research.

## 📄 License

Free to use for research and educational purposes.

---

## 🎨 Assets & Branding

Design assets for app icon and banner are provided:
- `/public/icon.svg` - App icon placeholder
- `/public/banner.svg` - Banner placeholder  
- `/assets/image-prompt.txt` - Prompt for AI image generation (Google Gemini/ImageFX)

Use the prompt in `image-prompt.txt` to generate professional graphics with your preferred AI tool.

## 💻 Development Commands

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## 🐛 Troubleshooting

### Build errors
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

### Port already in use
```bash
# Use different port
PORT=3001 npm run dev
```

### TypeScript errors
```bash
# Check types
npx tsc --noEmit
```

## 📞 Support

For issues or questions:
1. Check [DEPLOYMENT.md](DEPLOYMENT.md) for deployment help
2. Review Python notebooks in `/Python` folder for calculation reference
3. Open issue on GitHub repository
