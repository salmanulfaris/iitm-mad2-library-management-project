import base64
import random
from datetime import datetime
from io import BytesIO
import matplotlib

from application.instances import cache

matplotlib.use('Agg')
import matplotlib.pyplot as plt
from flask import request, jsonify
from flask_restful import Resource, Api, reqparse, fields, marshal
from flask_security import current_user, auth_required, roles_required
from sqlalchemy import text
from werkzeug.utils import secure_filename

from application.models import Book, db,User, Section, BookRequest, Feedback, DailyVisit


def log_user_visits():
    if current_user is not None and "member" in current_user.roles:
        visited = DailyVisit.query.filter_by(user_id=current_user.id,
                                             date=datetime.today().strftime('%Y-%m-%d')).count()
        if visited == 0:
            vs = DailyVisit(user_id=current_user.id, date=datetime.today())
            db.session.add(vs)
            db.session.commit()


api = Api(prefix='/api')

user = {
    'id': fields.Integer,
    'name': fields.String,
    'email': fields.String
}
review = {
    'id': fields.Integer,
    'user_id': fields.Integer,
    'book_id': fields.Integer,
    'feedback': fields.String,
    'user': fields.Nested(user),
}

section_marshal_fields = {
    'section_id': fields.Integer,
    'section_name': fields.String,
    'section_icon': fields.String,
    'section_description': fields.String,
    'date_created': fields.DateTime(dt_format='iso8601'),
    'books': fields.Nested({
        'book_id': fields.Integer,
        'prologue': fields.String,
        'author': fields.String,
        'section_id': fields.Integer,
        'title': fields.String,
        'content': fields.String,
        'image': fields.String,
        'is_pending_for_me': fields.Boolean,
        'is_approved_for_me': fields.Boolean,
        'num_of_book_pending_for_me': fields.Integer,
    })
}

book_marshal_fields = {
    'book_id': fields.Integer,
    'prologue': fields.String,
    'author': fields.String,
    'section_id': fields.Integer,
    'title': fields.String,
    'content': fields.String,
    'image': fields.String,
    'section': fields.Nested(section_marshal_fields),
    # 'approved_requests': fields.Nested(book_requests_marshal_field),
    # 'pending_requests': fields.Nested(book_requests_marshal_field),
    'is_pending_for_me': fields.Boolean,
    'is_approved_for_me': fields.Boolean,
    'wrote_review': fields.Boolean,
    'request_id': fields.Raw,
    'requests': fields.Nested({
        'id': fields.Integer,
        'user_id': fields.Integer,
        'user': fields.Nested(user),
        'book_id': fields.Integer,
        'is_approved': fields.Boolean,
        'is_rejected': fields.Boolean,
        'is_returned': fields.Boolean,
        'is_revoked': fields.Boolean,
        'rejection_reason': fields.String,
        'issue_date': fields.DateTime(dt_format='iso8601'),
        'return_date': fields.DateTime(dt_format='iso8601'),
    }),
    'num_of_book_pending_for_me': fields.Integer,
    'feedbacks': fields.Nested(review),
}

book_requests_marshal_field = {
    'id': fields.Integer,
    'user_id': fields.Integer,
    'book_id': fields.Integer,
    'is_approved': fields.Boolean,
    'is_rejected': fields.Boolean,
    'is_returned': fields.Boolean,
    'is_revoked': fields.Boolean,
    'rejection_reason': fields.String,
    'book': fields.Nested(book_marshal_fields),
    'user': fields.Nested(user),
    'issue_date': fields.DateTime(dt_format='iso8601'),
    'return_date': fields.DateTime(dt_format='iso8601')
}


class Books(Resource):

    @auth_required("token")
    # @cache.cached(timeout=50)
    def get(self, book_id):
        return marshal(Book.query.get(book_id), book_marshal_fields)

    def delete(self, book_id):
        try:
            feedbacks = Feedback.query.filter_by(book_id=book_id).delete()
            requests = BookRequest.query.filter_by(book_id=book_id).delete()
            edit_section = Book.query.filter_by(book_id=book_id).delete()
        except Exception as e:
            db.session.rollback()
            return {"message": "An Error in Deleting " + e}, 500
        else:
            db.session.commit()
            return {"message": "Deleted successfully"}, 200

    @auth_required("token")
    def put(self, book_id):
        try:
            parser = reqparse.RequestParser()
            parser.add_argument('author', location="form", help="Author name", required=True)
            parser.add_argument('title', help="Book title", required=True, location="form")
            parser.add_argument('content', help="Book content", required=True, location="form")
            parser.add_argument('section', help="Section", required=True, location="form")
            parser.add_argument('prologue', help="Prologue", required=True, location="form")
            # parser.add_argument('image', type=FileStorage, help="Image", location="form")
            args = parser.parse_args(request)

            book = Book.query.get(book_id)

            if 'image' in request.files:
                file = request.files['image']
                if file:
                    filename = str(random.randint(100, 9999999)) + secure_filename(file.filename)

                    file.save("static/uploaded/" + filename)
                    file.close()

                else:
                    filename = book.image
            else:
                filename = book.image

            if args.get('title') == "":
                return {"message": "Title is required"}, 401
            if args.get('author') == "":
                return {"message": "Author is required"}, 401
            if args.get('content') == "":
                return {"message": "content is required"}, 401
            if args.get('section') == "":
                return {"message": "section is required"}, 401

            book.author = args.get('author')
            book.title = args.get('title')
            book.content = args.get('content')
            book.prologue = args.get('prologue')
            book.section_id = args.get('section')
            book.image = filename

        except Exception as e:
            db.session.rollback()
            return {"message": "An Error in Deleting"}, 500
        else:
            db.session.commit()
            return {"message": "Updated Successfully"}, 200


