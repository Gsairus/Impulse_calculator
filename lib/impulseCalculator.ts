// Impulse Current Calculator Engine
// Port from impulse_calculator_LITE.ipynb to TypeScript

export type ImpulseType = 'PEB' | 'NEB' | 'NFB' | 'SEB' | 'SC';
export type FunctionType = 'heidler' | 'double_exp' | 'both' | 'damped_sine';

interface ImpulseParams {
  name: string;
  designation: string;
  description: string;
  heidler?: {
    tau1: number;
    tau2: number;
    eta: number;
    n: number;
  };
  double_exp?: {
    tau1: number;
    tau2: number;
    eta: number;
  };
  damped_sine?: {
    tau: number;
    omega: number;
    eta: number;
  };
}

interface ReferenceValues {
  I_peak: number;
  Q: number;
  W_R: number;
}

interface CalculationResult {
  I_peak: number;
  I_peak_kA: number;
  t_peak: number;
  W_R: number;
  W_R_MJ: number;
  Q: number;
  di_dt_max: number;
  di_dt_max_kA_us: number;
}

export interface WaveformData {
  time: number[];
  current: number[];
  derivative?: number[];
}

export interface CalculationResults {
  waveform: WaveformData;
  parameters: CalculationResult;
  functionType: string;
}

// Parameter database from dissertation (Table D.1 and D.2)
export const IMPULSE_PARAMS: Record<ImpulseType, ImpulseParams> = {
  PEB: {
    name: 'Positive First Stroke (PEB)',
    designation: '10/350 µs',
    description: 'Lightning current, Type 1',
    heidler: { tau1: 18.8e-6, tau2: 485e-6, eta: 0.93, n: 10 },
    double_exp: { tau1: 4.064e-6, tau2: 470.107e-6, eta: 0.951 },
  },
  NEB: {
    name: 'Negative First Stroke (NEB)',
    designation: '1/200 µs',
    description: 'Negative first stroke',
    heidler: { tau1: 1.826e-6, tau2: 285e-6, eta: 0.988, n: 10 },
    double_exp: { tau1: 0.374e-6, tau2: 284.328e-6, eta: 0.99 },
  },
  NFB: {
    name: 'Negative Subsequent Stroke (NFB)',
    designation: '0.25/100 µs',
    description: 'Negative subsequent stroke',
    heidler: { tau1: 0.454e-6, tau2: 143.4e-6, eta: 0.993, n: 10 },
    double_exp: { tau1: 0.092e-6, tau2: 143.134e-6, eta: 0.995 },
  },
  SEB: {
    name: 'Surge Current (SC)',
    designation: '8/20 µs',
    description: 'Surge current, Type 2',
    damped_sine: { tau: 24e-6, omega: 120023, eta: 0.615 },
  },
  SC: {
    name: 'Surge Current (SC)',
    designation: '8/20 µs',
    description: 'Surge current, Type 2',
    damped_sine: { tau: 24e-6, omega: 120023, eta: 0.615 },
  },
};

export const REFERENCE_VALUES: Record<ImpulseType, ReferenceValues> = {
  PEB: { I_peak: 200e3, Q: 100, W_R: 10e6 },
  NEB: { I_peak: 100e3, Q: 28.7, W_R: 1.44e6 },
  NFB: { I_peak: 50e3, Q: 7.2, W_R: 0.18e6 },
  SEB: { I_peak: 10e3, Q: 5, W_R: 0.05e6 },
  SC: { I_peak: 10e3, Q: 5, W_R: 0.05e6 },
};

/**
 * Heidler function: i(t) = (I/eta) * (t/tau1)^n / (1 + (t/tau1)^n) * exp(-t/tau2)
 */
export function heidlerFunction(
  t: number[],
  I_peak: number,
  tau1: number,
  tau2: number,
  eta: number,
  n: number = 10
): number[] {
  const current = t.map((time) => {
    const t_ratio = time / tau1;
    return (I_peak / eta) * (Math.pow(t_ratio, n) / (1 + Math.pow(t_ratio, n))) * Math.exp(-time / tau2);
  });
  
  // Normalize to exact peak - use reduce to avoid stack overflow with large arrays
  const maxCurrent = current.reduce((max, val) => Math.max(max, val), 0);
  return current.map(i => i * (I_peak / maxCurrent));
}

/**
 * Double-exponential: i(t) = (I/eta) * (exp(-t/tau2) - exp(-t/tau1))
 */
