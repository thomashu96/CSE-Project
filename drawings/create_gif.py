import os
import json
import pandas
import csv
import pycountry
import sys
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation
from matplotlib import animation

os.chdir(os.path.dirname(sys.argv[0]))

# Read the category names
def get_raw_list(file_path):
    paths = []
    with open(file_path, 'r') as f:
        paths = f.read().splitlines()
    return paths

# Change the country_code to name of country if possible
def get_country_name(country_code):
    country_class = pycountry.countries.get(alpha_2=country_code)
    try:
        if country_code == 'TW':
            country_name = 'Taiwan'
        else:
            country_name = country_class.name
    except:
        country_name = country_code
    return country_name

# Get drawing from ndjson file
def get_drawings_dict(d_key):
    filename = "../data/simplified_" + d_key + ".ndjson"

    by_key_id = {}
    with open(filename) as f:
        for line in f:
            drawing = json.loads(line)

            # Change the country code to country name
            country_name = get_country_name(drawing['countrycode'])
            drawing['countrycode'] = country_name

            # Filter only recognised one
            if drawing['recognized'] == True:
                by_key_id[drawing['key_id']] = drawing

    return by_key_id

# Get the x and y coordinates of the drawing
def get_coordinates(drawing):
    x = []
    y = []
    list_stroke = drawing['drawing']
    for i in range(len(list_stroke)):
        x.append(list_stroke[i][0])
        y.append(list_stroke[i][1])
    return x, y

# Get the set of country
def get_country(drawing_dict):
    country_set = set(val['countrycode'] for val in drawing_dict.values())
    return country_set

# Get all sample from a country
def get_keys_from_country(country, drawing_dict):
    key_list = []
    for (key, value) in drawing_dict.items():
        if value['countrycode'] == country:
            key_list.append(key)
    return key_list

# Save the print into a gif file 
def save_figure_animated(list_key, drawing_dict, filename):
    fig, ax = plt.subplots(figsize=(3, 3),
                           subplot_kw=dict(xticks=[],
                                           yticks=[],
                                           frame_on=False))
    fig.tight_layout
    
    plt.xlim(0, 255)
    plt.ylim(0, 255)
    plt.gca().invert_yaxis()
        
    # Create color map
    cmap = plt.get_cmap('nipy_spectral')
    colors = [cmap(i) for i in np.linspace(0, 1, 10)]
    
    x_list = []
    y_list = []
    lines = []
    max_len = 0
    for i,key in enumerate(list_key[:10]):
        x,y = get_coordinates(drawing_dict[key])
        temp_x = []
        temp_y = []
        for j in range(len(x)):
            x_list.append(x[j])
            y_list.append(y[j])
            line = plt.plot([], [])[0]
            line.set_color(colors[i])
            line.set_linewidth(0.8)
            lines.append(line)
            
            # Get maximum length for the frames
            if (len(x[j]) > max_len):
                max_len = len(x[j])

    def init():
        #init lines
        for line in lines:
            line.set_data([], [])
        return lines

    def animate(i):
        for j,line in enumerate(lines):
            line.set_data(x_list[j][:i], y_list[j][:i])
        return lines
    
    anim = animation.FuncAnimation(fig, animate, init_func=init,
                               frames=max_len + 5, interval=50, blit=True)
    
    anim.save(filename, writer='imagemagick', fps=20)

# create 10 drawings for all country in a category
def create_drawings(category):
    path = category + '_gif'
    try:
        # Try to create the folder to save the gif by category
        os.mkdir(path)
    except OSError:
        print("Creation of the directory %s failed" % path)
    else:
        print("Successfully created the directory %s " % path)

    drawing_dict = get_drawings_dict(category)
    country_set = get_country(drawing_dict)

    for country in country_set:
        list_key = get_keys_from_country(country, drawing_dict)
        count = len(list_key)
        if count > 5:
            save_name = category + '_' + country.replace(" ", "_") + '.gif'
            save_figure_animated(list_key, drawing_dict, path + '/' + save_name)

if __name__ == "__main__":
    list_category = get_raw_list("../processed_data/list_category_8.txt")

    for category in list_category:
        category = category.replace(' ', '_')
        create_drawings(category)
