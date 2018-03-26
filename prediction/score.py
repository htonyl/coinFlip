from azureml.api.schema.dataTypes import DataTypes
from azureml.api.schema.sampleDefinition import SampleDefinition
from azureml.api.realtime.services import generate_schema

from azureml.datacollector import ModelDataCollector

def init():
    from utils import *
    global model, inputs_dc, prediction_dc
    model = load_model('saved/model_json_week.h5')
    word2vec = models.Word2Vec.load(saved_path + 'model_word2vec.pkl')
    X, invalid_rows = texts_to_word_vec(word2vec, texts)
    inputs_dc = ModelDataCollector('model.pkl',identifier="inputs")
    prediction_dc = ModelDataCollector('model.pkl', identifier="prediction")
init()