class BooksList(Resource):
    @auth_required("token")
    # @cache.cached(timeout=50)
    def get(self):
        log_user_visits()
        return marshal(Book.query.order_by(text("book_id desc")).all(), book_marshal_fields)

    @auth_required("token")
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('author', location="form", help="Author name", required=True)
        parser.add_argument('title', help="Book title", required=True, location="form")
        parser.add_argument('content', help="Book content", required=True, location="form")
        parser.add_argument('section', help="Section", required=True, location="form")
        parser.add_argument('prologue', help="Prologue", required=True, location="form")
        args = parser.parse_args()
        if args.get('title') == "":
            return {"message": "Title is required"}, 401
        if args.get('author') == "":
            return {"message": "Author is required"}, 401
        if args.get('content') == "":
            return {"message": "content is required"}, 401
        if args.get('section') == "":
            return {"message": "section is required"}, 401
        if 'image' in request.files:
            file = request.files['image']
            if file:
                filename = str(random.randint(100000, 100000000)) + secure_filename(file.filename)

                file.save("static/uploaded/" + filename)
                file.close()

            else:
                filename = ""
        else:
            filename = ""
        new_book = Book(author=args.get('author'),
                        title=args.get('title'),
                        content=args.get('content'),
                        prologue=args.get('prologue'),
                        section_id=args.get('section'),
                        image=filename)

        db.session.add(new_book)
        db.session.commit()
        return marshal(new_book, book_marshal_fields), 201


class SectionList(Resource):
    @auth_required("token")
    # @cache.cached(timeout=50)
    def get(self):
        return marshal(Section.query.all(), section_marshal_fields)

    @auth_required("token")
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('section_name', help="Section name", required=True)
        parser.add_argument('section_description', help="Section Description", required=True)
        args = parser.parse_args()
        if args.get('section_name') == "":
            return {"message": "Section Name is required"}, 401
        new_section = Section(section_name=args.get('section_name'),
                              section_icon="",
                              section_description=args.get('section_description'),
                              date_created=datetime.today())
        db.session.add(new_section)
        db.session.commit()
        return {"message": "Created"}, 201


class SectionL(Resource):
    @auth_required("token")
    # @cache.cached(timeout=50)
    def get(self, section_id):
        return marshal(Section.query.get(section_id), section_marshal_fields)

    @auth_required("token")
    @roles_required("libr")
    def put(self, section_id):
        try:
            parser = reqparse.RequestParser()
            parser.add_argument('section_name', help="Section name", required=True)
            parser.add_argument('section_description', help="Section Description", required=True)
            args = parser.parse_args()
            if args.get('section_name') == "":
                return {"message": "Section Name is required"}, 401
            edit_section = Section.query.get(section_id)
            edit_section.section_name = args.get('section_name')
            edit_section.section_description = args.get('section_description')
        except Exception as e:
            db.session.rollback()
            return {"message": "An Error in Updating"}, 500
        else:
            db.session.commit()
            return {"message": "Updated successfully"}, 200

    @roles_required("libr")
    def delete(self, section_id):
        try:
            edit_section = Section.query.get(section_id)
            db.session.delete(edit_section)
        except Exception as e:
            db.session.rollback()
            return {"message": "An Error in Caching"}, 500
        else:
            db.session.commit()
            return {"message": "Deleted successfully"}, 200


class RequestBooks(Resource):
    @auth_required("token")
    def get(self, book_id):
        parser = reqparse.RequestParser()
        parser.add_argument('book_id', help="Book ID", required=True)

        req = BookRequest(user_id=current_user.id, book_id=book_id)
        db.session.add(req)
        db.session.commit()


class BookRequests(Resource):
    @auth_required("token")
    # @cache.cached(timeout=50)
    def get(self):
        pending = marshal(BookRequest.query.filter_by(is_approved=False, is_rejected=False).all(),
                          book_requests_marshal_field)
        approved = marshal(BookRequest.query.filter_by(is_approved=True, is_returned=True).all(),
                           book_requests_marshal_field)

        return jsonify({"pending": pending, "approved": approved})


class ApproveBook(Resource):
    @auth_required("token")
    def get(self, request_id):
        req = BookRequest.query.get(request_id)
        req.is_approved = True
        req.issue_date = datetime.today()
        db.session.add(req)
        db.session.commit()

        return {"message": "Approved"}, 201


