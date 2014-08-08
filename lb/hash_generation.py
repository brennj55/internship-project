import hashlib 
from pymongo import MongoClient

client = MongoClient('136.206.19.216', 27017)
client.edu.authenticate('john', 'nodeSucks')
gw = client.edu.gw

hash_storage = MongoClient()
hash_storage = hash_storage.test.hashes
student_set = {}

def get_students(week):
	for module in gw.find():
		for student in module['data'][week]['students']:
			student['week'] = week
			student['module'] = module['_id']
			student['link'] = '/modules/' + module['_id'] + '/weeks/' + week
			student['has_viewed'] = False
			student_set[generate_hash(student)] = student

def generate_hash(student):
	string = student['module'] + '/' + student['week'] + '/' + student['name'] + '/' + str(student['studentNo'])
	hash_object = hashlib.sha1(string.encode('utf-8'))
	return hash_object.hexdigest()
	
def store_hashes():
	for key in student_set:
		hash_storage.insert({"_id": key, "student": student_set[key]})