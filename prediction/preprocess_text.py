import json, re, datetime
from functools import reduce
from collections import defaultdict
from gensim import corpora, models, similarities
from gensim.parsing.preprocessing import STOPWORDS
from utils import *

def get_time(d, d_format):
    return datetime.datetime.strptime(d, d_format)

def read_json(fname, d_format='%Y-%m-%d %H:%M:%S'):
    with open(fname, 'r') as f:
        lines = [l.strip('\n') for l in f.readlines()]
        data = json.loads("".join(lines))
        for doc in data:
            doc['time'] = get_time(doc['time'], d_format)
        return data

def get_y_labels(data, hist_diff):
    y_label = []
    for idx, doc in enumerate(data):
        tdays = (doc['time'] - OLDEST_TIME).days
        label = [hist_diff[tdays+i] for i in range(0, 7) if len(hist_diff) > tdays + i]
        # Prepend extra info and pad with ones
        label = [tdays] + label + [1]*(7 - len(label))
        y_label.append(label)
    return y_label

## Read bitcoin price data
# hist: a list of 2-tuples(date, price) sorted by date
# the first element is the oldest price record
print("Load price...")
with open('data/btc_history.csv', 'r') as f:
    date_format = '%d/%m/%Y %H:%M'
    hist = []
    for l in f.readlines():
        tmp = l.strip().split(',')
        hist.append((get_time(tmp[0], date_format), float(tmp[1])))
hist = sorted(hist, key=lambda x: x[0])

## Fill in missing data in hist (linear approximation)
for i in range(0, len(hist)-1):
    tdays = (hist[i+1][0] - hist[i][0])
    if tdays.days > 1:
        next_price = hist[i+1][1]
        for d in range(1, tdays.days):
            hist.append((hist[i][0]+datetime.timedelta(d), hist[i][1] + (next_price - hist[i][1])/tdays.days*d))
hist = sorted(hist, key=lambda x: x[0])

# hist_diff: a list of price differences
# hist_diff[k] = hist[k+1]/hist[k], the price increase/decrease of day k+1
hist_diff = list(map(lambda x: hist[x+1][1]/hist[x][1], range(0, len(hist)-1)))

## Slice useful dates from the oldest time
print("Extract price data from {}".format(OLDEST_TIME.strftime('%Y-%m-%d')))
starting_idx = (OLDEST_TIME - hist[0][0]).days
hist_processed = hist[starting_idx:]
hist_diff_processed = hist_diff[starting_idx:]

## Read text data and append label
print("Load text files...")
docs, texts, labels = {}, {}, {}

data = read_json('data/bitcointickerdata.json')
docs['btck'] = [doc['title'] for doc in data]
texts['btck'], _ = extract_text_n_corpus(docs['btck'])
labels['btck'] = get_y_labels(data, hist_diff_processed)
print("Load text files...")

data = read_json('data/redditdata.json')
docs['red'] = [doc['title']+doc['content']['text'] for doc in data]
texts['red'], _ = extract_text_n_corpus(docs['red'])
labels['red'] = get_y_labels(data, hist_diff_processed)
print("Load text files...")

data = read_json('data/reddit_crawled.json')
docs['red_big'] = [doc['title'] for doc in data]
texts['red_big'], _ = extract_text_n_corpus(docs['red_big'])
labels['red_big'] = get_y_labels(data, hist_diff_processed)
print("Load text files...")

data = read_json('data/clean_insiderdata.json', d_format='%Y-%m-%dT%H:%M:%SZ')
docs['insider'] = [doc['description'] for doc in data]
texts['insider'], _ = extract_text_n_corpus(docs['insider'])
labels['insider'] = get_y_labels(data, hist_diff_processed)
print("Load text files...")

## Aggregate texts and labels
# docs: ['The Biggest Heist Possibly EVER is Happening NOW! : CryptoCurrency',
# 'Goldman Sachs lost $1.9 Billion in the last 3 months' ... ]
# texts: processed docs (lowercase, split, stripped stop word)
docs_flat = np.array(reduce(lambda c, v: c+v, docs.values()))
texts_flat = np.array(reduce(lambda c, v: c+v, texts.values()))
labels_flat = np.array(reduce(lambda c, v: c+v, labels.values()))

## Generate dictionary model and word vector model
print("Generate dictionary and word vector models...")
dictionary = corpora.Dictionary(texts_flat)
dict_doc2idx = [dictionary.doc2idx(text) for text in texts_flat]
word2vec = models.Word2Vec(texts_flat, size=400, window=5, min_count=5, workers=4)

## Save models
print("Save models to saved/")
fname_dict = 'saved/model_dict.pkl'
dictionary.save(fname_dict)
fname_w2v = 'saved/model_word2vec.pkl'
word2vec.save(fname_w2v)

## Load models and verify
verify_dictionary = corpora.Dictionary.load(fname_dict)
verify_w2v = models.Word2Vec.load(fname_w2v)
