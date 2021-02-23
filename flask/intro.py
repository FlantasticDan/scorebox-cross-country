'''
PyInstaller Bundled Build Parser
   _____                    ____            
  / ____|                  |  _ \           
 | (___   ___ ___  _ __ ___| |_) | _____  __
  \___ \ / __/ _ \| '__/ _ \  _ < / _ \ \/ /
  ____) | (_| (_) | | |  __/ |_) | (_) >  < 
 |_____/ \___\___/|_|  \___|____/ \___/_/\_\

    args = {
        '1': Admin Control Key,
        '2': Port to Serve App on,
        '3': Overlay .exe Path
    }
                                            
'''

import os
import sys

def bundled(app):

    if sys.argv[1] != 'test':
        app.template_folder = os.path.join(sys._MEIPASS, 'templates')
        app.static_folder = os.path.join(sys._MEIPASS, 'static')

    return sys.argv[1], sys.argv[2], sys.argv[3]