class ReturnBook(Resource):
    @auth_required("token")
    def get(self, request_id):
        req = BookRequest.query.get(request_id)
        req.is_returned = True
        req.return_date = datetime.today()
        db.session.add(req)
        db.session.commit()

        return {"message": "Returned Book"}, 201


class RejectBook(Resource):
    @auth_required("token")
    def get(self, request_id):
        req = BookRequest.query.get(request_id)
        req.is_rejected = True
        db.session.add(req)
        db.session.commit()

        return {"message": "Rejected Book"}, 201


class RevokeBook(Resource):
    @auth_required("token")
    def get(self, request_id):
        req = BookRequest.query.get(request_id)
        req.is_revoked = True
        db.session.add(req)
        db.session.commit()

        return {"message": "Revoked Book"}, 201


class ReviewResource(Resource):
    @auth_required("token")
    def post(self, book_id):
        parser = reqparse.RequestParser()
        parser.add_argument('review', help="Review is required", required=True)
        args = parser.parse_args()

        rev = Feedback(book_id=book_id, user_id=current_user.id, feedback=args.get('review'))
        db.session.add(rev)
        db.session.commit()

        return {"message": "Review Added"}, 201


class Search(Resource):
    @auth_required("token")
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('search', help="Search Key", required=True)
        args = parser.parse_args()
        search_value = args.get('search')
        search = "%{}%".format(search_value)

        sections = Section.query.filter(Section.section_name.like(search)).all()
        books = Book.query.filter(Book.title.like(search) | Book.author.like(search)).all()
        return {"sections": marshal(sections, section_marshal_fields), "books": marshal(books, book_marshal_fields)}


class LibrarianReport(Resource):
    # @cache.cached(timeout=50)
    # @auth_required("token")
    def get(self):
        books = Book.query.all()
        sections = Section.query.all()

        # Create Matplotlib graph
        section_counts = {}
        issued_counts = {}
        for book in books:
            section_name = book.section.section_name
            section_counts[section_name] = section_counts.get(section_name, 0) + 1

            issued_requests = BookRequest.query.filter_by(book_id=book.book_id, is_approved=True, is_rejected=False,
                                                          is_returned=False,
                                                          is_revoked=False).all()
            # Count the number of issued requests
            issued_count = len(issued_requests)
            # Store the issued count for the book
            issued_counts[book.title] = issued_count
        # plt.figure(figsize=(5, 5))
        plt.bar(section_counts.keys(), section_counts.values(), color='green')
        plt.xlabel('Section')
        plt.ylabel('Number of Books')
        plt.title('Book Distribution by Section')
        plt.xticks(rotation=90)
        # Convert plot to base64 for embedding in JSON
        buffer = BytesIO()
        plt.tight_layout()
        plt.savefig(buffer, format='png')
        buffer.seek(0)
        plot_data_section = base64.b64encode(buffer.getvalue()).decode()
        plt.close()

        # plt.figure(figsize=(5, 5))

        plt.bar(issued_counts.keys(), issued_counts.values())
        plt.xlabel('Books')
        plt.ylabel('Number of Issued Requests')
        plt.title('Number of Issued Requests for Each Book')
        plt.xticks(rotation=90)
        # Convert plot to base64 for embedding in JSON
        buffer = BytesIO()
        plt.tight_layout()
        plt.savefig(buffer, format='png')

        buffer.seek(0)
        plot_data_book = base64.b64encode(buffer.getvalue()).decode()
        plt.close()

        # Prepare JSON response
        graph_data = {
            'plot_data_section': plot_data_section,
            'plot_data_book': plot_data_book,
            'section_counts': section_counts
        }

        return jsonify(graph_data)


class MyRequests(Resource):
    @auth_required("token")
    # @cache.cached(timeout=50)
    def get(self):
        parser = reqparse.RequestParser()
        parser.add_argument('search', help="Search Key", required=True)
        my_requests = BookRequest.query.filter_by(user_id=current_user.id).all()
        return marshal(my_requests, book_requests_marshal_field)
    

class MarkFavBoook(Resource):
    @auth_required("token")
    # @cache.cached(timeout=50)
    def get(self,book_id):
        user = User.query.get(current_user.id)
        user.fav_book = book_id;
        db.session.commit()
        return {"message":"updated successfully"},200


api.add_resource(Search, '/search')
api.add_resource(MyRequests, '/my-requests')

api.add_resource(LibrarianReport, '/lib/report')

api.add_resource(ReviewResource, '/review/<int:book_id>')

# Book Request handling
api.add_resource(RevokeBook, '/revoke-request/<int:request_id>')
api.add_resource(ApproveBook, '/approve-request/<int:request_id>')
api.add_resource(ReturnBook, '/return-request/<int:request_id>')
api.add_resource(RejectBook, '/reject-request/<int:request_id>')

api.add_resource(RequestBooks, '/request-book/<int:book_id>')

api.add_resource(BookRequests, '/book-requests')

api.add_resource(SectionList, '/section')
api.add_resource(SectionL, '/section/<int:section_id>')

api.add_resource(BooksList, '/book')
api.add_resource(Books, '/book/<int:book_id>')


api.add_resource(MarkFavBoook, '/book/mark_as_fav/<int:book_id>')
