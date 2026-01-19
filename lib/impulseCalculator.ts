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
 * Why: Balance between accurate di/dt calculation and staying under 1M points
 * 
 * Calculation: for duration = 7*tau2 (or 5*tau for surge), ensure dt gives <1M points
 * while maintaining ~200-500 samples in the rise time for accurate derivative
 */
function getOptimalTimeStep(impulseType: ImpulseType, userDt?: number | 'auto'): number {
  // If user explicitly set a numeric value, use it (will be validated later)
  if (typeof userDt === 'number') {
    return userDt;
  }
  
  // Auto-select based on impulse type characteristics
  // Rule: dt chosen to give ~200-400 rise time samples AND total points < 1M
  switch (impulseType) {
    case 'NFB':  // 0.25 µs front, 100 µs tail → duration ~1 ms
      // tau2=143.4µs, duration=7*143.4µs=1.004ms → need dt>1ns for <1M points
      // Using 1.5ns gives 669k points, 167 samples in 0.25µs rise (good accuracy)
      return 1.5e-9;  // 1.5 ns
      
    case 'NEB':  // 1 µs front, 200 µs tail → duration ~2 ms
      // tau2=285µs, duration=7*285µs=1.995ms → need dt>2ns for <1M points
      // Using 2.5ns gives 798k points, 400 samples in 1µs rise (excellent)
      return 2.5e-9;  // 2.5 ns
      
    case 'PEB':  // 10 µs front, 350 µs tail → duration ~3.4 ms
      // tau2=485µs, duration=7*485µs=3.395ms → can use larger dt
      // Using 20ns gives 170k points, 500 samples in 10µs rise (excellent)
      return 2e-8;    // 20 ns
      
    case 'SEB':  // 8 µs front, ~150 µs tail → duration ~120 µs
      // tau=24µs, duration=5*24µs=120µs → can use larger dt
      // Using 15ns gives 8k points, 533 samples in 8µs rise (excellent)
      return 1.5e-8;  // 15 ns
      
    default:
      return 1e-8;    // 10 ns fallback
  }
}

/**
 * Main impulse calculation function
 */
export function runImpulseCalculation(options: CalculationOptions): {
  results: Record<string, CalculationResults>;
  impulseInfo: ImpulseParams;
  userDuration: number | 'infinity';
  infinityDuration: number;
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
  let actualDt = getOptimalTimeStep(impulseType, dt);
  
  // Set default peak current if not provided
  if (!I_peak) {
    I_peak = REFERENCE_VALUES[impulseType].I_peak;
  }
  
  const impulseInfo = IMPULSE_PARAMS[impulseType];
  const isSurge = impulseType === 'SEB';
  
  // Store user's original duration choice
  const userDuration = duration;
  
  // Calculate infinity duration
  const multiplier = isSurge ? 5 : 7;
  const tauKey = isSurge ? 'tau' : 'tau2';
  const paramsKey = isSurge ? 'damped_sine' : 'heidler';
  const params = impulseInfo[paramsKey];
  let infinityDuration: number;
  if (params && tauKey in params) {
    infinityDuration = multiplier * (params as any)[tauKey];
  } else {
    infinityDuration = 1e-3; // Default 1ms
  }
  
  // Use user duration if specified, otherwise use infinity duration
  if (duration === 'infinity') {
    duration = infinityDuration;
  }
  
  // SMART PROTECTION: Auto-adjust time step if it would create too many points
  const MAX_POINTS = 1000000;  // 1 million points max
  let estimatedPoints = Math.floor(duration / actualDt);
  
  console.log('=== DURATION DEBUG ===');
  console.log('User input:', userDuration);
  console.log('Infinity duration:', infinityDuration, 's =', (infinityDuration * 1e6), 'µs');
  console.log('Actual used:', duration, 's =', (duration * 1e6), 'µs');
  console.log('Time step:', actualDt, 's');
  console.log('Estimated points:', estimatedPoints);
  
  if (estimatedPoints > MAX_POINTS) {
    // Instead of throwing error, intelligently adjust time step
    const minDt = duration / MAX_POINTS;
    actualDt = Math.max(actualDt, minDt);
    estimatedPoints = Math.floor(duration / actualDt);
    
    console.warn(
      `Time step auto-adjusted from ${(typeof dt === 'number' ? dt : actualDt).toExponential(2)} to ${actualDt.toExponential(2)} seconds ` +
      `to keep points under ${MAX_POINTS.toLocaleString()} (estimated: ${estimatedPoints.toLocaleString()})`
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
  
  return { results, impulseInfo, userDuration, infinityDuration, actualDuration: duration };
}
