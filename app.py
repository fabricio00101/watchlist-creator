from flask import Flask, render_template, send_from_directory, jsonify, request

app = Flask(__name__, static_folder='static', template_folder='.')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/<path:filename>')
def static_files(filename):
    return send_from_directory('.', filename)

db ={"watchlists": []}
next_list_id = 1

@app.route('/api/lists', methods=['GET'])
def get_lists():
    return jsonify(db["watchlists"])

@app.route('/api/lists', methods=['POST'])
def create_list():
    global next_list_id

    data = request.get_json()

    new_list = {
        "id": next_list_id,
        "name": data["name"],
        "movies": []
    }

    db["watchlists"].append(new_list)
    next_list_id += 1

    return jsonify(new_list), 201

@app.route('/api/lists/movies', methods=['POST'])
def add_movie_to_list():
    data = request.get_json()  
    # {"listId": 1, "movieData": {...}}

    list_id = data["listId"]
    movie_data = data["movieData"]

    target_list = None
    for lst in db['watchlists']:
        if lst["id"] == list_id:
            target_list = lst
            break

    if target_list is None:
        return jsonify({"error": "Lista no encontrada"}), 404  
    
    movie_exists = False
    for movie in target_list["movies"]:
        if movie ["id"] == movie_data["id"]:
            movie_exists = True
            break

    if movie_exists:
        return jsonify({"error": "La película ya está en la lista"}), 409
    target_list["movies"].append(movie_data)
    return jsonify(movie_data), 201

@app.route('/api/lists/<int:list_id>', methods=['DELETE'])
def delete_list(list_id):

    target_list = None
    for lst in db["watchlists"]:
        if lst ["id"] == list_id:
            target_list = lst
            break

    if target_list is None:
        return jsonify({"error": "Lista no encontrada"}), 404

    db["watchlists"].remove(target_list)

    return jsonify({"message": "Lista eliminada"}), 200   




if __name__ == '__main__':
    app.run(debug=True)

