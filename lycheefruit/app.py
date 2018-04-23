"""lycheefruit app."""

from flask import Flask

app = Flask(__name__)


@app.route('/')
def home():
    """Home page."""
    return """Hello world."""


if __name__ == '__main__':
    app.run(debug=True, use_reloader=True)
