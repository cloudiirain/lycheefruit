"""lycheefruit app."""

from flask import Flask, render_template

app = Flask(__name__)


@app.route('/')
def home():
    """Home page."""
    return """Hello world."""


@app.route('/nufrift/shipping')
def nufrift_shipping():
    """Shipping cost calculator."""
    return render_template('nufrift/shipping.html')


if __name__ == '__main__':
    app.run(debug=True, use_reloader=True)
