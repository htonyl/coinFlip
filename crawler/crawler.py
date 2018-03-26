#coding=utf-8

import requests
import time
from bs4 import BeautifulSoup
import lxml

print("fetching in 5")
time.sleep(1)
print("fetching in 4")
time.sleep(1)
print("fetching in 3")
time.sleep(1)
print("fetching in 2")
time.sleep(1)
print("fetching in 1")
time.sleep(1)
print("fetching...")
#送出GET請求到遠端伺服器，伺服器接受請求後回傳<Response [200]>，代表請求成功
res = requests.get("https://www.reddit.com/r/Bitcoin/")

#經過BeautifulSoup內lxml編輯器解析的結果
soup = BeautifulSoup(res.text,'lxml')

print("fetched reddit list")

for a_tag in soup.find_all('a', class_='title may-blank '):
    print("entered loop")
    href = 'http://www.reddit.com' + a_tag.get('href')
    print(href)
    print("fetching subreddit in 5")
    time.sleep(1)
    print("fetching subreddit in 4")
    time.sleep(1)
    print("fetching subreddit in 3")
    time.sleep(1)
    print("fetching subreddit in 2")
    time.sleep(1)
    print("fetching subreddit in 1")
    time.sleep(1)
    print("fetching subreddit...")
    child = requests.get(href)
    child_soup = BeautifulSoup(child.text,'lxml')
    div_find = child_soup.find('div', class_='entry unvoted')
    print(div_find.text)