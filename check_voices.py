import requests
import json
import os

url = 'https://api.murf.ai/v1/speech/voices'
headers = {'api-key': os.environ.get('MURF_API_KEY', 'ap2_249aac09-7064-46ed-975b-1fcb289affbf'), 'Accept': 'application/json'}
r = requests.get(url, headers=headers)
names_to_check = ['Hazel', 'Edmund', 'Marcus', 'Cooper', 'Nathan', 'Ken']

for v in r.json():
    if v['displayName'] in names_to_check and 'en-' in v['voiceId']:
        print(f"{v['displayName']}: {v['voiceId']} - {v.get('availableStyles', [])}")
