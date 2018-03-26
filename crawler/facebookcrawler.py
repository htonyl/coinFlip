#coding=utf-8

import json
import requests
from bs4 import BeautifulSoup
import lxml
import facebook

# uri = "https://graph.facebook.com/v2.11/BitcoinMasterNews/posts?pretty=0&limit=25&until=1499168000&access_token=EAACEdEose0cBAOmY90BfIcZA3BI4v4kfzIMhTA0xhvalo2QmmEnmqnPewf7x7mcIk8djlyEqITsh5lhrQ7hEZAabEUnjzdOd7UuDL9QLinZBiqbCFDzBAVJConIXBgU5Sv7DpyM5cekVIq7eRaWTnKKljqROogFRU7ZANX6aKux5oQZBl5ZC93FTxFyzZC58X3iY2nJeZBH0vtfXfWF4pqvt"
# res = requests.get(uri)
# print(res.text)
token = "EAAFebFxUtgYBACDvEfnxpB9VeiCsZBdcChdnxZCGVNozjhGd8DFf6iybXZAzpJaHIZBJSrDsB8ETLlqqYAHgH9fiQUUAJZBA47ZAH99r8nuB71Hm2ZCsgZAyD5QZAvNgfZArslm0vCsJq6Iu4MDb4ZClg3JhmuykPKyAHE5frSgWLVHqrHs8MexbymvH5ajWnpzWYAZD"
graph = facebook.GraphAPI(access_token=token, version="2.7")


profile = graph.get_object("me")
print(profile)
#page = graph.request(type = 'page', q = 'BitcoinMasterNews')

# print(page)

news_file = open("facebookdata.json", "w")
todumps = []

#送出GET請求到遠端伺服器，伺服器接受請求後回傳<Response [200]>，代表請求成功
res = graph.request("/BitcoinMasterNews/posts?pretty=0&limit=100&until=1515168000")

for i in range(0, 7):
    #print(res)
    todumps.append(res['data'])
    if 'paging' in res:
        id = res['paging']['cursors']['after']
        print(id)
        res = graph.request("/BitcoinMasterNews/posts?pretty=0&limit=100&after=" + id) 
    else:
        print(res)
# print(todumps)
json.dump(todumps, news_file)