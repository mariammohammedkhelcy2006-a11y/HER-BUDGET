@echo off
cd /d "c:\Users\HP\Desktop\HER BUDGET\backend"

REM Start the API without seeding or reload in production.
if exist .venv\Scripts\python.exe (
	set PYTHON=.venv\Scripts\python.exe
) else (
	set PYTHON=python
)
if not defined API_PORT set API_PORT=8000

%PYTHON% -m uvicorn main:app --host 0.0.0.0 --port %API_PORT%
