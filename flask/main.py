from threading import Thread
from typing import Mapping

from flask import Flask, render_template, request, redirect
from flask_socketio import SocketIO, emit

from manager import CrossCountryManager
from intro import bundled

MANAGER = None

VERSION = 'v. 0.3 (02212021)'

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet')

@app.route('/')
def index():
    return splits()

@app.route('/setup')
def setup():
    return render_template('setup.html', version=VERSION)

@app.route('/init', methods=['POST'])
def initialize():
    setup = request.form
    global MANAGER
    MANAGER = CrossCountryManager(setup['csv'], socketio)
    socketio.emit('event-reset', MANAGER.get_event_object(), broadcast=True)
    return 'OK'

@app.route('/timekeeper')
def timekeeper():
    global MANAGER
    return render_template('timekeeper.html', runners=MANAGER.runners, splits=MANAGER.split_labels, title=MANAGER.title, tag=MANAGER.tag, heats=MANAGER.heats)

@app.route('/admin')
def admin():
    global MANAGER
    return render_template('admin.html', version=VERSION, runners=MANAGER.runners, splits=MANAGER.split_labels, title=MANAGER.title, tag=MANAGER.tag)

@app.route('/splits')
def splits():
    global MANAGER
    return render_template('splits.html', version=VERSION, runners=MANAGER.runners, splits=MANAGER.split_labels, title=MANAGER.title, tag=MANAGER.tag)

@app.route('/export')
def export_csv():
    global MANAGER
    return MANAGER.get_csv_export_string()


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
    MANAGER.start_event(json['start'], json['heat'])
    return emit('event-reset', MANAGER.get_event_object(), broadcast=True)

@socketio.on('split')
def split_runner(json):
    global MANAGER
    MANAGER.split(json['split'], json['runner'], json['timestamp'])
    return emit('runner-update', MANAGER.runners[json['runner']], broadcast=True)

@socketio.on('split-unknown')
def split_unknown(json):
    global MANAGER
    MANAGER.split_unknown(json['split'], json['timestamp'])
    return emit('unknown-update', MANAGER.unknowns, broadcast=True)

@socketio.on('finish-unknown')
def finish_unknown(json):
    global MANAGER
    MANAGER.finish_unknown(json['timestamp'])
    return emit('unknown-update', MANAGER.unknowns, broadcast=True)

@socketio.on('finish')
def finish_runner(json):
    global MANAGER
    MANAGER.finish_runner(json['runner'], json['timestamp'])
    return emit('runner-update', MANAGER.runners[json['runner']], broadcast=True)

@socketio.on('result-change')
def change_result(json):
    global MANAGER
    MANAGER.change_result(json['jersey'], json['initial'], json['timestamp'], json['split'])
    return emit('event-reset', MANAGER.get_event_object(), broadcast=True)

@socketio.on('admin-request', namespace='/admin')
def update_admin_client(data):
    global MANAGER
    if MANAGER:
        return emit("admin-reset", MANAGER.get_admin_object())

@socketio.on('visibility', namespace='/admin')
def update_visibility(json):
    global MANAGER
    MANAGER.update_visibility(json['key'], json['state'])
    return emit('visibility-update', {'state': MANAGER.visibility[json['key']], 'key': json['key']}, broadcast=True)

@socketio.on('lower_third', namespace='/admin')
def update_lower_third(json):
    global MANAGER
    MANAGER.update_lower_third(json['title'], json['subtitle'])
    return emit('lower_third_update', MANAGER.lower_third, broadcast=True)

if __name__ == '__main__':
    # bundled(VERSION, app)
    socketio.run(app, port=5000)