#------------------------------
#
# Template: Qt + SDL (x64 bits)
#
#------------------------------
 
QT       += core gui
greaterThan(QT_MAJOR_VERSION, 4): QT += widgets
TARGET = QtSDL
TEMPLATE = app
 
win32:{
# Resolve conflicts between Qt and SDL
CONFIG-= windows
QMAKE_LFLAGS += $$QMAKE_LFLAGS_WINDOWS
# SDL
INCLUDEPATH+=C:/SDL2-2.0.0/include
LIBS +=-LC:/SDL2-2.0.0/lib/x64 -lSDL2
LIBS +=-LC:/SDL2-2.0.0/lib/x64 -lSDL2main
}
linux:{
# SDL
INCLUDEPATH+= /SDL2-2.0.0/include
LIBS +=-L/SDL2-2.0.0/lib/x64 -lSDL2
LIBS +=-L/SDL2-2.0.0/lib/x64 -lSDL2main
}
 
# Project
SOURCES += main.cpp \
    mainwindow.cpp
 
HEADERS  += mainwindow.h
 
FORMS    += mainwindow.ui
