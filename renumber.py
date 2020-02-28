# renames files in the current folder of the form '####-...' so that
# they increase in increments of 10.

import os
import re

here = os.getcwd()
files = next(os.walk(here))[2]
files.sort()

pattern = re.compile(r'^\d\d\d\d-')
numFiles = [file for file in files if pattern.search(file)]

i = 10
for file in numFiles:
    newName = str(i).zfill(4) + '-' + file[5:]
    os.rename(file,newName)
    i += 10