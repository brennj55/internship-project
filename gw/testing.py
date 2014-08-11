from pymongo import MongoClient
from random import random, randrange
import names

client = MongoClient('136.206.19.216', 27017)
client.edu.authenticate('john', 'nodeSucks')
gw = client.edu.gw

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

def create_module_data(moduleName, class_size):
	module = { '_id' : moduleName, 'data': {} }
	populate_weeks(module['data'], class_size)

	return module

def populate_weeks(module, class_size):
	students = []
	for i in range (0, class_size):
		students.append(create_student())

	for i in range(1, 13):
		new_students = [update_student(j) for j in students]
		module['week' + str(i)] = {'accuracy': round(random(), 2), 'week': i, 'students': new_students}