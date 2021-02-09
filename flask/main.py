import webbrowser

from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')



if __name__ == '__main__':
    # webbrowser.open('http://localhost:5000')
    app.run(port=5000)