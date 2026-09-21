"""Train and export a time-aware Random Forest health-score model."""

from __future__ import annotations

from pathlib import Path

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import GridSearchCV
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

FEATURES = [
    "rolling_avg_temp_7d",
    "rolling_max_pressure_3d",
    "cumulative_operating_hours",
    "payload_variance",
    "days_since_last_service",
]
TARGET = "machine_health_score"


def split_time_ordered(df: pd.DataFrame, test_size: float = 0.2) -> tuple[pd.DataFrame, pd.DataFrame]:
    if not 0 < test_size < 1:
        raise ValueError("test_size must be between 0 and 1")
    ordered = df.sort_index() if not isinstance(df.index, pd.DatetimeIndex) else df.sort_index()
    split_at = int(len(ordered) * (1 - test_size))
    if split_at < 1 or split_at >= len(ordered):
        raise ValueError("DataFrame is too small for the requested time split")
    return ordered.iloc[:split_at], ordered.iloc[split_at:]


def build_search() -> GridSearchCV:
    pipeline = Pipeline(
        steps=[
            ("scaler", StandardScaler()),
            ("model", RandomForestRegressor(random_state=42, n_jobs=-1)),
        ]
    )
    parameters = {
        "model__n_estimators": [100, 250, 500],
        "model__max_depth": [None, 10, 20, 30],
    }
    return GridSearchCV(pipeline, parameters, cv=3, scoring="neg_root_mean_squared_error", n_jobs=-1)


def train_health_model(df: pd.DataFrame, output_path: str | Path = "health_model.joblib") -> dict[str, float]:
    missing = set(FEATURES + [TARGET]) - set(df.columns)
    if missing:
        raise ValueError(f"Missing required columns: {sorted(missing)}")
    train_df, test_df = split_time_ordered(df[FEATURES + [TARGET]].dropna())
    search = build_search()
    search.fit(train_df[FEATURES], train_df[TARGET])
    predictions = search.predict(test_df[FEATURES])
    metrics = {
        "rmse": float(mean_squared_error(test_df[TARGET], predictions) ** 0.5),
        "mae": float(mean_absolute_error(test_df[TARGET], predictions)),
        "r2": float(r2_score(test_df[TARGET], predictions)),
    }
    joblib.dump(
        {"model": search.best_estimator_, "features": FEATURES, "metrics": metrics},
        output_path,
    )
    return metrics


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("csv", type=Path, help="CSV containing historical model features")
    parser.add_argument("--output", type=Path, default=Path("health_model.joblib"))
    args = parser.parse_args()
    print(train_health_model(pd.read_csv(args.csv), args.output))
