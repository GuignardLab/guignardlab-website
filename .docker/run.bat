@echo off
setlocal

rem name of image
set IMAGE=lab-website-renderer:latest

rem name of running container
set CONTAINER=lab-website-renderer

rem choose platform flag
set PLATFORM=

rem default vars
set WORKING_DIR=%cd%

rem build docker image
docker build %PLATFORM% ^
    --tag %IMAGE% ^
    --file .\.docker\Dockerfile .
if errorlevel 1 exit /b %errorlevel%

rem run built docker image
docker run %PLATFORM% ^
    --name %CONTAINER% ^
    --init ^
    --rm ^
    --interactive ^
    --tty ^
    --publish 4000:4000 ^
    --publish 35729:35729 ^
    --volume "%WORKING_DIR%:/usr/src/app" ^
    %IMAGE% %*

endlocal