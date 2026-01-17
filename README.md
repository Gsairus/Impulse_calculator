# Universal Impulse Current Calculator

A comprehensive Python/Jupyter notebook tool for calculating lightning impulse current parameters according to IEC 62305-1 standards.

## Features

### Supported Impulse Functions
- **Heidler Function** (Equation D.1) - Models natural lightning currents
- **Double-Exponential Function** (Equation D.2) - Models laboratory impulse currents

### Standard Impulse Types
- **PEB (10/350 µs)**: Positive First Stroke - 200 kA
- **NEB (1/200 µs)**: Negative First Stroke - 100 kA
- **NFB (0.25/100 µs)**: Negative Subsequent Stroke - 50 kA
- **8/20 µs**: Short impulse for SPD testing - 10 kA

### Calculated Parameters
- **Peak Current** (I_peak) in kA
- **Specific Energy** (W/R) in MJ/Ω - integral of i²(t)dt
- **Charge** (Q) in Coulombs - integral of i(t)dt
- **Maximum Current Steepness** (di/dt)_max in kA/µs

## Installation

Required Python packages:
```bash
pip install numpy matplotlib pandas scipy
```

For Jupyter notebook support:
```bash
pip install jupyter
```

## Quick Start

1. Open the notebook:
```bash
jupyter notebook impulse_current_calculator.ipynb
```

2. Run all cells to define functions and parameters

3. Use the main calculation function:
```python
# Example: Calculate 10/350 µs impulse with Heidler function
results = run_impulse_calculation(
    impulse_type='PEB',      # PEB, NEB, NFB, or 8/20
    function_type='heidler', # heidler, double_exp, or both
    I_peak=200e3,            # Peak current in Amperes
    duration=1e-3,           # Simulation duration in seconds
    dt=1e-8,                 # Time step in seconds
    show_derivative=True     # Show di/dt plot
)
```

## Usage Examples

### Example 1: Standard 200 kA PEB Impulse
```python
results = run_impulse_calculation(
    impulse_type='PEB',
    function_type='heidler',
    I_peak=200e3,
    duration=1e-3,
    dt=1e-8,
    show_derivative=True
)
```

### Example 2: Custom Peak Current (e.g., 282 kA)
```python
results = run_impulse_calculation(
    impulse_type='PEB',
    function_type='heidler',
    I_peak=282e3,  # Custom amplitude
    duration=1e-3,
    dt=1e-8
)
```

### Example 3: Compare Both Functions
```python
results = run_impulse_calculation(
    impulse_type='NEB',
    function_type='both',
    compare_functions_flag=True
)
```

## Parameter Tables

### Table D.1: Time Constants (from thesis)
All time constants (τ₁, τ₂) and correction factors (η) are pre-configured for:
- Heidler function parameters
- Double-exponential function parameters

### Table D.2: Reference Values (LPL I)
Standard reference values for Lightning Protection Level I according to IEC 62305-1.

## Output

### Calculated Values
- Peak current and time to peak
- Specific energy (W/R) in MJ/Ω and kJ/Ω
- Charge (Q) in Coulombs
- Maximum steepness (di/dt)_max
- Deviation from reference values (%)

### Visualizations
- Current waveform i(t) vs time
- Current steepness di/dt vs time (optional)
- Comparison plots between Heidler and double-exponential functions
- Annotated plots with key parameters

### Export Options
- Summary CSV table with all calculated parameters
- Individual waveform CSV files (time, current)
- Results dictionary for further processing

## Comparison with imcFAMOS

This tool replicates your imcFAMOS workflow:

**imcFAMOS Code:**
```
ImVar=282000
etaVar=0.93
Tau1Var=485e-6
Tau2Var=19e-6
deltaXVar=1e-8
durationVar=1e-3
```

**Python Equivalent:**
```python
results = run_impulse_calculation(
    impulse_type='PEB',
    function_type='heidler',
    I_peak=282e3,      # ImVar
    duration=1e-3,     # durationVar
    dt=1e-8            # deltaXVar
)

# Access results
specific_energy = results['heidler']['W_R']  # J/Ω
charge = results['heidler']['Q']             # C
```

## Technical Details

### Simulation Parameters
- **Default time step**: 10 ns (1e-8 s) for 10/350 µs
- **Recommended time step**: 1 ns (1e-9 s) for faster impulses (1/200 µs, 0.25/100 µs)
- **Duration**: Adjustable based on impulse type (typically 1 ms for PEB, 300-500 µs for NEB/NFB)

### Numerical Integration
- Trapezoidal rule for specific energy and charge calculation
- Numpy gradient for current steepness calculation

## References

- IEC 62305-1 (DIN EN 62305-1) - Lightning Protection Standard
- IEC 61400-24 - Wind Turbine Lightning Protection
- Thesis Appendix D: Lightning Impulse Currents and Functions
- Thesis Appendix E: Frequency Domain Analysis

## File Structure

```
.
├── impulse_current_calculator.ipynb  # Main notebook
├── README.md                          # This file
├── SOURCES/
│   ├── myThesis.pdf                  # Reference thesis
│   └── Pipeline_pFS150kA_50m.ipynb   # Example pipeline
```

## Author

Created as a universal tool for lightning impulse current analysis based on IEC standards and thesis research.

## License

Free to use for research and educational purposes.
