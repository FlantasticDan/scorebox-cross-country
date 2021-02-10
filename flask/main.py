import webbrowser

from eventlet.green import socket
from eventlet.green import threading
from eventlet.green import asyncore
from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit

from manager import CrossCountryManager

from test import RUNNERS

MANAGER = None

app = Flask(__name__)
socketio = SocketIO(app)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/init', methods=['POST'])
def initialize():
    setup = request.form
    global MANAGER
    MANAGER = CrossCountryManager(setup['title'], setup['tag'], setup['csv'])
    socketio.emit('event-reset', MANAGER.get_event_object(), broadcast=True)
    return 'OK'

@app.route('/timekeeper')
def timekeeper():
    global MANAGER
    return render_template('timekeeper.html', runners=MANAGER.runners)

@socketio.on('event-request')
def update_client(data):
    global MANAGER
    if MANAGER:
        return emit('event-reset', MANAGER.get_event_object())
    else:
        return

@socketio.on('start')
def start_event(json):
    global MANAGER
    MANAGER.start_event(json['start'])
    return emit('event-reset', MANAGER.get_event_object())

if __name__ == '__main__':
    # webbrowser.open('http://localhost:5000')
    socketio.run(app, port=5000)