#!/usr/bin/env python
# coding: utf-8

# ## Import necessary library

# In[53]:


#get_ipython().run_line_magic('matplotlib', 'inline')
import json
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt


# In[54]:


# Get drawing from ndjson file
def get_drawings_dict(d_key):
    filename = "./data/" + d_key + ".ndjson"
    
    by_key_id = {}
    with open(filename) as f:
        i = 0
        for line in f:
            drawing = json.loads(line)
            
            # Filter only recognised one
            if drawing['recognized'] == True:
                by_key_id[i] = drawing
                i += 1
    return by_key_id


# Get drawing from ndjson file indexed by country
def get_dict_by_country(d_key):
    filename = "./data/" + d_key + ".ndjson"

    byCountry = {}
    with open(filename) as f:
        i = 0
        for line in f:
            drawing = json.loads(line)
            country = drawing['countrycode']

            # Filter only recognised one
            if drawing['recognized'] == True:
                if country in byCountry:
                    byCountry[country][i] = drawing
                else:
                    byCountry[country] = {}
                    byCountry[country][i] = drawing
                i += 1
    return byCountry

# Get the x and y coordinates of the drawing 
def get_coordinates(drawing):
    return drawing['drawing'][0][0], drawing['drawing'][0][1]

# total time taken: last point of last stroke (ms)
def get_time_taken(drawing):
    #print(drawing)
    numStrokes = len(drawing['drawing'])
    lengthLastStroke = len(drawing['drawing'][numStrokes-1][2])
    return drawing['drawing'][numStrokes-1][2][lengthLastStroke-1]

# Get the set of country
def get_country(drawing_dict):
    country_set = set(val['countrycode'] for val in drawing_dict.values())
    return country_set

# Get N sample from a country
def get_sample_from_country(country, drawing_dict):
    newDict = dict()
    i = 0
    for (key,value) in drawing_dict.items():
        if value['countrycode'] == country:
            newDict[i] = value
            i += 1
    return newDict

def clockwise(x, y):
    sum_area = 0
    for i in range(len(x) - 1):
        sum_area += (x[i+1] - x[i])*(y[i+1]+y[i])
    if sum_area < 0:
        return True
    else:
        return False

# dict_circle = get_drawings_dict('circle')

# fig, ax_arr = plt.subplots(nrows=5,
#                            ncols=10,
#                            figsize=(8, 4),
#                            subplot_kw=dict(xticks=[],
#                                            yticks=[],
#                                            frame_on=False))
# fig.tight_layout()
#
# i = 0
# for row_num, ax_row in enumerate(ax_arr):
#     for col_num, ax in enumerate(ax_row):
#         x,y = get_coordinates(dict_square[i])
#         if clockwise(x,y):
#             ax.plot(x,y,color='blue', linewidth=0.5)
#         else:
#             ax.plot(x,y,color='red', linewidth=0.5)
#         i += 1
#
# plt.show()
#
# #dict1 = get_drawings_dict('circle')
#
# fig, ax = plt.subplots(figsize=(5, 5),
#                            subplot_kw=dict(xticks=[],
#                                            yticks=[],
#                                            frame_on=False))
# fig.tight_layout()
#
# for i in range(20):
#     x,y = get_coordinates(dict_square[i])
#     if clockwise(x,y):
#         plt.plot(x,y,color='blue', linewidth=0.3)
#
#
#
# #dict_square = get_drawings_dict('circle')
#
# fig, ax = plt.subplots(figsize=(5, 5),
#                            subplot_kw=dict(xticks=[],
#                                            yticks=[],
#                                            frame_on=False))
# fig.tight_layout()
#
# for i in range(10):
#     x,y = get_coordinates(dict_square[i])
#     if not clockwise(x,y):
#         plt.plot(x,y,color='red', linewidth=0.3)


# SQUARE


dict_square = get_drawings_dict('square')

fig, ax_arr = plt.subplots(nrows=5, 
                           ncols=10, 
                           figsize=(8, 4),
                           subplot_kw=dict(xticks=[],
                                           yticks=[],
                                           frame_on=False))
fig.tight_layout()

i = 0
for row_num, ax_row in enumerate(ax_arr):    
    for col_num, ax in enumerate(ax_row):
        x,y = get_coordinates(dict_square[i])
        if clockwise(x,y):
            ax.plot(x,y,color='blue', linewidth=0.5)
        else:
            ax.plot(x,y,color='red', linewidth=0.5)
        i += 1

# TRIANGLE
# dict_triangle = get_drawings_dict('triangle')
#
# fig, ax_arr = plt.subplots(nrows=5,
#                            ncols=10,
#                            figsize=(8, 4),
#                            subplot_kw=dict(xticks=[],
#                                            yticks=[],
#                                            frame_on=False))
# fig.tight_layout()
#
# i = 0
# for row_num, ax_row in enumerate(ax_arr):
#     for col_num, ax in enumerate(ax_row):
#         x,y = get_coordinates(dict_triangle[i])
#         if clockwise(x,y):
#             ax.plot(x,y,color='blue', linewidth=0.5)
#         else:
#             ax.plot(x,y,color='red', linewidth=0.5)
#         i += 1


# ## Create Csv file from dictionaries 

# In[6]:


import pandas as pd
import pycountry

def get_stats(key):
    stats = dict()

    dict1 = get_drawings_dict(key)
    country_set = get_country(dict1)
    for country in country_set:
        drawing_per_country = get_sample_from_country(country, dict1)
        num_clockwise = 0
        num_counter_clockwise = 0
        for (key,value) in drawing_per_country.items():
            x,y = get_coordinates(value)
            if clockwise(x,y):
                num_clockwise += 1
            else:
                num_counter_clockwise +=1        
        
        # Rename the country from ISO 3166-1 alpha-2 to country name 
        country_class = pycountry.countries.get(alpha_2=country)
        try:
            country_name = country_class.name
            stats.update({country_name : [num_clockwise, num_counter_clockwise]})
        except:
            continue

    return stats

# average time taken per country per category
def get_avg_time(country, key):
    sum = 0
    num = 0
    #drawing_dict = get_dict_by_country(key)
    dict1=get_drawings_dict(key)
    newdict = get_sample_from_country(country, dict1)
    for (key, value) in newdict.items():
        print(key)
        sum += get_time_taken(value)
        num += 1
    return sum/num


def to_csv_direction(stats, file_name):
    df = pd.DataFrame.from_dict(stats)
    df = df.rename(index = {0: 'clockwise', 1:'counter_clockwise'})
    df = df.T
    df.to_csv(file_name)

def to_csv_time(time_dict, file_name):
    df = pd.DataFrame.from_dict(time_dict)
    #df = df.rename(index={0: 'clockwise', 1: 'counter_clockwise'})
    df = df.T
    df.to_csv(file_name)

# Define the keys
keys = ['square']
#

for key in keys:
    # stats = get_stats(key)
    # to_csv(stats, './data/' + key + '_per_country.csv')
    dict1 = get_drawings_dict(key)
    dict_time = {}
    country_set = get_country(dict1)
    for country in country_set:
        avg = get_avg_time(country,key)
        dict_time[country]=avg
    to_csv_time(dict_time,'./data/' + key + '_time_per_country.csv')




