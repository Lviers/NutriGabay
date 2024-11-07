from flask import Flask, render_template, request, redirect, url_for, flash
import sqlite3

app = Flask(__name__)

app.secret_key = '123'

# Function to get a database connection with a timeout to avoid locking
def get_db_connection():
    conn = sqlite3.connect('nutri.db', timeout=10)  # Connect to your nutri.db with a timeout
    conn.row_factory = sqlite3.Row  # This allows us to access columns by name
    return conn

# Define a route for the admin dashboard
@app.route('/')
def admin_dashboard():
    return render_template('main.html')

# Route to manage existing foods
@app.route('/food', methods=['GET'])
def manage_food():
    with get_db_connection() as conn:
        foods = conn.execute('SELECT * FROM foods').fetchall()
    return render_template('food.html', foods=foods)

# Route to add new food separately
@app.route('/food/add', methods=['GET', 'POST'])
def add_food():
    if request.method == 'POST':
        food_name = request.form.get('food_name')
        food_type = request.form.get('type')
        carbs = request.form.get('carbs')
        protein = request.form.get('protein')
        fats = request.form.get('fats')
        calorie = request.form.get('calorie')
        grams = request.form.get('grams')
        meal_type = request.form.get('meal_type')
        category = request.form.get('category')

        # Ensure all fields are filled out
        if not food_name or not food_type or not carbs or not protein or not fats or not calorie or not grams or not meal_type or not category:
            flash('Please fill out all fields.')
            return redirect(url_for('add_food'))

        with get_db_connection() as conn:
            conn.execute('INSERT INTO foods (food_name, type, carbs, protein, fats, calorie, grams, meal_type, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                         (food_name, food_type, carbs, protein, fats, calorie, grams, meal_type, category))
            conn.commit()
        flash('Food added successfully!')
        return redirect(url_for('manage_food'))

    return render_template('add_food.html')

# Route to update food information
# Route to update food information
@app.route('/food/update/<int:food_id>', methods=['GET', 'POST'])
def update_food(food_id):
    if request.method == 'POST':
        # Get form values
        food_name = request.form.get('food_name')
        food_type = request.form.get('type')
        carbs = request.form.get('carbs')
        protein = request.form.get('protein')
        fats = request.form.get('fats')
        calorie = request.form.get('calorie')
        grams = request.form.get('grams')
        meal_type = request.form.get('meal_type')
        category = request.form.get('category')

        # Debugging: Print form values to verify
        print(f"Form Data - food_name: {food_name}, food_type: {food_type}, carbs: {carbs}, protein: {protein}")

        # Ensure all fields are filled out
        if not food_name or not food_type or not carbs or not protein or not fats or not calorie or not grams or not meal_type or not category:
            flash('Please fill out all fields.')
            return redirect(url_for('update_food', food_id=food_id))

        with get_db_connection() as conn:
            conn.execute('UPDATE foods SET food_name = ?, type = ?, carbs = ?, protein = ?, fats = ?, calorie = ?, grams = ?, meal_type = ?, category = ? WHERE food_id = ?',
                         (food_name, food_type, carbs, protein, fats, calorie, grams, meal_type, category, food_id))
            conn.commit()
        flash('Food updated successfully!')
        return redirect(url_for('manage_food'))

    else:
        with get_db_connection() as conn:
            food = conn.execute('SELECT * FROM foods WHERE food_id = ?', (food_id,)).fetchone()
        if food is None:
            flash('Food not found!')
            return redirect(url_for('manage_food'))
        return render_template('update_food.html', food=food)


# Route to delete a food item
@app.route('/food/delete/<int:food_id>', methods=['POST'])
def delete_food(food_id):
    with get_db_connection() as conn:
        conn.execute('DELETE FROM foods WHERE food_id = ?', (food_id,))
        conn.commit()
    flash('Food deleted successfully!')
    return redirect(url_for('manage_food'))

# Route to manage users
@app.route('/user')
def manage_user():
    with get_db_connection() as conn:
        users = conn.execute('SELECT * FROM tbl_users').fetchall()
    return render_template('user.html', users=users)

# Route to delete a user
@app.route('/delete_user/<int:user_id>', methods=['POST'])
def delete_user(user_id):
    with get_db_connection() as conn:
        conn.execute('DELETE FROM tbl_users WHERE user_id = ?', (user_id,))
        conn.commit()
    flash('User deleted successfully!')
    return redirect(url_for('manage_user'))

if __name__ == '__main__':
    app.run(debug=True)
