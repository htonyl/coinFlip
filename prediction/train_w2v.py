from keras import backend as K
from keras.datasets import imdb
from keras.models import Sequential, model_from_json, load_model
from keras.layers import Dense, Activation, LSTM, Convolution1D, Flatten, Dropout
from keras.layers.embeddings import Embedding
from keras.preprocessing import sequence, text
from keras.callbacks import TensorBoard
from sklearn.model_selection import train_test_split, KFold
from utils import *

import pandas as pd
import numpy as np
import pickle, h5py

from preprocess_text import *

## Load training data
print("Load dataset...")
X, invalid = texts_to_word_vec(word2vec, texts_flat)
y = np.array(labels_flat)

invalid = invalid + np.where(y[:,0] > len(hist_diff_processed))[0].tolist()
# Clear invalid rows, e.g., empty text
X = np.delete(X, invalid, axis=0)
y = np.delete(y, invalid, axis=0)
print("Shapes of X / y: {} / {}".format(X.shape, y.shape))

## Define model
# Convolutional model (3x conv, flatten, 2x dense)
print("Define model...")
model = Sequential()
model.add(Convolution1D(128, WINDOW_SIZE, padding='same', input_shape=(X.shape[1], X.shape[2])))
model.add(Convolution1D(64, 4, padding='same'))
model.add(Convolution1D(32, 4, padding='same'))
model.add(Convolution1D(16, 4, padding='same'))
model.add(Convolution1D(16, 4, padding='same'))
model.add(Flatten())
# Defines fraction of input units to drop
model.add(Dropout(0.2))
model.add(Dense(180,activation='tanh'))
model.add(Dropout(0.2))
model.add(Dense(90,activation='tanh'))
model.add(Dense(7,activation='linear'))
print("Model: "); model.summary()

model.compile(loss='mse', optimizer='adam')

print("Fit model...")

def print_hist(h):
    return "{}[${:.2f}]".format(h[0].strftime('%Y-%m-%d'), h[1])

init_weight = model.get_weights()

## Train model with Walk-forward validation
wfv_window = 8
latest_news_date = y[:,0].max()
print("Walk-forward validation starts: ")
print("\tWindow = {}".format(wfv_window))
print("\tStart Date = {}".format(hist[-1][0]))
print("\tTotal folds = {}".format(len(hist)//wfv_window))

for i in range(1, len(hist)//wfv_window + 1):
    split_date = int(latest_news_date - i * wfv_window)

    # Extract training set
    train_idx = np.where(y[:,0] < split_date)
    X_train, y_train = X[train_idx], y[train_idx, 1:].reshape(-1, 7)

    # Reinitialize weight
    model.set_weights(init_weight)
    if (model.get_weights()[0] != init_weight[0]).all():
        print("NOT INIT!")

    # Fit model
    model.fit(X_train, y_train, epochs=3, callbacks=[], batch_size=64)

    # Define validation metrics
    scores, pred, loss = np.empty((7)), np.empty((7, 7)), np.empty((7, 7))
    correct_trend = np.empty((7, 7), dtype=np.int8)
    for d in range(0, 7):
        val_idx = np.where(y[:,0] == split_date + d)
        X_val, y_val = X[val_idx], y[val_idx, 1:].reshape(-1, 7)
        # Calculate validation score
        scores[d] = model.evaluate(X_val, y_val, verbose=0)
        # Predict future prices in a week
        pred[d] = model.predict(X_val).mean(axis=0)
        # Calculate errors in prediction
        loss[d] = pred[d] - y_val[0]
        # Calculate # of positive trends
        correct_trend[d] = np.logical_xor(pred[d] > 1, y_val[0] < 1)
    print("Walk-forward Validation at {}({}) Err (mean_score/max/min/correct_trend): {:.6f} {:.6f} {:.6f} {}"
            .format(print_hist(hist_processed[split_date]),
                split_date, scores.mean(), loss.max(), loss.min(), list(correct_trend.sum(axis=0))))
    print("\tErrors (first days): {}".format(" ".join(["{:.4f}".format(l) for l in loss[:,0]])))
    print("\tAbsolute errors (avg by day): {}".format(" ".join(["{:.4f}".format(l) for l in abs(loss).mean(axis=0)])))

## Save model
fname_model, fname_weights, fname_weights_h5 = "saved/model_json_week.pkl", "saved/model_weights_week.pkl", 'saved/model_weights_week.h5'
print("Persist model to saved/ ...")
model_json = model.to_json()
model_weights = model.get_weights()
pickle.dump(model_json, open(fname_model, 'wb'))
pickle.dump(model_weights, open(fname_weights, 'wb'))
model.save(fname_weights_h5)

## Test Loading Persisted Model
print("Verify persisted model...")
verify_weights = pickle.load(open(fname_weights, 'rb'))
verify_model_json = pickle.load(open(fname_model, 'rb'))
verify_model = model_from_json(verify_model_json)
print("\tv: Model loaded successfully!")
# verify_model.set_weights(verify_weights)
varify_model = load_model
verify_pred = verify_model.predict(X_test)
pred = model.predict(X_test)
print("\tv: Original model prediction: {}".format(pred))
print("\tv: Persisted model prediction: {}".format(verify_pred))
print("\tv: Model predictions consistent: {}".format(pred == verify_pred))
