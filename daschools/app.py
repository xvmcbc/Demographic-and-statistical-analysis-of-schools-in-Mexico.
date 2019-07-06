#Dependencias
import os

import pandas as pd

import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine

from flask_cors import CORS, cross_origin

from flask import Flask, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy

# FLASK-----------------------------------------------------------------------------------------------------------------------------------------
# Generate the app
app = Flask(__name__)

cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

#################################################
# Database Setup
#################################################

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///db/universities_db.db"
db = SQLAlchemy(app)

# reflect an existing database into a new model
Base = automap_base()
# reflect the tables
Base.prepare(db.engine, reflect=True)

# Save references to each table
Schools_Metadata = Base.classes.schools

# SCRAPE---------------------------------------------------------------------------------------------------------------------------------
@app.route("/info")
@cross_origin()
def info():

      # Use Pandas to perform the sql query
    stmt = db.session.query(Schools_Metadata).statement
    #stmt = "select * from schools limit 10"
    df = pd.read_sql_query(stmt, db.session.bind)

    #data = pd.read_sql("SELECT * FROM schools", conn)

    dictio = df.to_json(orient='index')

    #Checar cual de las dos lineas es mejor
    #return jsonify(dictio) 
    return(dictio)
   

# Home page
@app.route('/')
def home():

    # Nos conectamos a la BD, guardamos el resultado y lo rendereamos
   # mars_data = list(db.general.find())
  
     return render_template("index.html")

if __name__ == "__main__":
    app.run()


