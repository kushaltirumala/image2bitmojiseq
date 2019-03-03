from flask import Flask, render_template, make_response, request, redirect, url_for
import os
import uuid
import pandas as pd
import tensorflow as tf
from image_captioning.config import Config
from image_captioning.model import CaptionGenerator
from image_captioning.dataset import prepare_train_data, prepare_eval_data, prepare_test_data
import shutil
import pickle
import nltk
import numpy as np

app = Flask(__name__)

port = int(os.getenv('PORT', 5000))

config = Config()
config.phase = 'test'
config.train_cnn = False
config.beam_size = 3
sess = tf.Session()
print("starting to create captions")
# data, vocabulary = prepare_test_data(config)
model = CaptionGenerator(config)
model.load(sess, './image_captioning/models/289999.npy')
tf.get_default_graph().finalize()






# --------- BITMOJI MATCHING ------------------

print("starting bitmoji matching")

with open('mlml/data/train_data_python2.7', 'rb') as f:
    data = pickle.load(f)

bitmoji_num = "289604503_9-s4"
new_data = {}

for k,v in data.items():
    s_occurences = k.count("%s")
    replacement = tuple(bitmoji_num for i in range(s_occurences))
    new_k = str(k) % replacement
    new_data[new_k] = v

inv_data = {}
index_dic = {}

i = 0
for k, v in new_data.items():
    for word in v:
        inv_data[word] = k
    index_dic[k] = i 
    i += 1 

inv_index_dic = {}
for k,v in index_dic.items():
    inv_index_dic[v] = k

def match_phrase(s, max_num=5):
    words = nltk.word_tokenize(s)
    scores = np.array([0 for i in range(len(index_dic))])
    for word in words:
#         if word in inv_data:
#             scores[index_dic[inv_data[word]]] += 1
        for k, v in inv_data.items():
            if (k == word) or (k == word + "*"):
#                 print("here")
#                 print(index_dic[inv_data[k]])
                scores[index_dic[inv_data[k]]] += 1
            
    
    most_related_emoji_indices = scores.argsort()[-max_num:][::-1]
    
    num_matches = np.count_nonzero(scores)
    
    if num_matches < max_num:
        most_related_emoji_indices = most_related_emoji_indices[:num_matches]
    
    ans = [inv_index_dic[i] for i in most_related_emoji_indices]
    
    return ans, scores

# --------- END BITMOJI MATCHING --------------

@app.route('/')
def index():
	user_id = str(uuid.uuid4())
	resp = make_response(render_template('index.html'))
	resp.set_cookie('user_id', user_id)
	return resp

@app.route("/ml", methods=['GET', 'POST'])
def start_game():
	if request.method == 'POST':
		print "hi"
		file = request.files['file']
		filepath = "static/images/"+file.filename 
		file.save(filepath)
		print(filepath)
		# get_caption()
		# ;lkj
		data, vocabulary = prepare_test_data(config)
		scores, captions = model.test(sess, data, vocabulary)
		print("done creating captions")




		# load the caption
		df = pd.read_csv("static/results.csv")
		caption = df['caption'][len(df)-1]

		# remove used images
		for root, dirs, files in os.walk('static/images'):
		    for f in files:
		        os.unlink(os.path.join(root, f))
		    for d in dirs:
		        shutil.rmtree(os.path.join(root, d))

		os.remove("static/results.csv")

		links = match_phrase(caption)
	
		return render_template('ml.html', filepath=filepath, caption=caption)
	else:
		return render_template('ml.html')

if __name__ == '__main__':
   	app.run(port=port, debug = False)