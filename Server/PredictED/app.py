#!env/bin/python
import requests, json
from flask import Flask, render_template, jsonify, abort
from pymongo import MongoClient

app = Flask(__name__)
hash_storage = MongoClient()
hash_storage = hash_storage.edu.hashes

@app.route('/<hash_value>')
def generate_page(hash_value = None):
	#check if hash is real.
	hash_in_db = hash_storage.find_one({'_id': hash_value})
	if hash_in_db is None:
		abort(404)

	#only let the student view if it hasn't been viewed before. 
	if not hash_in_db['student']['has_viewed']:
		request = requests.get("http://localhost:5001" + hash_in_db['student']['link'])
		json = request.json()

		#get rid of everyones student id except the users to ensure you can highlight particular bar on page. 
		for data in json['students']:
			if data['studentNo'] != hash_in_db['student']['studentNo']:
				data['studentNo'] = 'NULL'
			#also anonomize everyone who is opted out.
			#if not data['predictED_opted_in']:
				#data['name'] = 'Anonymous Student'

		#flip the boolean so the student cannot view it a second time. 
		#hash_storage.update({'_id': hash_in_db['_id']}, {'$set': {'student.has_viewed': True}}, upsert = False, multi = False)

		#return the page to the studeeent.
		return render_template('layout.html', json = json, ID = hash_in_db['student']['studentNo'],
			name = hash_in_db['student']['name'], module = hash_in_db['student']['module'], 
			title = hash_in_db['student']['name'], script = True,
			status = request.status_code, items =request.headers.items())
	else:
		return render_template('404.html')

if __name__ == '__main__':
	app.run(debug = True, host = '0.0.0.0')
