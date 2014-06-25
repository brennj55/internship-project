
# coding: utf-8

# In[1]:

import pandas as pd


# In[2]:

from pymongo import MongoClient
client = MongoClient()
db = client.edu
logs_collection = db.logs
results_collection = db.results
lookup_collection = db.lookup


# In[12]:

def lookup_module_id(course_code):
    return [i['moodle_id'] for i in list(lookup_collection.find({'module_id': course_code}))]


# In[10]:

def get_logs(course_code):
    """
    Returns DataFrame of all course logs with given course_code
    """
    
    moodle_ids = lookup_module_id(course_code)
    
    # Ignore cases with more than one match for the moment
    if(len(moodle_ids) > 1): raise Exception("There are more than one moodle_ids for given course_code")
    
    moodle_id = moodle_ids[0]
    
    logs = list(logs_collection.find({'course': moodle_id}))
    logs = pd.DataFrame(logs).set_index('_id').sort_index()
    logs['time'] = pd.to_datetime(logs.time, unit='s')
    
    return logs


# In[21]:

def get_results(course_code):
    """
    Returns DataFrame of all results with given course_code
    """
    
    return pd.DataFrame(list(results_collection.find({'module_id': course_code})))

