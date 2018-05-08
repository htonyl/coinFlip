from __future__ import print_function
import json, re, datetime
import numpy as np
from gensim.parsing.preprocessing import STOPWORDS
from collections import defaultdict
from gensim import corpora, models, similarities
from time import gmtime, strftime

OLDEST_TIME = datetime.datetime(2015, 1, 1, 0, 0)
INPUT_DIM = 128
WINDOW_SIZE = 3
def extract_text_n_corpus(docs, remove_uniq=True):
    stoplist = set('bitcoin bitcoins s m d t u ll ur ve'.split())
    texts = [[word for word in re.split("\W+", re.sub(r"[,.]", "", doc.lower()))
            if word not in STOPWORDS.union(stoplist) and word is not ""] for doc in docs]
    frequency = defaultdict(int)
    for text in texts:
        for token in text:
            frequency[token] += 1

    if remove_uniq:
        # Remove all empty strings
        frequency[''] = 0
        # Extract only duplicate words
        texts = [[token for token in text if frequency[token] > 1] for text in texts]

    dictionary = corpora.Dictionary(texts)
    corpus = [dictionary.doc2bow(text) for text in texts]
    corpora.MmCorpus.serialize('/tmp/deerwester.mm', corpus)
    return texts, corpus

def texts_to_word_vec(word2vec, texts):
    invalid_rows = []
    w2v_matrix = np.zeros((len(texts), INPUT_DIM, word2vec.vector_size))
    for idx, text in enumerate(texts):
        _text = [word2vec.wv[w] for w in text if w in word2vec.wv]
        if len(_text) > WINDOW_SIZE:
            in_len = min([INPUT_DIM, len(_text)])
            w2v_matrix[idx][:in_len] = np.array(_text)[:in_len]
        else:
            invalid_rows.append(idx)
    return w2v_matrix, invalid_rows

try:
    import __builtin__
except ImportError:
    # Python 3
    import builtins as __builtin__

def print(*args, **kwargs):
    """My custom print() function."""
    # Adding new arguments to the print function signature
    # is probably a bad idea.
    # Instead consider testing if custom argument keywords
    # are present in kwargs
    time = strftime("%m/%d-%H:%M:%S", gmtime())
    if 'builtin' in kwargs:
        if kwargs['builtin']:
            return __builtin__.print(*args)
    return __builtin__.print("{} |- [INFO] {}".format(time, args[0]), **kwargs)
