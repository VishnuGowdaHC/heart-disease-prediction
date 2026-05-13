from pydantic import BaseModel
from typing import Dict

class PredictionResponse(BaseModel):
    prediction: int  # 0 for No Disease, 1 for Disease Present
    probability: float  # e.g., 0.84
    shap_values: Dict[str, float]  # e.g., {"thalach": 0.45, "oldpeak": 0.32, "chol": -0.12}