'''CLI UI for PyInstaller Bundled Builds'''
import os
import sys
import webbrowser

logo = r'''
   _____                    ____            
  / ____|                  |  _ \           
 | (___   ___ ___  _ __ ___| |_) | _____  __
  \___ \ / __/ _ \| '__/ _ \  _ < / _ \ \/ /
  ____) | (_| (_) | | |  __/ |_) | (_) >  < 
 |_____/ \___\___/|_|  \___|____/ \___/_/\_\
                                            
'''
def bundled(version, app):

    app.template_folder = os.path.join(sys._MEIPASS, 'templates')
    app.static_folder = os.path.join(sys._MEIPASS, 'static')
    
    print(logo)
    print(f'{version} by Daniel Flanagan')
    print()
    print('Press Enter to Launch Setup')
    input()
    webbrowser.open('http:127.0.0.1:5000/setup')
    print('Serving ScoreBox @ port 5000')
    print('Closing this window closes ScoreBox')