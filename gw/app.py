#!flask/bin/python
from flask import Flask, jsonify, abort, make_response
from pymongo import MongoClient
from random import random, randrange
import names

app = Flask(__name__)
client = MongoClient('136.206.19.216', 27017)
client.edu.authenticate('john', 'nodeSucks')
gw = client.edu.gw

from flask.ext.httpauth import HTTPBasicAuth
auth = HTTPBasicAuth()

@auth.get_password
def get_password(username):
    if username == 'john':
        return 'brennan'
    return None

@auth.error_handler
def unauthorized():
    return make_response(jsonify( { 'error': 'Unauthorized access' } ), 401)


# dummy data code and helper methods. 
def create_student():
	studentNumGen = 10 ** 7
	studentNumber = int(round(random() * studentNumGen))
	confidence = round(random(), 2)
	
	if confidence >= .4:
		prediction = 'Pass'
	else:
		prediction = 'Fail'

	name = str(names.get_full_name())

	return { 'studentNo': studentNumber, 'name': name, 
		'confidence': confidence, 'prediction': prediction }

def update_student(student):
	new_student = student.copy()
	confidence = round(random(), 2)
	new_student['confidence'] = confidence
	if confidence >= .4:
		new_student['prediction'] = 'Pass'
	else:
		new_student['prediction'] = 'Fail'

	return new_student

def create_module_data(moduleName):
	module = { moduleName : {} }
	populate_weeks(module[moduleName])

	return module

def populate_weeks(module):

	students = []
	for i in range (0, 100):
		students.append(create_student())

	for i in range(1, 13):
		new_students = [update_student(j) for j in students]
		module['week' + str(i)] = {'accuracy': round(random(), 2), 'week': i, 'students': new_students}

#gw.insert({'_id': 'CA169', 'data': create_module_data('CA169')['CA169']})
#gw.insert({'_id': 'MS121', 'data': create_module_data('MS121')['MS121']})

#helper method to get the current week. 
def find_current(module):
	current_week = len(module['data'])
	return module['data']['week' + str(current_week)]

#list all the modules in the database.
@app.route('/modules/', methods = ['GET'])
@auth.login_required
def get_modules():
	module_list = {}
	all_modules = gw.find()

	if all_modules is not None:
		for module in all_modules:
			module_list[module['_id']] = 'gw/modules/' + module['_id']
		return jsonify(module_list)
	else:
		abort(404)

#list all the weeks in a given module in the database.
@app.route('/modules/<module>/', methods = ['GET'])
@auth.login_required
def get_single_module(module = None):
	module_in_db = gw.find_one({'_id': module})
	week_list = {}

	if module_in_db is not None:
		weeks = len(module_in_db['data']) + 1
		for week in range(1, weeks):
			week_list['week' + str(week)] = 'gw/modules/' + module + '/week' + str(week)
		week_list['current'] = 'gw/modules/' + module + '/current'
		return jsonify(week_list)

	else:
		abort(404)

#list all the student data for a given module in a given week.
@app.route('/modules/<module>/<week>', methods = ['GET'])
@auth.login_required
def get_week(module = None, week = None):
	module_in_db = gw.find_one({'_id': module})
	week_list = {}

	if module_in_db is not None:
		if week == 'current':
			current = find_current(module_in_db)
			return jsonify(current)
		try:
			return jsonify(module_in_db['data'][week])
		except KeyError:
			abort(404)
	else:
		abort(404)

if __name__ == '__main__':
	app.run(debug = True)
