
# coding: utf-8

# In[1]:

from urllib import request
from bs4 import BeautifulSoup, element
import pandas as pd
import pickle
import re


# In[2]:

# Get all category IDs

course_list_url = request.urlopen('http://dcuv19y2013.moodle.dcu.ie/course/')
course_list = course_list_url.read().decode()
bs_course_list = BeautifulSoup(course_list)

category_ids = [int(re.findall(r"\w+", a.attrs['href'])[-1]) for a in bs_course_list.findAll('a') if '?' in a.attrs['href']]


# In[3]:

def process_id(id):
    url = 'http://dcuv19y2013.moodle.dcu.ie/course/category.php?id=' + str(id) + '&perpage=10000&page=0'
    
    courses = request.urlopen(url)
    text = courses.read().decode()
    bs = BeautifulSoup(text)
    
    link_list = bs.find_all('a')
    filtered_links = [a for a in link_list if a.attrs['href'].startswith('view.php?id=') and a.contents[0].name != 'img']
    
    category_name = bs.find_all('li')[-1].contents[-1]
    if type(category_name) is element.NavigableString:
        category_name = category_name.strip()
    
    courses = [[int(i.attrs['href'].split('=')[1])] + i.contents[0].split()[:2] + [" ".join(i.contents[0].split()[2:])] + [id, category_name] for i in filtered_links]
    
    return courses


# In[4]:

courses = []
for category in category_ids:
    courses += process_id(category)
courses


# In[5]:

courses_df = pd.DataFrame(courses, columns=['moodle_id', 'year', 'module_id', 'course_name', 'category_id', 'category_name'])
courses_df = courses_df.set_index('moodle_id')

# Exclude courses with incorrect year format
courses_df = courses_df[courses_df.year.str.contains('20../20..')]

# Exclude courses with no name
courses_df = courses_df[courses_df.course_name != '']

courses_df.sort_index()[:10]


# In[6]:

courses_df.to_pickle('../pickles/courses.pkl')

