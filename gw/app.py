#!flask/bin/python
from flask import Flask, jsonify, abort, make_response, render_template
from pymongo import MongoClient
from random import random, randrange
import names

app = Flask(__name__)
client = MongoClient('136.206.19.73', 27017)
client.edu.authenticate('john', 'nodeSucks')
gw = client.edu.gw

student_set = {}

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
			module_list[module['_id']] = 'gw/modules/' + module['_id'] + '/'
		return jsonify(module_list)
	else:
		abort(404)

#list all the weeks in a given module in the database.
@app.route('/modules/<module>/', methods = ['GET'])
@auth.login_required
def get_single_module(module = None):
	module_in_db = gw.find_one({'_id': module})
	directory = {}

	if module_in_db is not None:
		directory['students'] = 'gw/modules/' + module + '/students/'
		directory['weeks'] = 'gw/modules/' + module + '/weeks/'
		return jsonify(directory)

	else:
		abort(404)

@app.route('/modules/<module>/weeks/', methods = ['GET'])
@auth.login_required
def get_module_weeks(module = None):
	module_in_db = gw.find_one({'_id': module})
	week_list = {}

	if module_in_db is not None:
		weeks = len(module_in_db['data']) + 1
		for week in range(1, weeks):
			week_list['week' + str(week)] = 'gw/modules/' + module + '/weeks/'  + 'week' + str(week)
		week_list['current'] = 'gw/modules/' + module + '/weeks/current'
		return jsonify(week_list)

	else:
		abort(404)

#list all the student data for a given module in a given week.
@app.route('/modules/<module>/weeks/<week>', methods = ['GET'])
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

@app.route('/modules/<module>/students/', methods = ['GET'])
@auth.login_required
def get_students(module = None):
	module_in_db = gw.find_one({'_id': module})
	student_list = {}

	if module_in_db is not None:
		for student in module_in_db['data']['week1']['students']:
			student_list[student['studentNo']] = 'gw/modules/' + module + '/students/' + str(student['studentNo'])
		return jsonify(student_list)

	else:
		abort(404)

@app.route('/modules/<module>/students/<student_id>', methods = ['GET'])
@auth.login_required
def get_one_student(module = None, student_id = None):
	module_in_db = gw.find_one({'_id': module})
	student_week_list = {}

	if module_in_db is not None:

		weeks = len(module_in_db['data']) + 1
		for week in range(1, weeks):

			for student in module_in_db['data']['week' + str(week)]['students']:
				if str(student['studentNo']) == student_id:
					student_week_list[week] = student

		return jsonify(student_week_list)

	else:
		abort(404)

def get_students():
	for module in gw.find():
		for student in module['data']['week1']['students']:
			student[module['_id']] = 'students/' + str(student['studentNo']) + '/' + module['_id']
			student_set[student['studentNo']] = student

@app.route('/students/', methods = ['GET'])
@auth.login_required
def list_students():	
	if not student_set: 
		get_students()

	output = {}
	for student in student_set:
		output[student] = '/students/' + str(student) + '/'

	return jsonify(output)

@app.route('/students/<int:student_id>/', methods = ['GET'])
@auth.login_required
def list_individual_student(student_id = None):
	if not student_set: 
		get_students()


	if student_id in student_set:
		output = student_set[student_id]
		if 'confidence' in output:
			del output['confidence']
		if 'prediction' in output:
			del output['prediction']
		return jsonify(output)
	else:
		abort(404)

@app.route('/students/<int:student_id>/<module>', methods = ['GET'])
@auth.login_required
def list_students_module_info(student_id = None, module = None):
	if not student_set: 
		get_students()
	
	module_in_db = gw.find_one({'_id': module})

	if module_in_db is not None and student_id in student_set and module in student_set[student_id]:
		student_week_list = {}

		for week in range (1, len(module_in_db['data']) + 1):
			for student in module_in_db['data']['week' + str(week)]['students']:
				if student['studentNo'] == student_id:
					student['accuracy'] = module_in_db['data']['week' + str(week)]['accuracy']
					if week is len(module_in_db['data']):
						student_week_list['current'] = student
					else:
						student_week_list[str(week)] = student

		return jsonify(student_week_list)

	else:
		abort(404)

if __name__ == '__main__':
	app.run(debug = True, port = 5001)
