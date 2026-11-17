; Registers GX Lite as a browser Windows can offer in Settings > Default apps (per-user, no admin needed).
; Windows does not let an app make itself the default silently: the user picks it in Settings.
!macro customInstall
  WriteRegStr HKCU "Software\Classes\GXLiteURL" "" "GX Lite URL"
  WriteRegStr HKCU "Software\Classes\GXLiteURL" "URL Protocol" ""
  WriteRegStr HKCU "Software\Classes\GXLiteURL\DefaultIcon" "" "$INSTDIR\GX Lite.exe,0"
  WriteRegStr HKCU "Software\Classes\GXLiteURL\shell\open\command" "" '"$INSTDIR\GX Lite.exe" "%1"'
  WriteRegStr HKCU "Software\Clients\StartMenuInternet\GX Lite" "" "GX Lite"
  WriteRegStr HKCU "Software\Clients\StartMenuInternet\GX Lite\DefaultIcon" "" "$INSTDIR\GX Lite.exe,0"
  WriteRegStr HKCU "Software\Clients\StartMenuInternet\GX Lite\shell\open\command" "" '"$INSTDIR\GX Lite.exe"'
  WriteRegStr HKCU "Software\Clients\StartMenuInternet\GX Lite\Capabilities" "ApplicationName" "GX Lite"
  WriteRegStr HKCU "Software\Clients\StartMenuInternet\GX Lite\Capabilities" "ApplicationDescription" "A small, fast web browser"
  WriteRegStr HKCU "Software\Clients\StartMenuInternet\GX Lite\Capabilities" "ApplicationIcon" "$INSTDIR\GX Lite.exe,0"
  WriteRegStr HKCU "Software\Clients\StartMenuInternet\GX Lite\Capabilities\URLAssociations" "http" "GXLiteURL"
  WriteRegStr HKCU "Software\Clients\StartMenuInternet\GX Lite\Capabilities\URLAssociations" "https" "GXLiteURL"
  WriteRegStr HKCU "Software\RegisteredApplications" "GX Lite" "Software\Clients\StartMenuInternet\GX Lite\Capabilities"
!macroend

!macro customUnInstall
  DeleteRegKey HKCU "Software\Classes\GXLiteURL"
  DeleteRegKey HKCU "Software\Clients\StartMenuInternet\GX Lite"
  DeleteRegValue HKCU "Software\RegisteredApplications" "GX Lite"
!macroend
