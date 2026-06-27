import os
import joblib

MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "models")

_models_cache = {}

def load_model(filename):
    if filename in _models_cache:
        return _models_cache[filename]
        
    filepath = os.path.join(MODELS_DIR, filename)
    if not os.path.exists(filepath):
        print(f"Warning: Model {filename} not found at {filepath}")
        return None
        
    try:
        model_data = joblib.load(filepath)
        _models_cache[filename] = model_data
        return model_data
    except Exception as e:
        print(f"Error loading {filename}: {e}")
        return None

def get_performance_model():
    return load_model("performance_rfr.pkl")

def get_promotion_model():
    return load_model("promotion_gbc.pkl")

def get_pay_equity_model():
    return load_model("pay_equity_lr.pkl")

def get_attrition_model():
    return load_model("attrition_pipeline.pkl")
