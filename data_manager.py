from psycopg2.extras import RealDictCursor

import database_common


@database_common.connection_handler
def get_boards_data(cursor: RealDictCursor, user_id: int) -> list:
    """Get id of last added record"""

    query = "SELECT * FROM boards WHERE board_private = false "
    query += f"OR user_id = %(user_id)s" if user_id else ""

    cursor.execute(query, {"user_id": user_id})

    return cursor.fetchall()


@database_common.connection_handler
def get_cards_data(cursor: RealDictCursor, board_id: int) -> list:
    """Get id of last added record"""

    cursor.execute(
        """
                SELECT *  
                FROM cards
                WHERE board_id = %(b_id)s
                ORDER BY status_id, order_number
            """,
        {"b_id": board_id},
    )

    return cursor.fetchall()


@database_common.connection_handler
def add_new_board(
    cursor: RealDictCursor,
    board_title: str,
    board_private: str,
    user_id: int,
) -> dict:
    """Add new board to database"""

    cursor.execute(
        """
                INSERT INTO boards (title, board_private, user_id) 
                VALUES (%(b_title)s, %(b_private)s, %(user_id)s)
                RETURNING id, board_private;
            """,
        {
            "b_title": board_title,
            "b_private": board_private,
            "user_id": int(user_id),
        },
    )

    return cursor.fetchone()


@database_common.connection_handler
def add_new_card(cursor: RealDictCursor, card_data: dict) -> dict:
    """Add new card to database"""

    cursor.execute(
        """
    INSERT INTO cards (id, board_id, title, status_id, order_number, archived) 
    VALUES (%(c_id)s, %(c_board_id)s, %(c_title)s, %(c_status_id)s, %(c_order_number)s, %(c_archived)s)
    RETURNING id;
            """,
        {
            "c_id": card_data["id"],
            "c_board_id": card_data["board_id"],
            "c_title": card_data["title"],
            "c_status_id": card_data["status_id"],
            "c_order_number": card_data["order_number"],
            "c_archived": card_data["archived"],
        },
    )

    return cursor.fetchone()


@database_common.connection_handler
def update_card_position(cursor: RealDictCursor, card_position: dict):
    """Update card position"""

    cursor.execute(
        """
                UPDATE cards
                SET status_id = %(status_id)s, order_number = %(order_number)s
                WHERE id = %(id)s;
                    """,
        {
            "status_id": card_position["statusId"],
            "order_number": card_position["orderNumber"],
            "id": card_position["taskId"],
        },
    )


@database_common.connection_handler
def is_user_exist(cursor: RealDictCursor, datum):
    """Check if user exist in a database"""

    base_query = f"""
        SELECT *
        FROM users
        WHERE {'email' if '@' in datum else 'username'} = %(datum)s;
    """
    cursor.execute(base_query, {"datum": datum})

    return cursor.fetchone()


@database_common.connection_handler
def add_new_user(cursor: RealDictCursor, user_data):
    """Add new user to a database"""

    query = """INSERT INTO users (username, email, password) VALUES (%(username)s,%(email)s,%(password)s);"""
    cursor.execute(
        query,
        {
            "username": user_data["username"],
            "email": user_data["email"],
            "password": user_data["password"],
        },
    )


@database_common.connection_handler
def delete_record(cursor: RealDictCursor, table_name: str, record_id: int):
    query = f"""
        DELETE FROM {table_name} 
        WHERE id = %(r_id)s;
    """

    cursor.execute(query, {"r_id": record_id})


@database_common.connection_handler
def update_title(cursor: RealDictCursor, table_name: str, record_id: int, title: str):
    query = f"""
        UPDATE {table_name}
        SET title = %(title)s
        WHERE id = %(r_id)s;
    """

    cursor.execute(query, {"title": title, "r_id": record_id})


@database_common.connection_handler
def add_new_column(cursor: RealDictCursor, column_data: dict):
    """Add new column to database"""
    cursor.execute(
        """
                INSERT INTO statuses (title, board_id, order_number) 
                VALUES (%(s_title)s, %(s_board_id)s, %(s_order_number)s)
                RETURNING id;
            """,
        {
            "s_title": column_data["title"],
            "s_board_id": column_data["board_id"],
            "s_order_number": column_data["order_number"],
        },
    )

    return cursor.fetchone()


@database_common.connection_handler
def get_columns_by_board_id(cursor: RealDictCursor, board_id: int):
    cursor.execute(
        """
                SELECT * FROM statuses
                WHERE board_id = %(s_board_id)s
                ORDER BY order_number
                """,
        {"s_board_id": board_id},
    )
    return cursor.fetchall()
