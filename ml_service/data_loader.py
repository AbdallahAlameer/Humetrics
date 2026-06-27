import pandas as pd
import numpy as np
import os

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "raw")

def load_main_dataset():
    df = pd.read_csv(os.path.join(DATA_DIR, "employee_ml_dataset_v3.csv"))
    
    # Preprocessing identical to notebook
    df["DaysSinceLastTraining"] = df["DaysSinceLastTraining"].replace(9999, np.nan)
    df["YearsSinceLastRaise"]   = df["YearsSinceLastRaise"].replace(9999, np.nan)
    df.loc[df["EngagementScore"] < 0, "EngagementScore"] = np.nan
    df.loc[df["BurnoutRiskScore"] < 0, "BurnoutRiskScore"] = np.nan
    
    # Optional columns derived if missing (like dataService.js)
    if "HighPerformerFlag" not in df.columns:
        df["HighPerformerFlag"] = (df["PerformanceRating"] >= 4).astype(int)
    if "EarlyTenureFlag" not in df.columns:
        df["EarlyTenureFlag"] = (df["TenureYears"] <= 1).astype(int)
    if "HighAbsenceFlag" not in df.columns:
        df["HighAbsenceFlag"] = (df["AbsenceDays_Last6M"] > 10).astype(int)
    if "NoTrainingFlag" not in df.columns:
        df["NoTrainingFlag"] = (df["TrainingCount"] == 0).astype(int)
    if "AvgOverallScore" not in df.columns:
        df["AvgOverallScore"] = df["PerformanceRating"]
    if "LastOverallScore" not in df.columns:
        df["LastOverallScore"] = df["PerformanceRating"]
    if "PayStagnationFlag" not in df.columns:
        df["PayStagnationFlag"] = (df["YearsSinceLastRaise"] >= 3).astype(int)
    if "CareerStagnationFlag" not in df.columns:
        df["CareerStagnationFlag"] = ((df["TenureYears"] >= 4) & (df["PerformanceRating"] <= 3)).astype(int)

    return df

def load_ibm_dataset():
    df = pd.read_csv(os.path.join(DATA_DIR, "HR-Employee-Attrition.csv"))
    # The promotion target
    if "PromotionReady" not in df.columns:
        df["PromotionReady"] = (
            (df["PerformanceRating"] == 4) &
            (df["YearsInCurrentRole"] >= 3) &
            (df["YearsSinceLastPromotion"] >= 2) &
            (df["JobLevel"] <= 4)
        ).astype(int)
    return df
