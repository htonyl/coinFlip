from keras.datasets import imdb
from keras.models import Sequential, model_from_json
from keras.layers import Dense, Activation, LSTM, Convolution1D, Flatten, Dropout
from keras.layers.embeddings import Embedding
from keras.preprocessing import sequence, text
from keras.callbacks import TensorBoard
from sklearn.model_selection import train_test_split, KFold

import pandas as pd
import numpy as np
import pickle
from label_data import *

# define the model
print("Load dataset...")
dict_size, embedding_size, max_gram_len = len(dictionary.token2id), 500, 360

# Pad the sequence to the same length
X = np.array(sequence.pad_sequences(dict_doc2idx, maxlen=max_gram_len, padding='post'))
Y = np.array(y_labels)
X_train, X_test, y_train, y_test = train_test_split(X, Y, test_size=0.2, random_state=12345)

## Convolutional model (3x conv, flatten, 2x dense)
print("Define model...")
model = Sequential()
model.add(Embedding(dict_size, embedding_size, input_length=max_gram_len))
model.add(Convolution1D(64, 3, padding='same'))
model.add(Convolution1D(32, 3, padding='same'))
model.add(Convolution1D(16, 3, padding='same'))
model.add(Flatten())
# Defines fraction of input units to drop
model.add(Dropout(0.2))
model.add(Dense(180,activation='tanh'))
model.add(Dropout(0.2))
model.add(Dense(7,activation='linear'))

print("Fit model...")
model.compile(loss='mse', optimizer='adam')
kfold = KFold(n_splits=3, shuffle=True)
# Loop through the indices the split() method returns
for fold, (train_idx, val_idx) in enumerate(kfold.split(X_train, y_train)):
    x, y, x_, y_ = X_train[train_idx], y_train[train_idx], X_train[val_idx], y_train[val_idx]
    model.fit(x, y, epochs=1, callbacks=[], batch_size=64)
    scores = model.evaluate(x_, y_, verbose=0)
    print("Cross validation {}/{} loss: {}".format(fold, kfold.get_n_splits(), scores))

scores = model.evaluate(X_test, y_test, verbose=0)
print("Test loss: {}".format(scores))

fname_model, fname_weights = "saved/model_json_week.pkl", "saved/model_weights_week.pkl"
print("Persist model to saved/ ...")
model_json = model.to_json()
model_weights = model.get_weights()
pickle.dump(model_json, open(fname_model, 'wb'))
pickle.dump(model_weights, open(fname_weights, 'wb'))

## Test Loading Persisted Model
print("Verify persisted model...")
verify_weights = pickle.load(open(fname_weights, 'rb'))
verify_model_json = pickle.load(open(fname_model, 'rb'))
verify_model = model_from_json(verify_model_json)
print("\tv: Model loaded successfully!")
verify_model.set_weights(verify_weights)
verify_pred = verify_model.predict(X_test)
pred = model.predict(X_test)
print("\tv: Original model prediction: {}".format(pred))
print("\tv: Persisted model prediction: {}".format(verify_pred))
print("\tv: Model predictions consistent: {}".format(pred == verify_pred))
