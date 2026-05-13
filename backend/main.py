from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# Import the Pydantic contracts
from schemas.input import PatientFeatures
from schemas.output import PredictionResponse

# Import the inference engine (this requires predict.py to be built)
from model.predict import run_inference

app = FastAPI(
    title="CardioScan AI API",
    description="Backend for Heart Disease Prediction and SHAP Explainability",
    version="1.0.0"
)

# Crucial: Configure CORS so your Vite/React frontend can talk to this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "https://heart-disease-prediction-1-9u7r.onrender.com/"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health", tags=["System"])
async def health_check():
    """Simple health check endpoint to verify the API is running."""
    return {"status": "ok"}

@app.post("/predict", response_model=PredictionResponse, tags=["Machine Learning"])
async def predict_heart_disease(features: PatientFeatures):
    """
    Ingests patient vitals, runs XGBoost inference, and computes SHAP values.
    """
    try:
        # Convert the validated Pydantic model to a standard dictionary
        input_data = features.model_dump()
        
        # Pass the data into the ML pipeline and get the structured result
        result = run_inference(input_data)
        
        return result
        
    except Exception as e:
        # Catch pipeline errors and return a clean 500 error to the frontend
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")