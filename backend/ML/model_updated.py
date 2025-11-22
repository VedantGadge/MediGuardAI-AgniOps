

import pandas as pd
import numpy as np
import seaborn as sns
import matplotlib.pyplot as plt
import joblib

from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score, recall_score, classification_report, confusion_matrix
)

from xgboost import XGBClassifier
from xgboost.callback import EarlyStopping

import warnings
warnings.filterwarnings("ignore")

DATA_PATH = "/content/Blood_samples_dataset_medical_corrected_v2.csv"
SAVE_DIR = "/content/mediguard_final_model"

import os
os.makedirs(SAVE_DIR, exist_ok=True)

print(" Loading dataset...")
df = pd.read_csv(DATA_PATH)
print("Shape:", df.shape)

# full 24 features
features = [col for col in df.columns if col != "Disease"]

print("\n Cleaning outliers (values <0 or >1)...")

df_clean = df.copy()

for col in features:
    mask = (df_clean[col] < 0) | (df_clean[col] > 1)
    if mask.sum() > 0:
        print(f"Fixing {mask.sum()} outliers in {col}...")
        df_clean.loc[mask, col] = df_clean.groupby("Disease")[col].transform("median")

print(" Outliers fixed using disease-wise median.")

X = df_clean[features]
y = df_clean["Disease"]

le = LabelEncoder()
y_enc = le.fit_transform(y)

X_train, X_temp, y_train, y_temp = train_test_split(
    X, y_enc, test_size=0.4, stratify=y_enc, random_state=42
)

X_val, X_test, y_val, y_test = train_test_split(
    X_temp, y_temp, test_size=0.5, stratify=y_temp, random_state=42
)

print("\n✂ Train:", X_train.shape)
print("✂ Validation:", X_val.shape)
print("✂ Test:", X_test.shape)

print("\n Training Balanced XGBoost Model...")

model = XGBClassifier(
    objective="multi:softprob",
    num_class=len(le.classes_),
    random_state=42,

    n_estimators=250,
    max_depth=4,
    learning_rate=0.05,

    reg_lambda=2.0,
    reg_alpha=1.0,

    subsample=0.7,
    colsample_bytree=0.7,

    min_child_weight=3,
    gamma=0.5,

    eval_metric="mlogloss"
)

model.fit(
    X_train, y_train,
    eval_set=[(X_val, y_val)],
    callbacks=[EarlyStopping(rounds=20, save_best=True)],
    verbose=50
)

print(" Model trained with balanced regularization!")

model_path = f"{SAVE_DIR}/xgboost_model.pkl"
le_path = f"{SAVE_DIR}/label_encoder.pkl"
features_path = f"{SAVE_DIR}/features.pkl"

joblib.dump(model, model_path)
joblib.dump(le, le_path)
joblib.dump(features, features_path)

print("\n PKL FILES SAVED:")
print(f"Model saved at:          {model_path}")
print(f"Label encoder saved at:  {le_path}")
print(f"Features saved at:       {features_path}")

y_train_pred = model.predict(X_train)

train_acc = accuracy_score(y_train, y_train_pred)
train_recall = recall_score(y_train, y_train_pred, average="macro")

print("\n TRAIN PERFORMANCE")
print("Train Accuracy:", train_acc)
print("Train Macro Recall:", train_recall)

y_pred = model.predict(X_test)

test_acc = accuracy_score(y_test, y_pred)
test_recall_macro = recall_score(y_test, y_pred, average="macro")

print("\n TEST PERFORMANCE")
print("Test Accuracy:", test_acc)
print("Test Macro Recall:", test_recall_macro)

print("\n CLASSIFICATION REPORT")
print(classification_report(y_test, y_pred, target_names=le.classes_))

plt.figure(figsize=(12,8))
sns.heatmap(confusion_matrix(y_test, y_pred), cmap="Blues")
plt.title("Confusion Matrix")
plt.show()


importance_df = pd.DataFrame({
    "Feature": features,
    "Importance": model.feature_importances_
}).sort_values(by="Importance", ascending=False)

print("\nFEATURE IMPORTANCE (ALL FEATURES)")
display(importance_df)

plt.figure(figsize=(10,6))
sns.barplot(data=importance_df, x="Importance", y="Feature")
plt.title("XGBoost Feature Importance")
plt.show()
