#coding=utf-8

import twitter
import json

api = twitter.Api(consumer_key='h1dnJa605AGCoGj2y7DUxBm5w',
                    consumer_secret='rrUXU0EBd26tV0x1SSSakTUoh77wkN0sGpbF1Qghp4lW6hNqUf',
                    access_token_key='324211117-oinlwy41d5hqE3e3ewO99imSmEd7rOcsnSGSqQ4W',
                    access_token_secret='rb7BedgAteM4UGDlUcISBTVkWJTNleNKFA2F2pjr48g9L')

results = api.GetSearch(raw_query="q=bitcoin&count=100&result_type=popular")
print(results)
print(dir(results))
print(results.index)
print(type(results))
json_string = json.dumps(results)