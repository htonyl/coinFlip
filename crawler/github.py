import requests, json
import io
try:
    to_unicode = unicode
except NameError:
    to_unicode = str
filename = open('./test.json','w')

finaljson = []
for k in range(200):
    url = 'https://api.cognitive.microsoft.com/bing/v7.0/news/search?q=bitcoin&count='+str((k+1)*(30000))+'&offset='+str((k))+'&mkt=en-us&safeSearch=Strict'
    print url
    headers = {'Ocp-Apim-Subscription-Key': 'da83d66655fb44698a3cbd49a487df69'}
    r = requests.get(url, headers=headers)
    data = r.json()
    for i in range(40):
        try:
            print data['value'][i]['name']
            title = data['value'][i]['name']
            descript = data['value'][i]['description']
            datePublished = data['value'][i]['datePublished']
            finaljson.append({'title': title, 'description': descript, 'date': datePublished})
        except IndexError:
            break
filename.write(to_unicode(json.dumps(finaljson,indent=4, sort_keys=True,separators=(',', ': '))))

