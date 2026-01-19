'use client';

import { useEffect, useRef } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface ResultsDisplayProps {
  results: {
    results: Record<string, any>;
    impulseInfo: any;
  };
}

export default function ResultsDisplay({ results }: ResultsDisplayProps) {
  const { results: calculationResults, impulseInfo } = results;
  const resultKeys = Object.keys(calculationResults);
  const firstResult = calculationResults[resultKeys[0]];

  // Format parameter value with appropriate units
  const formatEnergy = (value: number) => {
    return value >= 1 ? `${value.toFixed(3)} MJ/Ω` : `${(value * 1000).toFixed(2)} kJ/Ω`;
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="card">
        <h2 className="text-2xl font-bold mb-2">{impulseInfo.name}</h2>
        <p className="text-gray-600 dark:text-gray-400">{impulseInfo.designation}</p>
      </div>

      {/* Parameter Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Peak Current</p>
          <p className="text-2xl font-bold">{firstResult.parameters.I_peak_kA.toFixed(2)}</p>
          <p className="text-xs text-gray-500">kA</p>
        </div>
        
        <div className="card">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Specific Energy</p>
          <p className="text-2xl font-bold">
            {firstResult.parameters.W_R_MJ >= 1 
              ? firstResult.parameters.W_R_MJ.toFixed(3)
              : (firstResult.parameters.W_R / 1e3).toFixed(2)}
          </p>
          <p className="text-xs text-gray-500">
            {firstResult.parameters.W_R_MJ >= 1 ? 'MJ/Ω' : 'kJ/Ω'}
          </p>
        </div>
        
        <div className="card">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Charge</p>
          <p className="text-2xl font-bold">{firstResult.parameters.Q.toFixed(2)}</p>
          <p className="text-xs text-gray-500">C</p>
        </div>
        
        <div className="card">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Max Steepness</p>
          <p className="text-2xl font-bold">{firstResult.parameters.di_dt_max_kA_us.toFixed(1)}</p>
          <p className="text-xs text-gray-500">kA/µs</p>
        </div>
      </div>

      {/* Charts */}
      {resultKeys.map((key) => {
        const result = calculationResults[key];
        const waveform = result.waveform;
        
        // Downsample for performance (show every Nth point)
        // Use more points for better curve quality (2000 instead of 1000)
        const downsampleFactor = Math.max(1, Math.floor(waveform.time.length / 2000));
        const sampledIndices = waveform.time
          .map((_: any, i: number) => i)
          .filter((_: any, i: number) => i % downsampleFactor === 0);
        
        const sampledTime = sampledIndices.map((i: number) => waveform.time[i] * 1e6); // Convert to µs
        const sampledCurrent = sampledIndices.map((i: number) => waveform.current[i] / 1e3); // Convert to kA
        
        // Debug: check time array values
        console.log('=== CHART TIME DEBUG ===');
        console.log('Total waveform points:', waveform.time.length);
        console.log('First time value:', waveform.time[0], 's');
        console.log('Last time value:', waveform.time[waveform.time.length - 1], 's =', (waveform.time[waveform.time.length - 1] * 1e6), 'µs');
        console.log('Sampled points:', sampledTime.length);
        console.log('First sampled time:', sampledTime[0], 'µs');
        console.log('Last sampled time:', sampledTime[sampledTime.length - 1], 'µs');

        const chartData = {
          labels: sampledTime,
          datasets: [
            {
              label: 'Current (kA)',
              data: sampledCurrent,
              borderColor: 'rgb(37, 99, 235)',
              backgroundColor: 'rgba(37, 99, 235, 0.1)',
              borderWidth: 2,
              pointRadius: 0,
              tension: 0.1,
            },
          ],
        };

        const chartOptions = {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
            title: {
              display: true,
              text: `${result.functionType} Function`,
              font: {
                size: 16,
                weight: 'bold' as const,
              },
            },
            tooltip: {
              callbacks: {
                label: function(context: any) {
                  return `${context.parsed.y.toFixed(2)} kA`;
                },
                title: function(context: any) {
                  return `${context[0].parsed.x.toFixed(2)} µs`;
                },
              },
            },
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'Time (µs)',
                font: {
                  weight: 'bold' as const,
                },
              },
              min: 0,
              max: sampledTime[sampledTime.length - 1], // Ensure last time value is max
              ticks: {
                maxTicksLimit: 10,
                includeBounds: true, // Always show first and last tick
                callback: function(value: any) {
                  // Format numbers to avoid scientific notation and excessive decimals
                  const numValue = typeof value === 'number' ? value : parseFloat(value);
                  if (numValue >= 1000) {
                    return numValue.toFixed(0);
                  } else if (numValue >= 100) {
                    return numValue.toFixed(1);
                  } else if (numValue >= 10) {
                    return numValue.toFixed(1);
                  } else if (numValue >= 1) {
                    return numValue.toFixed(2);
                  } else {
                    return numValue.toFixed(3);
                  }
                },
              },
            },
            y: {
              title: {
                display: true,
                text: 'Current (kA)',
                font: {
                  weight: 'bold' as const,
                },
              },
            },
          },
        };

        return (
          <div key={key} className="card">
            <div style={{ height: '400px' }}>
              <Line data={chartData} options={chartOptions} />
            </div>
            
            {/* Parameter Details */}
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Peak:</span>{' '}
                <span className="font-medium">{result.parameters.I_peak_kA.toFixed(3)} kA</span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Energy:</span>{' '}
                <span className="font-medium">{formatEnergy(result.parameters.W_R_MJ)}</span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Charge:</span>{' '}
                <span className="font-medium">{result.parameters.Q.toFixed(3)} C</span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">di/dt:</span>{' '}
                <span className="font-medium">{result.parameters.di_dt_max_kA_us.toFixed(2)} kA/µs</span>
              </div>
            </div>

            {/* Derivative Chart */}
            {waveform.derivative && (
              <div className="mt-6">
                <h3 className="text-lg font-bold mb-3">Current Steepness (di/dt)</h3>
                <div style={{ height: '300px' }}>
                  <Line
                    data={{
                      labels: (() => {
                        // Find the index of maximum di/dt - use reduce to avoid stack overflow
                        const derivativeValues = waveform.derivative!.map((d: number) => Math.abs(d));
                        const maxDiDtValue = derivativeValues.reduce((max: number, val: number) => Math.max(max, val), 0);
                        const maxDiDtIndex = derivativeValues.indexOf(maxDiDtValue);
                        
                        // Find corresponding sampled index
                        const sampledMaxIndex = sampledIndices.findIndex((idx: number) => idx >= maxDiDtIndex);
                        
                        // Determine zoom factor based on impulse type
                        // SC (8/20 µs) needs much longer view to see full oscillation pattern (to third extremum at ~1000 µs)
                        // Check both designation and function type for surge current
                        const isSurge = impulseInfo.designation === '8/20 µs' || result.functionType === 'Damped Sine';
                        
                        let endIndex;
                        if (isSurge) {
                          // For surge: show fixed time window up to 1200 µs (covers all three extrema)
                          const targetTime_us = 1200;  // µs - goes beyond third extremum at ~1000 µs
                          const targetIndex = sampledTime.findIndex((t: number) => t >= targetTime_us);
                          endIndex = targetIndex > 0 ? targetIndex : sampledTime.length - 1;
                        } else {
                          // For lightning: zoom to 5x max di/dt time (captures rise time)
                          endIndex = Math.min(sampledMaxIndex * 5, sampledTime.length - 1);
                        }
                        
                        console.log('di/dt zoom debug:', {
                          designation: impulseInfo.designation,
                          functionType: result.functionType,
                          isSurge,
                          endIndex,
                          endTime_us: sampledTime[endIndex]
                        });
                        
                        return sampledTime.slice(0, Math.max(endIndex, sampledMaxIndex + 10));
                      })(),
                          datasets: [
                        {
                          label: 'di/dt (kA/µs)',
                          data: (() => {
                            const derivativeValues = waveform.derivative!.map((d: number) => Math.abs(d));
                            const maxDiDtValue = derivativeValues.reduce((max: number, val: number) => Math.max(max, val), 0);
                            const maxDiDtIndex = derivativeValues.indexOf(maxDiDtValue);
                            const sampledMaxIndex = sampledIndices.findIndex((idx: number) => idx >= maxDiDtIndex);
                            
                            // Use time-based zoom for surge currents (to third extremum at ~1000 µs)
                            const isSurge = impulseInfo.designation === '8/20 µs' || result.functionType === 'Damped Sine';
                            
                            let endIndex;
                            if (isSurge) {
                              // For surge: show fixed time window up to 1200 µs (covers all extrema)
                              const targetTime_us = 1200;
                              const targetIndex = sampledTime.findIndex((t: number) => t >= targetTime_us);
                              endIndex = targetIndex > 0 ? targetIndex : sampledTime.length - 1;
                            } else {
                              // For lightning: zoom to 5x max di/dt time
                              endIndex = Math.min(sampledMaxIndex * 5, sampledIndices.length - 1);
                            }
                            
                            return sampledIndices
                              .slice(0, Math.max(endIndex, sampledMaxIndex + 10))
                              .map((i: number) => waveform.derivative![i] / 1e9);
                          })(),
                          borderColor: 'rgb(34, 197, 94)',
                          backgroundColor: 'rgba(34, 197, 94, 0.1)',
                          borderWidth: 2,
                          pointRadius: 0,
                          tension: 0.1,
                        },
                      ],
                    }}
                    options={{
                      ...chartOptions,
                      plugins: {
                        ...chartOptions.plugins,
                        title: {
                          display: false,
                        },
                      },
                      scales: {
                        x: {
                          title: {
                            display: true,
                            text: 'Time (µs)',
                            font: {
                              weight: 'bold' as const,
                            },
                          },
                          ticks: {
                            maxTicksLimit: 10,
                            callback: function(value: any) {
                              // Same formatting as main chart
                              const numValue = typeof value === 'number' ? value : parseFloat(value);
                              if (numValue >= 1000) {
                                return numValue.toFixed(0);
                              } else if (numValue >= 100) {
                                return numValue.toFixed(1);
                              } else if (numValue >= 10) {
                                return numValue.toFixed(1);
                              } else if (numValue >= 1) {
                                return numValue.toFixed(2);
                              } else {
                                return numValue.toFixed(3);
                              }
                            },
                          },
                        },
                        y: {
                          title: {
                            display: true,
                            text: 'di/dt (kA/µs)',
                            font: {
                              weight: 'bold' as const,
                            },
                          },
                        },
                      },
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Comparison Table for "Both" mode */}
      {resultKeys.length > 1 && (
        <div className="card">
          <h3 className="text-lg font-bold mb-3">Parameter Comparison</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-300 dark:border-gray-600">
                  <th className="text-left py-2">Parameter</th>
                  {resultKeys.map((key) => (
                    <th key={key} className="text-right py-2">{calculationResults[key].functionType}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-2">Peak (kA)</td>
                  {resultKeys.map((key) => (
                    <td key={key} className="text-right font-mono">
                      {calculationResults[key].parameters.I_peak_kA.toFixed(3)}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-2">Energy</td>
                  {resultKeys.map((key) => (
                    <td key={key} className="text-right font-mono">
                      {formatEnergy(calculationResults[key].parameters.W_R_MJ)}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-2">Charge (C)</td>
                  {resultKeys.map((key) => (
                    <td key={key} className="text-right font-mono">
                      {calculationResults[key].parameters.Q.toFixed(3)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2">di/dt (kA/µs)</td>
                  {resultKeys.map((key) => (
                    <td key={key} className="text-right font-mono">
                      {calculationResults[key].parameters.di_dt_max_kA_us.toFixed(2)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
