from celery.schedules import crontab
from flask import Flask
from flask_security import Security

from application.instances import cache
from application.models import db
from application.sec import datastore
from config import DevelopmentConfig
from application.resources import api
from application.worker import celery_init_app
from application.tasks import daily_reminder, mark_overdue_requests_as_revoked, send_monthly_report


def create_app():
    app = Flask(__name__)
    app.config.from_object(DevelopmentConfig)
    db.init_app(app=app)
    api.init_app(app)
    app.security = Security(app, datastore)
    cache.init_app(app)
    with app.app_context():
        import application.views

    return app


app = create_app()
celery_app = celery_init_app(app)


@celery_app.on_after_configure.connect
def automated_tasks(sender, **kwargs):
    # daily at 6 30
    sender.add_periodic_task(
        30,
        # crontab(hour=19,minute=58),
        daily_reminder.s(),
    )

    # revoke overdue books
    sender.add_periodic_task(
        60,
        # crontab(hour=0, minute=1),
        mark_overdue_requests_as_revoked.s(),
    )

    # monthly report
    sender.add_periodic_task(
        30,
        # crontab(day_of_month=1, hour=0, minute=1),
        send_monthly_report.s(),
    )


if __name__ == '__main__':
    app.run(debug=True)
    # app.run(debug=True,host='192.168.0.8',port=5000)
