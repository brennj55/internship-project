from pymongo import MongoClient
from json import dumps
from flask import Flask, render_template

client = MongoClient('136.206.19.73', 27017)
client.edu.authenticate('john', 'nodeSucks')
lecturers = client.edu.lecturers
modules = client.edu.graphs
 
app = Flask(__name__)      
homeURL = 'home.html'

@app.route('/')
def home():
	return render_template(homeURL, 
		title="Login" )

@app.route('/lecturers/<username>')
def user(username = None):
	lecturer_info = lecturers.find_one({'_id': username})

	if (lecturer_info != None):
		lecturer = lecturer_info['name']
		return render_template('lecturerHome.html', 
				lecturer = lecturer,
				title = lecturer +"'s profile",
				modules = lecturer_info['modules'],
				noModules = len(lecturer_info['modules']) == 0
			)

	else:
		return 'No such lecturer.'

@app.route('/modules/<module>')
def module(module = None):
	module_info = modules.find_one({'_id': module})

	if (module_info != None):
		module_name = module_info['name']

		classifier_data = module_info['classifier_accuracy']['data']
		baseline = module_info['classifier_accuracy']['baseline']

		#this is an array (len 52) of arrays (len 187) containing student data.
		student_data = module_info['student_predictions']

		return render_template('module_home.html', 
				title = module + ": " + module_name,
				module_name = module_name,
				module_code = module,

				classifier_data = dumps(classifier_data),
				baseline = dumps(baseline),
				student_data = student_data
			)

	else:
		return 'No such module.'

if __name__ == '__main__':
	app.run(debug = True)


