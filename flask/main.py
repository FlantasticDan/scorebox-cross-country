import webbrowser

from flask import Flask, render_template, request

from test import RUNNERS

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/init', methods=['POST'])
def initialize():
    print(request.form)
    return 'OK'

@app.route('/timekeeper')
def timekeeper():
    return render_template('timekeeper.html', runners=RUNNERS)

if __name__ == '__main__':
    # webbrowser.open('http://localhost:5000')
    app.run(port=5000)