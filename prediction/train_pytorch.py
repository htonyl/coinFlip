import collections
import torch
import torch.nn as nn
import torch.nn.functional as F
import torch.optim as optim
from torch.autograd import Variable

from gensim import models

import pandas as pd
import numpy as np
import pickle, h5py

from sklearn.model_selection import train_test_split, KFold
from preprocess_text import *
from utils import *
CUDA_ENABLED = False

class Model(nn.Module):
    def __init__(self):
        super(Model, self).__init__()
        
        conv = collections.OrderedDict()
        conv["conv1"] = nn.Conv1d(128, 128, WINDOW_SIZE)
        conv["conv2"] = nn.Conv1d(128, 64, 4)
        conv["conv3"] = nn.Conv1d(64, 32, 4)
        conv["conv4"] = nn.Conv1d(32, 16, 4)
        conv["conv5"] = nn.Conv1d(16, 16, 4)
        conv["conv5"] = nn.Conv1d(16, 8, 4)
        self.conv = nn.Sequential(conv)

        fcn = collections.OrderedDict()
        fcn["dp1"] = nn.Dropout(p=0.7)
        fcn["fcn1"] = nn.Linear(3088, 400)
        fcn["act1"] = nn.Tanh()
        fcn["dp2"] = nn.Dropout(p=0.7)
        fcn["fcn2"] = nn.Linear(400, 7)
        self.fcn = nn.Sequential(fcn)

    def forward(self, x):
        x = self.conv(x)
        x = x.view(x.size(0), -1)
        x = self.fcn(x)
        return x

class Network():
    def __init__(self):
        self.model = Model()
        #self.loss_fcn = nn.MSELoss
        self.loss_fcn = F.mse_loss
        self.optimizer = optim.SGD(self.model.parameters(), lr=0.001, momentum=0.8)
        print(self.model)

    def train(self, X, y):
        self.model.train()
        X, y = torch.from_numpy(X).float(), torch.from_numpy(y).float()
        if CUDA_ENABLED:
            X, y = X.cuda(), y.cuda()
        X, y = Variable(X), Variable(y)
    
        output = self.model(X)
        loss = self.loss_fcn(output, y)
    
        self.optimizer.zero_grad()
        loss.backward()
        self.optimizer.step()
        return loss.data.item()

    def test(self, X, y):
        self.model.eval()
        X, y = torch.from_numpy(X).float(), torch.from_numpy(y).float()
        if CUDA_ENABLED:
            X, y = X.cuda(), y.cuda()
        X, y = Variable(X), Variable(y)
        
        output = self.model(X)
        loss = self.loss_fcn(output, y)
        return loss.data.item(), output

def iterate_data(X, y, batch_size=300):
    it, i = [], 0
    while i + 300 < len(X):
        it.append((X[i:i+300], y[i:i+300]))
        i+=300
    it.append((X[i:], y[i:]))
    return it

## Load training data
print("## Load dataset...")
# texts_flat = np.load('saved/data.texts_flat.npy')
# labels_flat = np.load('saved/data.labels_flat.npy')
# word2vec = models.Word2Vec.load('saved/model.word2vec.pkl')

X, invalid = texts_to_word_vec(word2vec, texts_flat)
y = np.array(labels_flat)

# Clear invalid rows, e.g., empty text
print("## Clean invalid rows...")
invalid = invalid + np.where(y[:,0] > len(hist_diff_processed))[0].tolist()
X = np.delete(X, invalid, axis=0)
y = np.delete(y, invalid, axis=0)
print("Shapes of X / y: {} / {}".format(X.shape, y.shape))

## Define model
# Convolutional model (3x conv, flatten, 2x dense)
print("## Define model...")
net = Network()

print("## Fit model...")

def print_hist(h):
    return "{}[${:.2f}]".format(h[0].strftime('%Y-%m-%d'), h[1])

## Train model with Walk-forward validation
N_EPOCHS = 3
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
    # model.set_weights(init_weight)

    # Fit model
    i=0
    for epoch in range(N_EPOCHS):
        for _x, _y in iterate_data(X_train, y_train, batch_size=300):
            print("{}/{}".format(i, len(X_train)))
            loss = net.train(_x, _y)
            i+=300
        print("Epoch {}: {}".format(epoch, loss))

    # Define validation metrics
    scores, pred, loss = np.empty((7)), np.empty((7, 7)), np.empty((7, 7))
    correct_trend = np.empty((7, 7), dtype=np.int8)
    for d in range(0, 7):
        val_idx = np.where(y[:,0] == split_date + d)
        X_val, y_val = X[val_idx], y[val_idx, 1:].reshape(-1, 7)

        # Calculate validation score
        scores[d], pred_all = net.test(X_val, y_val)
        # Predict future prices in a week
        pred[d] = pred_all.mean(axis=0)
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
