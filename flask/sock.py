'''Overlay WebSocket Implementation'''
from threading import Thread
import json
import time

import websock

def format_time(milliseconds):
    rounded = round(milliseconds / 1000, 1)
    string_time, _ = str(rounded).split('.')
    pretty_time = time.strftime('%M:%S', time.gmtime(int(string_time)))
    if pretty_time[0] == '0':
        pretty_time = pretty_time[1:]
    return f'{pretty_time}'

class Overlay:

    def __init__(self):
        self.websock_server = websock.WebSocketServer('127.0.0.1', port=5500)

        self.thread = Thread(target=self.runner)
        self.thread.start()

        self.race_start = 0
        self.clock_thread = Thread(target=self.clock_pulse)
    
    def runner(self):
        self.websock_server.serve_forever()
    
    def push(self, data):
        self.websock_server.send_all(None, str(data))
    
    def push_json(self, dataObject):
        self.push(json.dumps(dataObject))

    def clock_pulse(self):
        while True:
            race_time = (time.time() * 1000) - self.race_start
            display = format_time(race_time)
            export = {
                'mode': 'clock',
                'display': display
            }
            self.push_json(export)
            time.sleep(0.5)
    
    def start_clock(self, start_timestamp):
        self.race_start = start_timestamp
        self.clock_thread.start()