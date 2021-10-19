import bcrypt


def hash_password(plain_text_password):
    hashed_password = bcrypt.hashpw(
        plain_text_password.encode("utf-8"), bcrypt.gensalt()
    )
    return hashed_password.decode("utf-8")


def verify_password(password, hashed_password) -> bool:
    hashed_password = hashed_password.encode("utf-8")
    return bcrypt.checkpw(
        password.encode("utf-8"), hashed_password
    )  
