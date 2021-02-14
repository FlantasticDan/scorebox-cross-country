import webbrowser
from threading import Thread

from eventlet.green import socket
# from eventlet.green import threading
from eventlet.green import asyncore
from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit

from sock import Overlay

from manager import CrossCountryManager

MANAGER = None
OVERLAY = Overlay()

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

@app.route('/setup')
def index():
    return render_template('setup.html')

@app.route('/init', methods=['POST'])
def initialize():
    setup = request.form
    global MANAGER
    MANAGER = CrossCountryManager(setup['csv'])
    OVERLAY.set_title_tag(MANAGER.title, MANAGER.tag)
    socketio.emit('event-reset', MANAGER.get_event_object(), broadcast=True)
    return 'OK'

@app.route('/timekeeper')
def timekeeper():
    global MANAGER
    return render_template('timekeeper.html', runners=MANAGER.runners, splits=MANAGER.split_labels)

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
    if MANAGER.start == 0:
        MANAGER.start_event(json['start'])
        OVERLAY.start_clock(MANAGER.start)
    return emit('event-reset', MANAGER.get_event_object(), broadcast=True)

@socketio.on('mile-one')
def split_mile_one(json):
    global MANAGER
    MANAGER.split_mile_one(json['runner'], json['timestamp'])
    OVERLAY.push_json(MANAGER.export_placements())
    return emit('runner-update', MANAGER.runners[json['runner']], broadcast=True)

@socketio.on('mile-two')
def split_mile_two(json):
    global MANAGER
    MANAGER.split_mile_two(json['runner'], json['timestamp'])
    OVERLAY.push_json(MANAGER.export_placements())
    return emit('runner-update', MANAGER.runners[json['runner']], broadcast=True)

@socketio.on('finish')
def finish_runner(json):
    global MANAGER
    MANAGER.finish_runner(json['runner'], json['timestamp'])
    OVERLAY.push_json(MANAGER.export_placements())
    return emit('runner-update', MANAGER.runners[json['runner']], broadcast=True)

if __name__ == '__main__':
    # webbrowser.open('http://localhost:5000')
    socketio.run(app, port=5000)