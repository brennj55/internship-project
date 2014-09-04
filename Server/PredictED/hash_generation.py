import hashlib 
from pymongo import MongoClient

client = MongoClient('136.206.19.216', 27017)
client.edu.authenticate('john', 'nodeSucks')
gw = client.edu.gw

hash_storage = MongoClient()
hash_storage = hash_storage.edu.hashes
student_set = {}

#for every module with every student in the module for a given week,
#create a hash for each student. does all in one swoop.
def get_students(week):
	for module in gw.find():
		for student in module['data'][week]['students']:
			if not opted_in:
				student['name'] = "Anonymous Student"
			student['week'] = week
			student['module'] = module['_id']
			student['link'] = '/modules/' + module['_id'] + '/weeks/' + week
			student['has_viewed'] = False
			student_set[generate_hash(student)] = student

#the physical act of creating a hash. 
def generate_hash(student):
	string = student['module'] + '/' + student['week'] + '/' + student['name'] + '/' + str(student['studentNo'])
	hash_object = hashlib.sha1(string.encode('utf-8'))
	return hash_object.hexdigest()
	
#for every key in student set, put the hash in. 	
def store_hashes():
	for key in student_set:
		hash_storage.insert({"_id": key, "student": student_set[key]})