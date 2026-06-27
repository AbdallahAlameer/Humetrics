import os
import joblib
import pandas as pd
from data_loader import load_main_dataset, load_ibm_dataset

from sklearn.ensemble import RandomForestRegressor, GradientBoostingClassifier, GradientBoostingRegressor
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.impute import SimpleImputer
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from imblearn.over_sampling import SMOTE

MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "models")
os.makedirs(MODELS_DIR, exist_ok=True)

def train_performance_model():
    print("Training Performance Model...")
    df = load_main_dataset()
    leakage_cols = ["LastOverallScore", "AvgCommunication", "AvgTeamwork", "AvgProblemSolving", "PerformanceRating"]
    exclude = set(leakage_cols + ["EmployeeID", "AvgOverallScore", "PerformanceDropFlag", "Department", "Gender", "JobTitle", "AttritionFlag"])
    
    numeric_features = [c for c in df.select_dtypes(include="number").columns if c not in exclude]
    
    df_model = df.copy()
    le_job = LabelEncoder()
    df_model["JobTitle_enc"] = le_job.fit_transform(df_model["JobTitle"].astype(str))
    
    df_model = pd.get_dummies(df_model, columns=["Department", "Gender"], drop_first=True, dtype=int)
    ohe_cols = [c for c in df_model.columns if c.startswith("Department_") or c.startswith("Gender_")]
    
    all_features = numeric_features + ["JobTitle_enc"] + ohe_cols
    
    X = df_model[all_features]
    y = df_model["AvgOverallScore"]
    
    imputer = SimpleImputer(strategy="median")
    X_imputed = pd.DataFrame(imputer.fit_transform(X), columns=all_features, index=X.index)
    
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X_imputed)
    
    rfr = RandomForestRegressor(max_depth=10, max_features='sqrt', min_samples_leaf=5, min_samples_split=10, n_jobs=-1, random_state=42)
    rfr.fit(X_scaled, y)
    
    # Save model and preprocessors
    model_data = {
        "model": rfr,
        "imputer": imputer,
        "scaler": scaler,
        "le_job": le_job,
        "features": all_features,
        "ohe_cols": ohe_cols
    }
    joblib.dump(model_data, os.path.join(MODELS_DIR, "performance_rfr.pkl"))
    print("Saved performance_rfr.pkl")

def train_promotion_model():
    print("Training Promotion Model...")
    df = load_ibm_dataset()
    drop_cols = ["EmployeeCount", "StandardHours", "Over18", "EmployeeNumber"]
    df = df.drop(columns=drop_cols, errors="ignore")
    
    categorical_cols = df.select_dtypes(include=["object"]).columns.tolist()
    if "Attrition" in categorical_cols:
        categorical_cols.remove("Attrition")
        
    for col in categorical_cols:
        df[col + "_enc"] = LabelEncoder().fit_transform(df[col].astype(str))
        
    df["YearsPerCompany"] = df["TotalWorkingYears"] / (df["NumCompaniesWorked"] + 1)
    df["IncomePerLevel"]  = df["MonthlyIncome"] / df["JobLevel"]
    df["RoleStagnation"]  = df["YearsInCurrentRole"] / (df["TotalWorkingYears"] + 1)
    
    exclude = [
        "PerformanceRating", "YearsInCurrentRole", "YearsSinceLastPromotion", "JobLevel",
        "PromotionReady", "Attrition"
    ] + categorical_cols + ["IncomePerLevel", "RoleStagnation"]
    
    features = [c for c in df.columns if c not in exclude]
    numeric_features = [f for f in features if not f.endswith("_enc")]
    encoded_features = [f for f in features if f.endswith("_enc")]
    
    X = df[features]
    y = df["PromotionReady"]
    
    preprocessor = ColumnTransformer(
        transformers=[
            ("num", Pipeline(steps=[("imputer", SimpleImputer(strategy="median")), ("scaler", StandardScaler())]), numeric_features),
            ("enc", SimpleImputer(strategy="most_frequent"), encoded_features)
        ]
    )
    
    X_processed = preprocessor.fit_transform(X)
    
    smote = SMOTE(random_state=42)
    X_res, y_res = smote.fit_resample(X_processed, y)
    
    model = GradientBoostingClassifier(learning_rate=0.05, min_samples_leaf=10, random_state=42, subsample=0.8)
    model.fit(X_res, y_res)
    
    model_data = {
        "model": model,
        "preprocessor": preprocessor,
        "features": features
    }
    joblib.dump(model_data, os.path.join(MODELS_DIR, "promotion_gbc.pkl"))
    print("Saved promotion_gbc.pkl")

