import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  User, Activity, Stethoscope, HeartPulse, Microscope, ChevronDown, Loader2
} from 'lucide-react';

const InputFormPage = () => {
  const navigate = useNavigate();
  // 1. State strictly maps to the FastAPI Pydantic schema we designed
  const [formData, setFormData] = useState({
    age: 55,
    sex: 1, // 1 = Male, 0 = Female
    trestbps: 130,
    chol: 240,
    fbs: 0, // 1 = Yes, 0 = No
    cp: 0, // 0 = Typical, 1 = Atypical, 2 = Non-anginal, 3 = Asymptomatic
    exang: 0, // 1 = Yes, 0 = No
    restecg: 0, // 0 = Normal, 1 = ST-T, 2 = LVH
    thalach: 150,
    oldpeak: 1.5,
    slope: 0, // 0 = Upsloping, 1 = Flat, 2 = Downsloping
    ca: 0, // 0-3
    thal: 1 // 1 = Normal, 2 = Fixed, 3 = Reversible
  });

  const [loading, setLoading] = useState(false);

  // Helper to update state cleanly
  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // 2. The API Connection
  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/predict', formData);
      console.log("XGBoost Inference Complete:", response.data);
      
      // Navigate to the results page with the data!
      navigate('/results', { state: { results: response.data, inputs: formData } });

    } catch (error) {
      // THIS is the magic log. It will tell you exactly which field failed.
      console.error("Validation Error Details:", error.response?.data?.detail || error.message);
      
      alert("Pipeline Error. Check the console (F12) to see which field failed validation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0c10] text-gray-300 p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <header className="mb-10">
          <p className="text-blue-600 font-bold text-xs tracking-widest uppercase mb-2">Cardioscan</p>
          <h1 className="text-white text-4xl font-bold mb-3">Heart Disease Risk Assessment</h1>
          <p className="text-gray-500 text-lg">AI-powered cardiovascular screening and predictive analysis.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Patient Profile */}
          <Section cardTitle="Patient Profile" icon={<User size={20} />}>
            <Slider 
              label="AGE" value={formData.age} unit="yrs" min={20} max={100} 
              onChange={(val) => updateField('age', val)} 
            />
            <div className="mt-6">
              <label className="text-[10px] font-bold tracking-wider text-gray-500 block mb-3">GENDER</label>
              <ToggleButton 
                options={['Male', 'Female']} 
                active={formData.sex === 1 ? 'Male' : 'Female'} 
                onChange={(val) => updateField('sex', val === 'Male' ? 1 : 0)}
              />
            </div>
          </Section>

          {/* Vitals & Blood Panel */}
          <Section cardTitle="Vitals & Blood Panel" icon={<Activity size={20} />}>
            <Slider 
              label="RESTING BLOOD PRESSURE" value={formData.trestbps} unit="mmHg" min={90} max={200}
              onChange={(val) => updateField('trestbps', val)}
            />
            <div className="mt-6">
              <Slider 
                label="SERUM CHOLESTEROL" value={formData.chol} unit="mg/dl" min={100} max={400}
                onChange={(val) => updateField('chol', val)}
              />
            </div>
            <div className="mt-6">
              <label className="text-[10px] font-bold tracking-wider text-gray-500 block mb-3">FASTING BLOOD SUGAR {'>'} 120 MG/DL</label>
              <ToggleButton 
                options={['Yes', 'No']} 
                active={formData.fbs === 1 ? 'Yes' : 'No'} 
                onChange={(val) => updateField('fbs', val === 'Yes' ? 1 : 0)}
              />
            </div>
          </Section>

          {/* Symptom Assessment */}
          <Section cardTitle="Symptom Assessment" icon={<Stethoscope size={20} />}>
            <div className="mb-6">
              <label className="text-[10px] font-bold tracking-wider text-gray-500 block mb-3">CHEST PAIN TYPE</label>
              <Dropdown 
                value={formData.cp}
                onChange={(val) => updateField('cp', val)}
                options={[
                  { label: 'Typical Angina', value: 0 },
                  { label: 'Atypical Angina', value: 1 },
                  { label: 'Non-anginal Pain', value: 2 },
                  { label: 'Asymptomatic', value: 3 }
                ]} 
              />
            </div>
            <label className="text-[10px] font-bold tracking-wider text-gray-500 block mb-3 uppercase">Exercise Induced Angina</label>
            <ToggleButton 
                options={['Yes', 'No']} 
                active={formData.exang === 1 ? 'Yes' : 'No'} 
                onChange={(val) => updateField('exang', val === 'Yes' ? 1 : 0)}
            />
          </Section>

          {/* Stress Test Results */}
          <Section cardTitle="Stress Test Results" icon={<HeartPulse size={20} />}>
            <div className="mb-6">
              <label className="text-[10px] font-bold tracking-wider text-gray-500 block mb-3">RESTING ECG</label>
              <Dropdown 
                value={formData.restecg}
                onChange={(val) => updateField('restecg', val)}
                options={[
                  { label: 'Normal', value: 0 },
                  { label: 'ST-T Wave Abnormality', value: 1 },
                  { label: 'Left Ventricular Hypertrophy', value: 2 }
                ]} 
              />
            </div>
            <Slider 
              label="MAX HEART RATE ACHIEVED" value={formData.thalach} unit="bpm" min={60} max={220}
              onChange={(val) => updateField('thalach', val)}
            />
            <div className="mt-6">
              {/* Note: oldpeak is a float, so we map the slider 0-62 to 0.0-6.2 internally */}
              <Slider 
                label="ST DEPRESSION (OLDPEAK)" value={formData.oldpeak} unit="mm" min={0} max={6.2} step={0.1}
                onChange={(val) => updateField('oldpeak', parseFloat(val))}
              />
            </div>
            <div className="mt-6">
              <label className="text-[10px] font-bold tracking-wider text-gray-500 block mb-3 uppercase">Peak Exercise ST Segment Slope</label>
              <Dropdown 
                value={formData.slope}
                onChange={(val) => updateField('slope', val)}
                options={[
                  { label: 'Upsloping', value: 0 },
                  { label: 'Flat', value: 1 },
                  { label: 'Downsloping', value: 2 }
                ]} 
              />
            </div>
          </Section>

          {/* Angiography & Imaging */}
          <Section cardTitle="Angiography & Imaging" icon={<Microscope size={20} />}>
            <div className="mb-6">
              <label className="text-[10px] font-bold tracking-wider text-gray-500 block mb-3">NUMBER OF MAJOR VESSELS (0-3)</label>
              <Dropdown 
                value={formData.ca}
                onChange={(val) => updateField('ca', val)}
                options={[
                  { label: '0 Vessels', value: 0 },
                  { label: '1 Vessel', value: 1 },
                  { label: '2 Vessels', value: 2 },
                  { label: '3 Vessels', value: 3 }
                ]} 
              />
            </div>
            <label className="text-[10px] font-bold tracking-wider text-gray-500 block mb-3 uppercase">Thalassemia</label>
            <Dropdown 
                value={formData.thal}
                onChange={(val) => updateField('thal', val)}
                options={[
                  { label: 'Normal', value: 1 },
                  { label: 'Fixed Defect', value: 2 },
                  { label: 'Reversible Defect', value: 3 }
                ]} 
              />
          </Section>
        </div>

        {/* Action Button */}
        <div className="mt-12 flex justify-center">
          <button 
            onClick={handleAnalyze}
            disabled={loading}
            className="bg-[#2563eb] hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold py-4 px-24 rounded-lg transition-all shadow-lg shadow-blue-900/20 flex items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : null}
            {loading ? 'Analyzing Vitals...' : 'Analyze Risk'}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Modified Subcomponents ---

const Section = ({ icon, cardTitle, children }) => (
  <div className="bg-[#12141c] border border-gray-800 rounded-xl p-6 shadow-sm">
    <div className="flex items-center gap-3 mb-8">
      <span className="text-gray-400">{icon}</span>
      <h2 className="text-xl font-medium text-white tracking-tight">{cardTitle}</h2>
    </div>
    {children}
  </div>
);

// Added input type="range" hidden over the visual track to make it natively interactive
const Slider = ({ label, value, unit, min = 0, max = 200, step = 1, onChange }) => (
  <div className="w-full">
    <div className="flex justify-between items-end mb-3">
      <label className="text-[10px] font-bold tracking-wider text-gray-500 uppercase">{label}</label>
      <span className="bg-[#2563eb] text-white text-[11px] font-mono px-2 py-1 rounded">
        {value} <span className="opacity-80">{unit}</span>
      </span>
    </div>
    <div className="relative h-1.5 bg-gray-800 rounded-full group">
      <input 
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 w-full opacity-0 cursor-pointer z-10"
      />
      <div 
        className="absolute top-0 left-0 h-full bg-[#2563eb] rounded-full" 
        style={{ width: `${((value - min) / (max - min)) * 100}%` }}
      />
      <div 
        className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-4 border-[#2563eb] rounded-full shadow-md group-hover:scale-110 transition-transform"
        style={{ left: `calc(${((value - min) / (max - min)) * 100}% - 8px)` }}
      />
    </div>
    <div className="flex justify-between mt-2 text-[10px] font-mono text-gray-600">
      <span>{min}</span>
      <span>{max}</span>
    </div>
  </div>
);

// Trigger onChange and pass the raw string up, handled in parent
const ToggleButton = ({ options, active, onChange }) => (
  <div className="bg-black/40 border border-gray-800 p-1 rounded-lg flex">
    {options.map((opt) => (
      <button
        key={opt}
        onClick={() => onChange(opt)}
        className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
          active === opt 
            ? 'bg-[#2563eb] text-white shadow-md' 
            : 'text-gray-500 hover:text-gray-300'
        }`}
      >
        {opt}
      </button>
    ))}
  </div>
);

// Upgraded to a real HTML select for functionality
const Dropdown = ({ value, options, onChange }) => (
  <div className="relative">
    <select 
      value={value} 
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full appearance-none bg-black/40 border border-gray-800 rounded-lg p-4 text-sm text-gray-200 cursor-pointer hover:border-gray-700 transition-colors outline-none focus:border-blue-500"
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value} className="bg-[#12141c]">
          {opt.label}
        </option>
      ))}
    </select>
    <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
  </div>
);

export default InputFormPage;