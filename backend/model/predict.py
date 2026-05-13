import os
import joblib
import pandas as pd
import shap
import numpy as np

# --- 1. Global Artifact Loading ---
# Loading these at the module level keeps them in memory, 
# preventing disk I/O bottlenecks during inference orchestration.
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "artifacts", "xgboost_model.joblib")
PREPROCESSOR_PATH = os.path.join(BASE_DIR, "artifacts", "preprocessor.joblib")

# We wrap this in a try-except so the FastAPI server doesn't violently crash 
# if you haven't trained the model yet.
try:
    model = joblib.load(MODEL_PATH)
    preprocessor = joblib.load(PREPROCESSOR_PATH)
    
    # Initialize the SHAP explainer globally as well
    explainer = shap.TreeExplainer(model)
    print("ML Artifacts loaded into memory successfully.")
except FileNotFoundError:
    print("WARNING: ML Artifacts not found. Run the training notebook first.")
    model, preprocessor, explainer = None, None, None


def run_inference(input_dict: dict) -> dict:
    """
    Ingests raw patient data, runs the scikit-learn preprocessing pipeline,
    executes XGBoost inference, and computes localized SHAP values.
    """
    if model is None:
        raise RuntimeError("Model artifacts are missing. Cannot run inference.")

    # 1. Convert the raw dictionary into a Pandas DataFrame
    # Scikit-learn pipelines usually expect DataFrames to maintain column names
    df_input = pd.DataFrame([input_dict])

    # 2. Data Preprocessing
    # This applies your StandardScaler and One-Hot Encoding
    X_processed = preprocessor.transform(df_input)

    # 3. Model Inference
    # predict() gives [0] or [1], predict_proba gives [[prob_0, prob_1]]
    prediction = int(model.predict(X_processed)[0])
    probability = float(model.predict_proba(X_processed)[0][1])

    # 4. SHAP Computation
    # Compute the additive feature contributions for this specific patient
    raw_shap_values = explainer.shap_values(X_processed)[0]

    # 5. SHAP Feature Aggregation
    # Because One-Hot Encoding splits categorical features (like 'cp' into 'cp_1', 'cp_2'),
    # we need to map the SHAP values back to the original 13 base features so our React frontend
    # can render the chart correctly.
    
    # Get the feature names out of the preprocessor (requires scikit-learn >= 1.0)
    processed_features = preprocessor.get_feature_names_out()
    
    shap_dict = {}
    for feature_name, shap_val in zip(processed_features, raw_shap_values):
        # We extract the base feature name (e.g., 'cat__cp_1' -> 'cp')
        # This exact logic depends on how your ColumnTransformer is named, 
        # but this is the standard mapping approach.
        base_feature = feature_name.split('__')[-1].split('_')[0] 
        
        if base_feature in input_dict.keys():
            # Sum the SHAP values if a feature was one-hot encoded
            shap_dict[base_feature] = shap_dict.get(base_feature, 0.0) + float(shap_val)

    # For features that weren't transformed or didn't get caught in the loop, ensure they exist
    for key in input_dict.keys():
        if key not in shap_dict:
            shap_dict[key] = 0.0

    # 6. Return the finalized API Contract
    return {
        "prediction": prediction,
        "probability": probability,
        "shap_values": shap_dict
    }