from pydantic import BaseModel, Field

class PatientFeatures(BaseModel):
    # Patient Profile
    age: int = Field(..., ge=20, le=100, description="Age in years")
    sex: int = Field(..., ge=0, le=1, description="1 = Male, 0 = Female")
    
    # Vitals & Blood Panel
    trestbps: int = Field(..., gt=0, description="Resting blood pressure in mm Hg")
    chol: int = Field(..., gt=0, description="Serum cholesterol in mg/dl")
    fbs: int = Field(..., ge=0, le=1, description="Fasting blood sugar > 120 mg/dl (1 = True, 0 = False)")
    
    # Symptom Assessment
    cp: int = Field(..., ge=0, le=3, description="Chest pain type (0-3)")
    exang: int = Field(..., ge=0, le=1, description="Exercise-induced angina (1 = Yes, 0 = No)")
    
    # Stress Test Results
    restecg: int = Field(..., ge=0, le=2, description="Resting ECG results (0-2)")
    thalach: int = Field(..., gt=0, description="Maximum heart rate achieved")
    oldpeak: float = Field(..., description="ST depression induced by exercise relative to rest")
    slope: int = Field(..., ge=0, le=2, description="Slope of peak exercise ST segment (0-2)")
    
    # Angiography & Imaging
    ca: int = Field(..., ge=0, le=3, description="Number of major vessels colored by flourosopy (0-3)")
    thal: int = Field(..., ge=1, le=3, description="Thalassemia (1: normal, 2: fixed defect, 3: reversible defect)")