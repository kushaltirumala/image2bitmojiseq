from flask import Flask, render_template, make_response, request, redirect, url_for
import os
import uuid

app = Flask(__name__)


port = int(os.getenv('PORT', 5000))

@app.route('/')
def index():
	user_id = str(uuid.uuid4())
	resp = make_response(render_template('index.html'))
	resp.set_cookie('user_id', user_id)
	return resp

@app.route("/ml", methods=['GET', 'POST'])
def start_game():
	# if request.method == 'POST':
	# 	print "hi"
 #    	file = request.files['file']
 #        file.save(os.path.join("images", file.filename))
 #        return redirect(url_for('ml'))
 #    else:
	# 	return render_template('ml.html')
	if request.method == 'POST':
		print "hi"
		file = request.files['file']
		filepath = "static/images/"+file.filename 
		file.save(filepath)
		print(filepath)
		return render_template('ml.html', filepath=filepath)
	else:
		return render_template('ml.html')

if __name__ == '__main__':
   	app.run(port=port, debug = False)