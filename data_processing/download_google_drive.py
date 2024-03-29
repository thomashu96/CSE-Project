'''
Guide for usage:
In your terminal, run the command:
./data_processing/download_google_drive.py
Credited to
https://stackoverflow.com/questions/25010369/wget-curl-large-file-from-google-drive
author: https://stackoverflow.com/users/1475331/user115202
'''

import requests
import os
from zipfile import ZipFile

from tqdm import tqdm


def download_file_from_google_drive(id, destination):
    def get_confirm_token(response):
        for key, value in response.cookies.items():
            if key.startswith('download_warning'):
                return value

        return None

    def save_response_content(response, destination):
        CHUNK_SIZE = 32768

        with open(destination, "wb") as f:
            with tqdm(unit='B', unit_scale=True, unit_divisor=1024) as bar:
                for chunk in response.iter_content(CHUNK_SIZE):
                    if chunk:  # filter out keep-alive new chunks
                        f.write(chunk)
                        bar.update(CHUNK_SIZE)

    URL = "https://docs.google.com/uc?export=download"

    session = requests.Session()

    response = session.get(URL, params={'id': id}, stream=True)
    token = get_confirm_token(response)

    if token:
        params = {'id': id, 'confirm': token}
        response = session.get(URL, params=params, stream=True)

    save_response_content(response, destination)


if __name__ == "__main__":
    # TAKE ID FROM SHAREABLE LINK
    file_id = '1hKQTd4aqTQH3n7j6SgnAq_lkLKnZcI5z'
    # DESTINATION FILE ON YOUR DISK
    destination = './processed_data/data.zip'
    download_file_from_google_drive(file_id, destination)

    with ZipFile(destination, 'r') as zipObj:
        # Extract all the contents of zip file in different directory
        zipObj.extractall('./processed_data')
   
    # Remove the data
    os.remove('./processed_data/data.zip')