export function doubleExpFunction(
  t: number[],
  I_peak: number,
  tau1: number,
  tau2: number,
  eta: number
): number[] {
  const current = t.map((time) => 
    (I_peak / eta) * (Math.exp(-time / tau2) - Math.exp(-time / tau1))
  );
  
  // Normalize to exact peak - use reduce to avoid stack overflow with large arrays
  const maxCurrent = current.reduce((max, val) => Math.max(max, val), 0);
  return current.map(i => i * (I_peak / maxCurrent));
}

/**
 * Damped sine wave (SEB/SC): i(t) = (I/eta) * exp(-t/tau) * sin(omega*t)
 */
export function dampedSineFunction(
  t: number[],
  I_peak: number,
  tau: number,
  omega: number,
  eta: number
): number[] {
  const current = t.map((time) => 
    (I_peak / eta) * Math.exp(-time / tau) * Math.sin(omega * time)
  );
  
  // Normalize to exact peak - use reduce to avoid stack overflow with large arrays
  const maxCurrent = current.reduce((max, val) => Math.max(max, Math.abs(val)), 0);
  return current.map(i => i * (I_peak / maxCurrent));
}

/**
 * Numerical integration using trapezoidal rule
 */
function trapezoidalIntegration(y: number[], dx: number): number {
  let sum = 0;
  for (let i = 0; i < y.length - 1; i++) {
    sum += (y[i] + y[i + 1]) * dx / 2;
  }
  return sum;
}

/**
 * Calculate numerical gradient (derivative)
 */
function gradient(y: number[], dx: number): number[] {
  const grad: number[] = [];
  
  // Forward difference for first point
  grad.push((y[1] - y[0]) / dx);
  
  // Central difference for interior points
  for (let i = 1; i < y.length - 1; i++) {
    grad.push((y[i + 1] - y[i - 1]) / (2 * dx));
  }
  
  // Backward difference for last point
  grad.push((y[y.length - 1] - y[y.length - 2]) / dx);
  
  return grad;
}

/**
 * Calculate IEC parameters: W/R, Q, di/dt_max
 */
export function calculateParameters(
  t: number[],
  i: number[],
  impulseType: ImpulseType
): CalculationResult {
  const dt = t[1] - t[0];
  const useAbs = impulseType === 'SEB' || impulseType === 'SC'; // For bipolar waveforms
  
  // Find peak - use reduce to avoid stack overflow with large arrays
  const I_peak = i.reduce((max, val) => Math.max(max, Math.abs(val)), 0);
  const peakIndex = i.findIndex(val => Math.abs(val) === I_peak);
  const t_peak = t[peakIndex];
  
  // Calculate specific energy W/R
  const i_squared = i.map(val => val * val);
  const W_R = trapezoidalIntegration(i_squared, dt);
  
  // Calculate charge Q
  const i_for_charge = useAbs ? i.map(Math.abs) : i;
  const Q = trapezoidalIntegration(i_for_charge, dt);
  
  // Calculate di/dt
  const di_dt = gradient(i, dt);
  const di_dt_max = di_dt.reduce((max, val) => Math.max(max, Math.abs(val)), 0);
  
  return {
    I_peak,
    I_peak_kA: I_peak / 1e3,
    t_peak,
    W_R,
    W_R_MJ: W_R / 1e6,
    Q,
    di_dt_max,
    di_dt_max_kA_us: di_dt_max / 1e9,
  };
}

export interface CalculationOptions {
  impulseType: ImpulseType;
  functionType: FunctionType;
  I_peak?: number;
  duration?: number | 'infinity';
  dt?: number | 'auto';  // Allow 'auto' for automatic time step selection
  calculateDerivative?: boolean;
}

/**
 * Get optimal time step for impulse type
 * Why: Faster impulses need smaller dt for accurate di/dt calculation
 */
function getOptimalTimeStep(impulseType: ImpulseType, userDt?: number | 'auto'): number {
  // If user explicitly set a numeric value, use it
  if (typeof userDt === 'number') {
    return userDt;
  }
  
  // Auto-select based on impulse type characteristics
  // Rule: dt should be ~1/200 to 1/500 of the front time for accurate derivative
  switch (impulseType) {
    case 'NFB':  // 0.25 µs front time - needs ultra-fine resolution
      return 5e-10;  // 0.5 ns (500 points in 0.25 µs rise)
    case 'NEB':  // 1 µs front time - needs very fine resolution
      return 2e-9;   // 2 ns (500 points in 1 µs rise)
    case 'PEB':  // 10 µs front time - standard resolution ok
      return 2e-8;   // 20 ns (500 points in 10 µs rise)
    case 'SEB':  // 8 µs front time - standard resolution ok
      return 1.5e-8; // 15 ns (533 points in 8 µs rise)
    default:
      return 1e-8;   // 10 ns default
  }
}

