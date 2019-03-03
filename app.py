from flask import Flask, render_template, make_response, request, redirect, url_for
import os
import uuid
import pandas as pd
import tensorflow as tf
from image_captioning.config import Config
from image_captioning.model import CaptionGenerator
from image_captioning.dataset import prepare_train_data, prepare_eval_data, prepare_test_data
import shutil

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


	
		return render_template('ml.html', filepath=filepath, caption=caption)
	else:
		return render_template('ml.html')

if __name__ == '__main__':
   	app.run(port=port, debug = False)