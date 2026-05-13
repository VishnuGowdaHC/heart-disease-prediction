import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Download, AlertCircle, ArrowLeft } from 'lucide-react';

// Mapping dictionaries to convert raw backend keys into clean UI labels and units
const FEATURE_MAP = {
  age: { label: 'Age', unit: 'yrs' },
  gender: { label: 'Gender', unit: '', format: v => v === 1 ? 'Male' : 'Female' },
  trestbps: { label: 'Resting BP', unit: 'mmHg' },
  chol: { label: 'Cholesterol', unit: 'mg/dl' },
  fbs: { label: 'Fasting Blood Sugar > 120', unit: '', format: v => v === 1 ? 'Yes' : 'No' },
  cp: { label: 'Chest Pain Type', unit: '', format: v => ['Typical', 'Atypical', 'Non-anginal', 'Asymptomatic'][v] },
  exang: { label: 'Exercise Angina', unit: '', format: v => v === 1 ? 'Yes' : 'No' },
  restecg: { label: 'Resting ECG', unit: '', format: v => ['Normal', 'ST-T Abnormality', 'LV Hypertrophy'][v] },
  thalach: { label: 'Max Heart Rate', unit: 'bpm' },
  oldpeak: { label: 'ST Depression', unit: 'mm' },
  slope: { label: 'ST Slope', unit: '', format: v => ['Upsloping', 'Flat', 'Downsloping'][v] },
  ca: { label: 'Major Vessels', unit: 'vessels' },
  thal: { label: 'Thalassemia', unit: '', format: v => ['?', 'Normal', 'Fixed Defect', 'Reversible Defect'][v] }
};

const ResultsDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // We expect React Router to pass { results: response.data, inputs: formData }
  const { results, inputs } = location.state || {};

  // Safety catch: If someone navigates here directly without filling the form, send them back
  if (!results || !inputs) {
    return (
      <div className="min-h-screen bg-[#0d1117] text-gray-300 flex flex-col items-center justify-center p-8">
        <AlertCircle size={48} className="text-gray-600 mb-4" />
        <h2 className="text-xl font-semibold mb-4">No Patient Data Found</h2>
        <button 
          onClick={() => navigate('/')}
          className="px-6 py-2 bg-[#2563eb] hover:bg-blue-600 text-white rounded-lg flex items-center gap-2"
        >
          <ArrowLeft size={18} /> Go Back to Form
        </button>
      </div>
    );
  }

  // 1. Dynamic Risk Logic
  const isHighRisk = results.prediction === 1;
  const probabilityPercent = Math.round(results.probability * 100);
  
  // Theme colors based on prediction
  const themeColor = isHighRisk ? 'red' : 'emerald';
  const themeHex = isHighRisk ? '#ef4444' : '#10b981'; // Tailwind red-500 and emerald-500

  // 2. Dynamic SHAP Logic (Sorting and Formatting for the Chart)
  // We convert the dictionary into an array, sort by absolute impact, and take the top 5
  const shapArray = Object.entries(results.shap_values).map(([key, shapValue]) => {
    return {
      key,
      shap: shapValue,
      absShap: Math.abs(shapValue),
      rawValue: inputs[key]
    };
  }).sort((a, b) => b.absShap - a.absShap).slice(0, 5);

  // Find the maximum absolute SHAP value to scale the bars proportionally
  const maxShap = Math.max(...shapArray.map(item => item.absShap));

  return (
    <div className="min-h-screen bg-[#0d1117] text-gray-300 p-8 font-sans flex flex-col items-center justify-center">
      <div className="w-full max-w-3xl">
        
        {/* Header */}
        <header className="mb-6">
          <p className="text-blue-600 font-bold text-sm tracking-widest uppercase">
            Cardioscan AI
          </p>
        </header>

        {/* Risk Assessment Card */}
        <div className={`bg-[#161b22]/50 border border-${themeColor}-500/50 rounded-xl p-10 flex flex-col items-center mb-6 shadow-lg shadow-${themeColor}-900/10`}>
          <div className={`border border-${themeColor}-500/60 bg-${themeColor}-500/10 text-${themeColor}-500 px-5 py-1.5 rounded-full text-sm font-medium mb-4`}>
            {isHighRisk ? 'High Risk Detected' : 'Low Risk Detected'}
          </div>
          
          <h1 className="text-white text-7xl font-bold tracking-tight mb-2">
            {probabilityPercent}%
          </h1>
          <p className="text-gray-400 text-sm mb-10">Prediction Confidence</p>

          {/* Progress Bar */}
          <div className="w-full max-w-md">
            <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-1000 ease-out" 
                style={{ width: `${probabilityPercent}%`, backgroundColor: themeHex }}
              />
            </div>
            <div className="flex justify-between mt-3 text-gray-500 text-xs font-medium">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* Prediction Factors Card (SHAP Values) */}
        <div className="bg-[#161b22] border border-gray-800/60 rounded-xl px-8 py-6 mb-8">
          <h2 className="text-xs font-semibold tracking-wider text-gray-400 uppercase mb-4">
            Top Prediction Factors (SHAP Analysis)
          </h2>
          <div className="border-b border-gray-800/80 mb-6"></div>

          <div className="flex flex-col gap-5">
            {shapArray.map((factor) => {
              const mapping = FEATURE_MAP[factor.key];
              // Format the raw value if it's categorical, otherwise use the number
              const displayValue = mapping.format ? mapping.format(factor.rawValue) : factor.rawValue;
              // Calculate CSS width relative to the biggest SHAP value
              const barWidthPct = `${(factor.absShap / maxShap) * 100}%`;
              // Positive SHAP means it pushes the model toward disease (right). Negative means no disease (left).
              const direction = factor.shap > 0 ? 'right' : 'left';

              return (
                <FactorRow 
                  key={factor.key}
                  label={mapping.label} 
                  value={displayValue} 
                  unit={mapping.unit} 
                  direction={direction} 
                  barWidth={barWidthPct}
                  barColor={direction === 'right' ? '#3b82f6' : '#64748b'} 
                />
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-800/80 pt-6 flex justify-end gap-4">
          <button 
            onClick={() => navigate('/')}
            className="px-6 py-2.5 bg-transparent border border-gray-700 hover:bg-gray-800 text-gray-200 text-sm font-medium rounded-lg transition-colors"
          >
            Check Another Patient
          </button>
          <button 
            onClick={() => window.print()}
            className="px-6 py-2.5 bg-[#3b82f6] hover:bg-blue-600 text-white text-sm font-medium rounded-lg flex items-center gap-2 transition-colors"
          >
            <Download size={18} />
            Download Report
          </button>
        </div>

      </div>
    </div>
  );
};

// --- Subcomponent: Divergent Bar Chart Row ---

const FactorRow = ({ label, value, unit, direction, barWidth, barColor }) => {
  const isRight = direction === 'right';
  
  return (
    <div className="flex items-center w-full">
      {/* Label */}
      <div className="w-1/3 text-gray-400 text-sm truncate pr-4">
        {label}
      </div>
      
      {/* Divergent Bar Area */}
      <div className="w-1/3 flex items-center h-full relative">
        {/* Left Side (Negative/Baseline Factors) */}
        <div className="w-1/2 flex justify-end pr-0.5">
          {!isRight && (
            <div 
              className="h-3.5 rounded-l-sm transition-all duration-700" 
              style={{ width: barWidth, backgroundColor: barColor }}
            />
          )}
        </div>
        
        {/* Right Side (Positive/Risk Factors) */}
        <div className="w-1/2 flex justify-start pl-0.5">
          {isRight && (
            <div 
              className="h-3.5 rounded-r-sm transition-all duration-700" 
              style={{ width: barWidth, backgroundColor: barColor }}
            />
          )}
        </div>
      </div>

      {/* Value */}
      <div className="w-1/3 text-right">
        <span className="font-mono text-gray-200 text-sm font-medium">
          {value}
        </span>
        {unit && (
          <span className="font-mono text-gray-500 text-xs ml-1.5">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
};

export default ResultsDashboard;