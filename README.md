# CSE-Project

### Download the time stats dataset

To download the drawing time statistics, run the python file `./data_processing/download_google_drive.py`. 

This will download the csv file for each category in the directory `./processed_data`.
Each csv file file have the following column: 
`key_id | recognized | word | stroke_count | countrycode |drawing_time_total | drawing_time_pause | drawing_time_draw`
All the time in the csv file are in milliseconds.