/**
 * Main impulse calculation function
 */
export function runImpulseCalculation(options: CalculationOptions): {
  results: Record<string, CalculationResults>;
  impulseInfo: ImpulseParams;
} {
  let {
    impulseType,
    functionType,
    I_peak,
    duration = 'infinity',
    dt = 'auto',  // Default to auto
    calculateDerivative = false,
  } = options;
  
  // Normalize SC to SEB (aliases for 8/20 µs)
  if (impulseType === 'SC') {
    impulseType = 'SEB';
  }
  
  // Get optimal time step
  const actualDt = getOptimalTimeStep(impulseType, dt);
  
  // Set default peak current if not provided
  if (!I_peak) {
    I_peak = REFERENCE_VALUES[impulseType].I_peak;
  }
  
  const impulseInfo = IMPULSE_PARAMS[impulseType];
  const isSurge = impulseType === 'SEB';
  
  // Calculate duration if set to 'infinity'
  if (duration === 'infinity') {
    const multiplier = isSurge ? 5 : 7;
    const tauKey = isSurge ? 'tau' : 'tau2';
    const paramsKey = isSurge ? 'damped_sine' : 'heidler';
    const params = impulseInfo[paramsKey];
    if (params && tauKey in params) {
      duration = multiplier * (params as any)[tauKey];
    } else {
      duration = 1e-3; // Default 1ms
    }
  }
  
  // PROTECTION: Limit maximum number of points to prevent browser overload
  const MAX_POINTS = 1000000;  // 1 million points max
  const estimatedPoints = Math.floor(duration / actualDt);
  
  if (estimatedPoints > MAX_POINTS) {
    const suggestedDt = duration / MAX_POINTS;
    throw new Error(
      `Time step too small! Would create ${estimatedPoints.toLocaleString()} points (max: ${MAX_POINTS.toLocaleString()}). ` +
      `Try dt ≥ ${suggestedDt.toExponential(1)} seconds or use "auto".`
    );
  }
  
  // Generate time array
  const numPoints = estimatedPoints;
  const t = Array.from({ length: numPoints }, (_, i) => i * actualDt);
  
  const results: Record<string, CalculationResults> = {};
  
  if (isSurge) {
    // Damped sine for SEB/SC
    const p = impulseInfo.damped_sine!;
    const i = dampedSineFunction(t, I_peak, p.tau, p.omega, p.eta);
    const parameters = calculateParameters(t, i, impulseType);
    
    let derivative: number[] | undefined;
    if (calculateDerivative) {
      derivative = gradient(i, actualDt);
    }
    
    results.damped_sine = {
      waveform: { time: t, current: i, derivative },
      parameters,
      functionType: 'Damped Sine',
    };
  } else {
    // Heidler and/or Double-Exp for lightning impulses
    if (functionType === 'heidler' || functionType === 'both') {
      const p = impulseInfo.heidler!;
      const i = heidlerFunction(t, I_peak, p.tau1, p.tau2, p.eta, p.n);
      const parameters = calculateParameters(t, i, impulseType);
      
      let derivative: number[] | undefined;
      if (calculateDerivative) {
        derivative = gradient(i, actualDt);
      }
      
      results.heidler = {
        waveform: { time: t, current: i, derivative },
        parameters,
        functionType: 'Heidler',
      };
    }
    
    if (functionType === 'double_exp' || functionType === 'both') {
      const p = impulseInfo.double_exp!;
      const i = doubleExpFunction(t, I_peak, p.tau1, p.tau2, p.eta);
      const parameters = calculateParameters(t, i, impulseType);
      
      let derivative: number[] | undefined;
      if (calculateDerivative) {
        derivative = gradient(i, actualDt);
      }
      
      results.double_exp = {
        waveform: { time: t, current: i, derivative },
        parameters,
        functionType: 'Double-Exponential',
      };
    }
  }
  
  return { results, impulseInfo };
}