def train_pay_equity_model():
    print("Training Pay Equity Model...")
    df = load_ibm_dataset()
    df_eq = df[["MonthlyIncome", "Gender", "Department", "JobRole", "JobLevel",
                "TotalWorkingYears", "YearsAtCompany", "YearsInCurrentRole",
                "Education", "PerformanceRating", "EmployeeNumber"]].copy()
    
    le_dept = LabelEncoder()
    le_role = LabelEncoder()
    df_eq["Dept_enc"] = le_dept.fit_transform(df_eq["Department"].astype(str))
    df_eq["Role_enc"] = le_role.fit_transform(df_eq["JobRole"].astype(str))
    df_eq["Gender_Male"] = (df_eq["Gender"] == "Male").astype(int)
    
    legitimate_features = ["JobLevel", "TotalWorkingYears", "Role_enc", "Dept_enc",
                           "YearsAtCompany", "Education", "PerformanceRating"]
    
    X_base = df_eq[legitimate_features]
    y_sal  = df_eq["MonthlyIncome"]
    
    model_base = GradientBoostingRegressor(random_state=42, n_estimators=100)
    model_base.fit(X_base, y_sal)
    
    model_data = {
        "model": model_base,
        "features": legitimate_features,
        "le_dept": le_dept,
        "le_role": le_role
    }
    joblib.dump(model_data, os.path.join(MODELS_DIR, "pay_equity_lr.pkl"))
    print("Saved pay_equity_lr.pkl")

def train_attrition_model():
    print("Training Attrition Model...")
    df = load_main_dataset()
    numeric_features = [
        "Salary", "TenureYears", "AbsenceDays_Last6M", "AbsenceFrequency_Last6M",
        "TrainingCount", "DaysSinceLastTraining", "YearsSinceLastRaise",
        "AvgOverallScore", "LastOverallScore", "AvgCommunication", "AvgTeamwork",
        "AvgProblemSolving", "EngagementScore", "BurnoutRiskScore"
    ]
    binary_features = [
        "EarlyTenureFlag", "HighPerformerFlag", "LongLeaveFlag", "HighAbsenceFlag",
        "PerformanceDropFlag", "NoTrainingFlag", "PayStagnationFlag", "CareerStagnationFlag"
    ]
    ordinal_features = ["PerformanceRating"]
    
    features = numeric_features + ordinal_features + binary_features
    X = df[features]
    y = df["AttritionFlag"]
    
    preprocessor = ColumnTransformer(
        transformers=[
            ("num", Pipeline(steps=[("imputer", SimpleImputer(strategy="median")), ("scaler", StandardScaler())]), numeric_features),
            ("ord", SimpleImputer(strategy="most_frequent"), ordinal_features),
            ("bin", SimpleImputer(strategy="most_frequent"), binary_features)
        ]
    )
    
    pipeline = Pipeline(steps=[
        ("preprocessor", preprocessor),
        ("model", LogisticRegression(max_iter=10000, penalty=None, solver='saga'))
    ])
    
    pipeline.fit(X, y)
    
    model_data = {
        "pipeline": pipeline,
        "features": features
    }
    joblib.dump(model_data, os.path.join(MODELS_DIR, "attrition_pipeline.pkl"))
    print("Saved attrition_pipeline.pkl")

if __name__ == "__main__":
    train_performance_model()
    train_promotion_model()
    train_pay_equity_model()
    train_attrition_model()
    print("All models trained successfully!")
