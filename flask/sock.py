'''Overlay WebSocket Implementation'''
from threading import Thread
import websock

class Overlay:

    def __init__(self):
        self.websock_server = websock.WebSocketServer('127.0.0.1', port=5500)

        self.thread = Thread(target=self.runner)
        self.thread.start()
    
    def runner(self):
        self.websock_server.serve_forever()
    
    def push(self, data):
        self.websock_server.send_all(None, str(data))

