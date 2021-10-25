import bcrypt


def hash_password(plain_text_password: str) -> bytes:
    hashed_password = bcrypt.hashpw(
        plain_text_password.encode("utf-8"),
        bcrypt.gensalt(),
    )

    return hashed_password.decode("utf-8")


def verify_password(password: str, hashed_password: str) -> bool:
    hashed_password = hashed_password.encode("utf-8")

    return bcrypt.checkpw(
        password.encode("utf-8"),
        hashed_password,
    )
