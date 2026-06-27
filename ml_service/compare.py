import sys
import os
import pandas as pd
import numpy as np

sys.path.append('c:/Users/Hp/Desktop/humetrics/humetrics/ml_service')
from data_loader import load_main_dataset, load_ibm_dataset
from model_loader import get_performance_model, get_pay_equity_model

# 1. Performance Differences
df_main = load_main_dataset()
perf_model = get_performance_model()

df_model = df_main.copy()
df_model['JobTitle_enc'] = perf_model['le_job'].transform(df_model['JobTitle'].astype(str))
df_model = pd.get_dummies(df_model, columns=['Department', 'Gender'], dtype=int)
for col in perf_model['ohe_cols']:
    if col not in df_model.columns:
        df_model[col] = 0

X = df_model[perf_model['features']]
X_imputed = perf_model['imputer'].transform(X)
X_scaled = perf_model['scaler'].transform(X_imputed)
preds = perf_model['model'].predict(X_scaled)

df_main['ML_Score'] = preds
df_main['JS_Score'] = df_main['PerformanceRating']
df_main['Diff'] = abs(df_main['ML_Score'] - df_main['JS_Score'])

top_perf_diff = df_main.sort_values('Diff', ascending=False).head(1).iloc[0]
print('--- PERFORMANCE MODEL ---')
print(f"EmployeeID: {top_perf_diff['EmployeeID']}")
print(f"JS Heuristic (Rating): {top_perf_diff['JS_Score']}")
print(f"ML Prediction: {top_perf_diff['ML_Score']:.2f}")
print(f"Why? ML uses features like Engagement ({top_perf_diff['EngagementScore']}), Burnout ({top_perf_diff['BurnoutRiskScore']})")

print('\n')

# 2. Pay Equity Differences
df_ibm = load_ibm_dataset()
pay_model = get_pay_equity_model()

df_eq = df_ibm.copy()
df_eq['Dept_enc'] = pay_model['le_dept'].transform(df_eq['Department'].astype(str))
df_eq['Role_enc'] = pay_model['le_role'].transform(df_eq['JobRole'].astype(str))

X_pay = df_eq[pay_model['features']]
pay_preds = pay_model['model'].predict(X_pay)

# Simple JS linear regression emulation for the top diffs
# JS uses JobLevel, TotalWorkingYears, YearsAtCompany, Education, PerformanceRating
js_features = ['JobLevel', 'TotalWorkingYears', 'YearsAtCompany', 'Education', 'PerformanceRating']
X_js = df_ibm[js_features].fillna(0)
from sklearn.linear_model import LinearRegression
lr_js = LinearRegression().fit(X_js, df_ibm['MonthlyIncome'])
js_pay_preds = lr_js.predict(X_js)

df_ibm['ML_Pred_Salary'] = pay_preds
df_ibm['JS_Pred_Salary'] = js_pay_preds
df_ibm['Actual_Salary'] = df_ibm['MonthlyIncome']
df_ibm['Diff'] = abs(df_ibm['ML_Pred_Salary'] - df_ibm['JS_Pred_Salary'])

top_pay_diff = df_ibm.sort_values('Diff', ascending=False).head(1).iloc[0]
print('--- PAY EQUITY MODEL ---')
print(f"EmployeeNumber: {top_pay_diff['EmployeeNumber']}")
print(f"Actual Salary: ${top_pay_diff['Actual_Salary']}")
print(f"JS Heuristic Predicted: ${top_pay_diff['JS_Pred_Salary']:.0f}")
print(f"ML Predicted: ${top_pay_diff['ML_Pred_Salary']:.0f}")
print(f"Why? ML considers Non-linear Role ({top_pay_diff['JobRole']}) & Dept ({top_pay_diff['Department']}) interactions.")
