# Heart Disease Prediction

## Overview
A machine learning project to predict the likelihood of heart disease based on patient health data.

## Dataset
- **Features:** age, sex, chest pain type, blood pressure, cholesterol, blood sugar, ECG, heart rate, exercise-induced angina, ST depression, slope, vessels, thalassemia.
- **Target:** presence or absence of heart disease.

## Steps
1. Load dataset
2. Preprocess data (clean, normalize, encode)
3. Split into train/test sets
4. Train models (Logistic Regression, Random Forest, SVM, etc.)
5. Evaluate with accuracy, precision, recall, F1-score
6. Deploy best model

## Example (Python)
```python
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

model = RandomForestClassifier()
model.fit(X_train, y_train)

print("Accuracy:", accuracy_score(y_test, model.predict(X_test)))
# heart-disease-prediction
