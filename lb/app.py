#!flask/bin/python
import requests, json
from flask import Flask, render_template, jsonify

app = Flask(__name__)

@app.route('/')
def index():
	request = requests.get("http://localhost:5001/modules/CA169/current", auth=('john', 'brennan'))
	json = request.json()
	return render_template('layout.html', json = json, status = request.status_code, items =request.headers.items())
	
if __name__ == '__main__':
	app.run(debug = True)
