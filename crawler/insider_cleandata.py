import json

lines_seen = set() # holds lines already seen
outfile = open ('clean_insiderdata.json', "w")
outfile.write('[')
for line in open('insiderdata.json', "r"):
    if line != "[\n" and line != "]\n":
        line = line[:-2]
        print line
        json_line = json.loads(line)
        if json_line['description'] not in lines_seen:
            outfile.write(line+',\n')
            lines_seen.add(json_line['description'])
outfile.write(']')
outfile.close()