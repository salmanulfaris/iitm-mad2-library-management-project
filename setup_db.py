from main import app
from application.sec import datastore
from application.models import db, Role, Section
from flask_security import hash_password
from werkzeug.security import generate_password_hash

with app.app_context():
    db.drop_all()
    db.create_all()
    section = Section(section_name="Section 1", section_description="Section 1")
    db.session.add(section)
    # datastore.find_or_create_role(name="admin", description="User is an admin")
    datastore.find_or_create_role(name="member", description="User is a Member")
    datastore.find_or_create_role(name="libr", description="User is a Librarian")
    db.session.commit()
    # if not datastore.find_user(email="admin@email.com"):
    #     datastore.create_user(
    #         email="admin@email.com", password=generate_password_hash("pass123"), roles=["admin"])
    if not datastore.find_user(email="lib@email.com"):
        datastore.create_user(name="Librarian",
                              email="lib@email.com", password=generate_password_hash("pass123"), roles=["libr"],
                              active=True)
    if not datastore.find_user(email="stud1@email.com"):
        datastore.create_user(
            name="Student 1",
            email="stud1@email.com", password=generate_password_hash("pass123"), roles=["member"])
    if not datastore.find_user(email="stud2@email.com"):
        datastore.create_user(
            name="Student 2",
            email="stud2@email.com", password=generate_password_hash("pass123"), roles=["member"])

    db.session.commit()
