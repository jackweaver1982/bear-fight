# renames files in the folder 'src/javascript' (relative to the current
# directoty) of the form '0###-...'so that they increase in increments
# of 10.

import os
import re

here = os.getcwd() + '/src/javascript'
os.chdir(here)
files = next(os.walk(here))[2]
files.sort()

pattern = re.compile(r'^0\d\d\d-')
numFiles = [file for file in files if pattern.search(file)]

i = 10
for file in numFiles:
    newName = str(i).zfill(4) + '-' + file[5:]
    os.rename(file,newName)
    i += 10