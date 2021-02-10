import webbrowser

from eventlet.green import socket
from eventlet.green import threading
from eventlet.green import asyncore
from flask import Flask, render_template, request
from flask_socketio import SocketIO

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
    return 'OK'

@app.route('/timekeeper')
def timekeeper():
    return render_template('timekeeper.html', runners=RUNNERS)

if __name__ == '__main__':
    # webbrowser.open('http://localhost:5000')
    socketio.run(app, port=5000)