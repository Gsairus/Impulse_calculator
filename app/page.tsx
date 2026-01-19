'use client';

import { useState, useEffect } from 'react';
import CalculatorForm from '@/components/CalculatorForm';
import ResultsDisplay from '@/components/ResultsDisplay';
import { runImpulseCalculation, type CalculationOptions } from '@/lib/impulseCalculator';

export default function Home() {
  const [results, setResults] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleCalculate = (options: CalculationOptions) => {
    setIsCalculating(true);
    
    // Run calculation in next tick to allow UI to update
    setTimeout(() => {
      try {
        const calculationResults = runImpulseCalculation(options);
        setResults(calculationResults);
      } catch (error) {
        console.error('Calculation error:', error);
        // Show error to user
        if (error instanceof Error) {
          alert(`Calculation Error:\n\n${error.message}`);
        } else {
          alert('An unexpected error occurred during calculation.');
        }
      } finally {
        setIsCalculating(false);
      }
    }, 10);
  };

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* App Logo - Top Left */}
        <div className="mb-6">
          <img 
            src="/icon.png" 
            alt="Impulse Calculator" 
            className="w-12 h-12 md:w-16 md:h-16"
          />
        </div>
        
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Universal Impulse Current Calculator
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Lightning impulse current analysis based on IEC 62305-1 standards
          </p>
        </header>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calculator Form - Left Side */}
          <div className="lg:col-span-1">
            <CalculatorForm 
              onCalculate={handleCalculate} 
              isCalculating={isCalculating}
            />
          </div>

          {/* Results Display - Right Side */}
          <div className="lg:col-span-2">
            {results ? (
              <ResultsDisplay results={results} />
            ) : (
              <div className="card h-full flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <svg
                    className="mx-auto h-12 w-12 mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  <p className="text-lg">Configure parameters and click Calculate</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-gray-500">
          <p>
            Based on IEC 62305-1 standards | Mathematical models from my dissertation research
          </p>
          <p className="mt-2">
            ver.1b | by TheProject
          </p>
        </footer>
      </div>
    </main>
  );
}
