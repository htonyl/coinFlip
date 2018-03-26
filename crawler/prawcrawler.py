#coding=utf-8

import praw
import datetime
import json

reddit = praw.Reddit(client_id = 'R7yjBNINrbWdPA',
client_secret = 'IFSKrjFBNjyru1fv4yXfenyBTSc',
username = 'the3dsandwich',
password = 'AbCdEfGh3.14',
user_agent = 'prawcrawler')

subreddit = reddit.subreddit('Bitcoin')

reddit_data = open("test_redditdata_withlink.json", "w")

todumps = []

for i in range(0, 10000):

    print("retrieving for the {}th time:".format(i))

    new_python = subreddit.submissions(1516930439-(i+1)*360, 1516930439-i*360)

    for submission in new_python:
        if not submission.stickied:
            todump = {
                'time': str(datetime.datetime.fromtimestamp(submission.created)),
                'title': submission.title,
                'link': {'url': submission.url, 'permalink': submission.permalink},
                'content': {
                    'ups': submission.ups,
                    'downs': submission.downs,
                    'selftext': submission.selftext,
                    'view_count': submission.view_count,
                    'likes': submission.likes},
                'comments': []
            }
            submission.comments.replace_more(limit=0)
            for comment in submission.comments.list():
                todump["comments"].append({
                    'ups': comment.ups,
                    'downs': comment.downs,
                    'body': comment.body,
                    'likes': comment.likes})
            #print(todump)
            todumps.append(todump)
    for idx, d in enumerate(todumps):
        print("No. {:04d}  {}  -- # comments/words/ups/downs:  {}\t{}\t{}\t{}\t\"{}\"".format(idx, d["time"], len(d["comments"]), len(d["content"]["selftext"]), d["content"]["ups"], d["content"]["downs"], d["title"] ))
    # print(todumps)
json.dump(todumps, reddit_data)
