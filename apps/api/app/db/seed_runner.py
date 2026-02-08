from app.db.session import SessionLocal
from app.db.seed import run_seed


def main():
    db = SessionLocal()
    try:
        run_seed(db)
    finally:
        db.close()


if __name__ == "__main__":
    main()
