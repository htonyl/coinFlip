from newsapi import NewsApiClient
import json
newsapi = NewsApiClient(api_key='a6afd43cd995447c8f172fa3a4ed0c43')
print '['
for i in range(1, 475):
    all_articles = newsapi.get_everything(q='bitcoin',
                                        from_parameter='2015-01-01',
                                        language='en',
                                        page_size=100,
                                        sort_by='publishedAt',
                                        page=i)
    try:
        for article in all_articles['articles']:
            description = article['description']
            time = article['publishedAt']
            source = article['source']['name']
            json_data = json.dumps({'description': description, 'time':time, 'source':source})
            if source != 'Python.org' and source != 'Hvper.com':
                print json_data+','
    except KeyError as error:
        pass
for k in range(i, 391):
    all_articles = newsapi.get_everything(q='cryptocurrency',
                                        from_parameter='2015-01-01',
                                        language='en',
                                        page_size=100,
                                        sort_by='publishedAt',
                                        page=k)       
    try:
        for article in all_articles['articles']:
            description = article['description']
            time = article['publishedAt']
            source = article['source']['name']
            json_data = json.dumps({'description': description, 'time':time, 'source':source})
            if source != 'Python.org' and source != 'Hvper.com':
                print json_data+','
    except KeyError as error:
        pass
print ']'
