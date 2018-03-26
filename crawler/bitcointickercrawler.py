#coding=utf-8

import json
import requests
from bs4 import BeautifulSoup
import lxml

todumps = []
news_file = open("bitcointickerdata.json", "w")

for i in range(0,340):
    href = "https://bitcointicker.co/news/loadnews.php?start=" + str(50*i)
    #送出GET請求到遠端伺服器，伺服器接受請求後回傳<Response [200]>，代表請求成功
    res = requests.get(href)
    #經過BeautifulSoup內lxml編輯器解析的結果
    soup = BeautifulSoup(res.text,'lxml')
    print("fetched data for the {}th time".format(i))
    
    for item in soup.find_all('div', id='item'):
        time = item.find('span', style='color:white;margin-right:5px;')
        href = item.find('a')
        title = item.find('div', style='overflow:hidden;')
        todumps.append({'time': time.text,
            'href': href.get('href'),
            'title': title.text})
    
print(todumps)
json.dump(todumps, news_file)