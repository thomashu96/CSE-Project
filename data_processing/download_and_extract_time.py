import os
import glob
import subprocess
import json
import csv
import sys
import pycountry

DATA_ROOT = "./data/"
PROCESS_ROOT = "./processed_data/time_per_"
CATEGORY_FILE = "./data_processing/list_category.txt"

os.chdir(os.path.dirname(sys.argv[0]))

# Function to get name of all the category
def get_raw_list():
    paths = []
    file_path = CATEGORY_FILE
    with open(file_path, 'r') as f:
        paths = f.readlines()
    return paths

# Function to download on category
def download_raw(file_id, dest_dir):
    gsutil_command = 'gsutil cp gs://quickdraw_dataset/full/raw/' + \
        file_id.replace(' ', '\ ') + '.ndjson' + ' ' + dest_dir + file_id.replace(' ', '\ ') + '.ndjson'
    print(gsutil_command)
    process = subprocess.Popen(
        gsutil_command, shell=True, stdout=subprocess.PIPE)
    process.wait()
    stdout, stderr = process.communicate()
    print(stdout, stderr)

# Get the time of the first and last point in a stroke (not drawing)
def time_first_point(stroke):
    return stroke[2][0]

def time_last_point(stroke):
    return stroke[2][-1]

def time_stroke(stroke):
    return time_last_point(stroke) - time_first_point(stroke)

def pause_time(drawing, stroke, stroke_index):
    if (stroke_index == 0):
        return 0
    prev_stroke = drawing['drawing'][stroke_index - 1]
    return time_first_point(stroke) - time_last_point(prev_stroke)

def gen_stats_stroke(drawing, stroke, stroke_index):
    stats = {
        "stroke_index": stroke_index,
        "stroke_time": time_stroke(stroke),
        "stroke_time_first": time_first_point(stroke),
        "stroke_time_last": time_last_point(stroke),
        "stroke_time_pause": pause_time(drawing, stroke, stroke_index)
    }
    
    return stats

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

# Generate data for a drawing
def gen_stats(drawing):
    first_stroke = drawing['drawing'][0]
    last_stroke = drawing['drawing'][-1]
    
    stats = {
        "key_id": drawing['key_id'],
        "recognized": drawing['recognized'],
        "word": drawing['word'],
        "stroke_count": len(drawing['drawing']),
        "countrycode": get_country_name(drawing['countrycode']),
        "drawing_time_total": time_last_point(last_stroke) - time_first_point(first_stroke)
    }
    strokes = []
    
    for idx, stroke in enumerate(drawing['drawing']):
        strokes.append(gen_stats_stroke(drawing, stroke, idx))
    pause_times = [s['stroke_time_pause'] for s in strokes]
    stats['drawing_time_pause'] = sum(pause_times)
    stroke_times = [s['stroke_time'] for s in strokes]
    stats['drawing_time_draw'] = sum(stroke_times)
    
    return stats

# Function to save format in csv
def save_stats(drawing_name, filename):
    stats = []
    with open(filename) as f:
        for line in f:
            drawing = json.loads(line)
            drawing_stats = gen_stats(drawing)
            stats.append(drawing_stats)
    with open(PROCESS_ROOT + drawing_name.replace(' ', '_') + '_stats.csv', 'w') as f:
        w = csv.DictWriter(f, stats[0].keys())
        w.writeheader()
        w.writerows(stats)   

if __name__ == "__main__":
    # Get list of all the category
    list_category = get_raw_list()

    for path in list_category:
        raw_id = path.split('/')[-1].strip()
        local_path = os.path.join(DATA_ROOT, raw_id)
        
        # Download the data
        download_raw(raw_id, DATA_ROOT)
        
        # Extract time data
        filename = DATA_ROOT + raw_id + ".ndjson"
        save_stats(raw_id, filename)

        # Remove the data
        os.remove(DATA_ROOT + raw_id + '.ndjson')
