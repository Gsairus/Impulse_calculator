'use client';

import { useState } from 'react';
import { type ImpulseType, type FunctionType, type CalculationOptions, IMPULSE_PARAMS, REFERENCE_VALUES } from '@/lib/impulseCalculator';

interface CalculatorFormProps {
  onCalculate: (options: CalculationOptions) => void;
  isCalculating: boolean;
}

export default function CalculatorForm({ onCalculate, isCalculating }: CalculatorFormProps) {
  const [impulseType, setImpulseType] = useState<ImpulseType>('PEB');
  const [functionType, setFunctionType] = useState<FunctionType>('heidler');
  const [peakCurrent, setPeakCurrent] = useState<string>('200');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [duration, setDuration] = useState<string>('infinity');
  const [timeStep, setTimeStep] = useState<string>('auto');  // Changed default to 'auto'
  const [showDerivative, setShowDerivative] = useState(false);

  const impulseInfo = IMPULSE_PARAMS[impulseType];
  const isSurge = impulseType === 'SEB' || impulseType === 'SC';

  // Update default peak current when impulse type changes
  const handleImpulseTypeChange = (newType: ImpulseType) => {
    setImpulseType(newType);
    const defaultPeak = REFERENCE_VALUES[newType].I_peak / 1e3; // Convert to kA
    setPeakCurrent(defaultPeak.toString());
    
    // Auto-select appropriate function type
    if (newType === 'SEB' || newType === 'SC') {
      setFunctionType('damped_sine');
    } else if (functionType === 'damped_sine') {
      setFunctionType('heidler');
    }
    
    // Reset time step to "auto" when switching impulse types
    // Why: each impulse type needs different resolution, auto handles this
    setTimeStep('auto');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const options: CalculationOptions = {
      impulseType,
      functionType,
      I_peak: parseFloat(peakCurrent) * 1e3, // Convert kA to A
      duration: duration === 'infinity' ? 'infinity' : parseFloat(duration),
      dt: timeStep === 'auto' ? 'auto' : parseFloat(timeStep),  // Handle 'auto'
      calculateDerivative: showDerivative,
    };

    onCalculate(options);
  };

  return (
    <div className="card">
      <h2 className="text-xl font-bold mb-4">Input Parameters</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Impulse Type */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Impulse Type
          </label>
          <select
            value={impulseType}
            onChange={(e) => handleImpulseTypeChange(e.target.value as ImpulseType)}
            className="input-field"
          >
            <option value="PEB">PEB - 10/350 µs (200 kA)</option>
            <option value="NEB">NEB - 1/200 µs (100 kA)</option>
            <option value="NFB">NFB - 0.25/100 µs (50 kA)</option>
            <option value="SC">SC - 8/20 µs (10 kA)</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            {impulseInfo.description}
          </p>
        </div>

        {/* Function Type */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Function Type
          </label>
          <select
            value={functionType}
            onChange={(e) => setFunctionType(e.target.value as FunctionType)}
            className="input-field"
            disabled={isSurge}
          >
            {!isSurge && (
              <>
                <option value="heidler">Heidler Function</option>
                <option value="double_exp">Double Exponential</option>
                <option value="both">Both (Compare)</option>
              </>
            )}
            {isSurge && (
              <option value="damped_sine">Damped Sine Wave</option>
            )}
          </select>
        </div>

        {/* Peak Current */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Peak Current (kA)
          </label>
          <input
            type="number"
            value={peakCurrent}
            onChange={(e) => setPeakCurrent(e.target.value)}
            step="0.1"
            min="0.1"
            className="input-field"
            required
          />
        </div>

        {/* Show Derivative Toggle */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="showDerivative"
            checked={showDerivative}
            onChange={(e) => setShowDerivative(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="showDerivative" className="text-sm">
            Show di/dt (current steepness)
          </label>
        </div>

        {/* Advanced Options */}
        <div>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
          >
            {showAdvanced ? '▼' : '▶'} Advanced Options
          </button>
          
          {showAdvanced && (
            <div className="mt-3 space-y-3 pl-4 border-l-2 border-gray-300 dark:border-gray-600">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Duration
                </label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="input-field"
                  placeholder="infinity or value in seconds"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use &quot;infinity&quot; for auto-calculation
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Time Step (s)
                </label>
                <input
                  type="text"
                  value={timeStep}
                  onChange={(e) => setTimeStep(e.target.value)}
                  className="input-field"
                  placeholder="auto or 1e-9"
                />
                <p className="text-xs text-gray-500 mt-1">
                  &quot;auto&quot; = optimal for each impulse type (recommended)
                  <br />
                  Auto values: NFB: 1.5 ns | NEB: 2.5 ns | PEB: 20 ns | SC: 15 ns
                  <br />
                  Manual entry: use scientific notation (e.g., 1e-9 for 1 ns)
                  <br />
                  <span className="text-emerald-600 dark:text-emerald-400">
                    💡 Time step auto-resets to &quot;auto&quot; when you switch impulse types
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Calculate Button */}
        <button
          type="submit"
          disabled={isCalculating}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCalculating ? 'Calculating...' : 'Calculate'}
        </button>
      </form>

      {/* Info Box */}
      <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded text-sm">
        <p className="font-medium mb-1">Current Selection:</p>
        <p className="text-xs text-gray-700 dark:text-gray-300">
          {impulseInfo.name} ({impulseInfo.designation})
        </p>
      </div>
    </div>
  );
}
