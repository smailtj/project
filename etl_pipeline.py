"""ETL helpers for the OCP Zone 4 Excel exports.

Install dependencies with: pip install pandas openpyxl sqlalchemy
"""

from __future__ import annotations

from pathlib import Path
from typing import Any

import pandas as pd
from sqlalchemy import create_engine
from sqlalchemy.engine import Engine

EQUIPMENT_SHEET = "EQUIPEMENTS"
DOWNTIME_SHEET = "Feuille se saisie"


def _clean_column_names(frame: pd.DataFrame) -> pd.DataFrame:
    cleaned = frame.copy()
    cleaned.columns = [str(column).strip() for column in cleaned.columns]
    return cleaned


def extract_equipment_catalog(path: str | Path) -> pd.DataFrame:
    frame = pd.read_excel(path, sheet_name=EQUIPMENT_SHEET)
    frame = _clean_column_names(frame)
    frame = frame.rename(
        columns={"N° d'équipement": "equipment_code", "Equipment-SAP": "sap_id"}
    )
    expected = {"equipment_code", "sap_id"}
    missing = expected - set(frame.columns)
    if missing:
        raise ValueError(f"Equipment sheet is missing columns: {sorted(missing)}")
    for column, default in (("type", "UNKNOWN"), ("model", pd.NA), ("status", "UNKNOWN")):
        if column not in frame:
            frame[column] = default
    return frame[["sap_id", "equipment_code", "type", "model", "status"]].copy()


def extract_operating_hours(path: str | Path) -> pd.DataFrame:
    workbook = pd.ExcelFile(path)
    extracted: list[pd.DataFrame] = []
    for sheet_name in workbook.sheet_names:
        frame = pd.read_excel(path, sheet_name=sheet_name, header=None)
        if frame.empty:
            continue
        frame = frame.rename(columns={2: "equipment_code", 3: "operating_hours"})
        date_column = next(
            (column for column in frame.columns if str(column).lower() in {"date", "jour"}),
            0,
        )
        frame = frame.rename(columns={date_column: "date"})
        frame["date"] = pd.to_datetime(frame["date"], errors="coerce").ffill()
        frame["month_sheet"] = sheet_name
        extracted.append(frame[["date", "equipment_code", "operating_hours", "month_sheet"]])
    if not extracted:
        return pd.DataFrame(columns=["date", "equipment_code", "operating_hours", "month_sheet"])
    return pd.concat(extracted, ignore_index=True)


def extract_downtime_events(path: str | Path) -> pd.DataFrame:
    frame = _clean_column_names(pd.read_excel(path, sheet_name=DOWNTIME_SHEET))
    required = {"Heure de début", "Heure de fin", "Code d'arret Z4"}
    missing = required - set(frame.columns)
    if missing:
        raise ValueError(f"Downtime sheet is missing columns: {sorted(missing)}")
    frame = frame.rename(columns={"Code d'arret Z4": "downtime_code"})
    start = pd.to_datetime(frame["Heure de début"], errors="coerce")
    end = pd.to_datetime(frame["Heure de fin"], errors="coerce")
    frame["downtime_duration"] = (end - start).dt.total_seconds() / 3600
    return frame


def transform(frame: pd.DataFrame, date_columns: tuple[str, ...] = ()) -> pd.DataFrame:
    """Normalize missing values, dates, numeric values, and string whitespace."""
    result = frame.copy()
    result = result.replace(r"^\s*$", pd.NA, regex=True)
    for column in date_columns:
        if column in result:
            result[column] = pd.to_datetime(result[column], errors="coerce")
    for column in result.select_dtypes(include="object").columns:
        result[column] = result[column].map(lambda value: value.strip() if isinstance(value, str) else value)
    return result.convert_dtypes()


def load(frame: pd.DataFrame, table_name: str, engine: Engine, *, if_exists: str = "append") -> None:
    """Load a transformed frame into an existing SQLAlchemy table."""
    frame.to_sql(table_name, engine, if_exists=if_exists, index=False, method="multi")


def run_pipeline(
    equipment_path: str | Path,
    operating_hours_path: str | Path,
    downtime_path: str | Path,
    database_url: str,
) -> None:
    engine = create_engine(database_url, pool_pre_ping=True)
    equipment = transform(extract_equipment_catalog(equipment_path))
    operating_hours = transform(extract_operating_hours(operating_hours_path), ("date",))
    downtime = transform(extract_downtime_events(downtime_path))
    load(equipment, "equipment", engine)
    load(operating_hours, "shift_logs", engine)
    load(downtime, "downtime_events", engine)


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--equipment", required=True, type=Path)
    parser.add_argument("--operating-hours", required=True, type=Path)
    parser.add_argument("--downtime", required=True, type=Path)
    parser.add_argument("--database-url", required=True)
    args = parser.parse_args()
    run_pipeline(args.equipment, args.operating_hours, args.downtime, args.database_url)
