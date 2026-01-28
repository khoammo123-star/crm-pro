@echo off
chcp 65001 > nul
echo ========================================
echo    CRM Pro - Hướng dẫn cập nhật
echo ========================================
echo.

REM Mở file CRM_COMPLETE.js
echo [1/3] Đang mở file CRM_COMPLETE.js...
start notepad "C:\Users\Admin\Downloads\crm\CRM_COMPLETE.js"

timeout /t 2 > nul

REM Mở Apps Script trong browser
echo [2/3] Đang mở Google Apps Script...
start https://script.google.com/

echo.
echo ========================================
echo    HƯỚNG DẪN:
echo ========================================
echo.
echo 1. Trong Notepad: Ctrl+A -> Ctrl+C (copy tất cả)
echo.
echo 2. Trong Apps Script:
echo    - Chọn project CRM
echo    - Click vào Code.gs
echo    - Ctrl+A -> Ctrl+V (paste đè lên)
echo    - Ctrl+S (lưu)
echo.
echo 3. Deploy:
echo    - Click "Deploy" -> "Manage deployments"
echo    - Click biểu tượng bút (edit)
echo    - Chọn "New version"
echo    - Click "Deploy"
echo.
echo ========================================
echo.
pause
