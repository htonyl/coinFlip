# CoinFlip

A bitcoin price predictor at Microsoft Imagine Cup 2018. 

### Technology

- Web Server: Node.js, React.js, 
- Database: Firebase
- ChatBot: Microsoft Azure **LUIS**
- Machine Learning: Keras, Gensim

### Motivation

For all current online services for cryptocurrency transaction, they lack **useful information** for users to understand the true mechanism behind cryptocurrency. 
Therefore, we analyze three crucial statistics in our services
- Recent News, e.g., Business Insider, Bitcoin Ticker
- Community activities, e.g., Reddit, Facebook posts
- Github activities, e.g., significant pushes

and provide price prediction based on the sentiment analysis. 

In addition to price prediction, we utilized the **Bot services** and **LUIS** API in Azure platform to provide another means of accessing information from our platform and thus enhance our user experience.

## Get Started

To start the API server for prediction:
```
# Go to server directory and install all dependencies
cd server
npm install

# Start the server!
node index.js
```

Now, we start the client-side for displaying the platform:
```
# Go to client directory and install all dependencies
cd client
npm install

# Start react server!
npm start
```

You can see the app running at `localhost:3000`!

## Train the model

You might wanna dig deeper into our prediction model. Check out the scripts for learning in `prediction`. 
We have provided the crawled data from **Redit, Facebook, InsiderNews and other news sources** in `prediction/data`. 
Simply run:
```
python train_w2v.py
```
to run the model training script.
The training process includes the following:

- Load news/comments from `prediction/data`
- Label the documents with the daily increase/decrease in Bitcoin price of that day
- Train a **word2vec** model using all documents
- Transform each document into arrays of word vectors
- Train a **1D Convolutional Neural Network** using the sequences of word vectors
- Validate the model by **Walk-forward validation**

Note that we use walk-forward validation (backtesting) to check the validity of our prediction since Bitcoin price is a time series data, i.e., we select one day in the past as our point of interest and train the network using all data before that day, and validate the model by predicting the price of next day. 

We have achieved error rate below **6%** after validation. 

