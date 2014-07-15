#! /usr/bin/python3

import sys
from IPython.nbformat.current import read, write

json_in = read(sys.stdin, 'json')

for sheet in json_in.worksheets:
    for cell in sheet.cells:
        if "outputs" in cell:
            cell.outputs = []
        if "prompt_number" in cell:
            cell.prompt_number = ''

json_in.metadata.signature = ''

write(json_in, sys.stdout, 'json')

