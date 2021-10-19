from psycopg2.extras import RealDictCursor
from psycopg2 import sql

import database_common


@database_common.connection_handler
def get_boards_data(cursor: RealDictCursor, user_id: int) -> list:
    """Get id of last added record"""

    query = sql.SQL("SELECT * FROM boards WHERE board_private = false ")
    if user_id:
        query += sql.SQL("OR user_id = {id}").format(id=sql.Literal(user_id))

    cursor.execute(query)

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
    cursor: RealDictCursor, board_title: str, board_private: str, user_id: int
) -> dict:
    """Add new board to database"""

    cursor.execute(
        """
                INSERT INTO boards (title, board_private, user_id) 
                VALUES (%(b_title)s, %(b_private)s, %(user_id)s)
                RETURNING id, board_private
            """,
        {"b_title": board_title, "b_private": board_private, "user_id": int(user_id)},
    )

    return cursor.fetchone()


@database_common.connection_handler
def add_new_card(cursor: RealDictCursor, card_data: dict) -> dict:
    """Add new card to database"""

    cursor.execute(
        """
    INSERT INTO cards (title, board_id, status_id, order_number) 
    VALUES (%(c_title)s, %(c_board_id)s, %(c_status)s, %(c_order_number)s)
    RETURNING id
            """,
        {
            "c_title": card_data["title"],
            "c_board_id": card_data["boardId"],
            "c_status": card_data["statusId"],
            "c_order_number": card_data["orderNumber"],
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
                WHERE id = %(id)s
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
    base_query = sql.SQL("SELECT * FROM users ")
    if "@" in datum:
        where_clause = sql.SQL("WHERE email={email}").format(email=sql.Literal(datum))
    else:
        where_clause = sql.SQL("WHERE username={username}").format(
            username=sql.Literal(datum)
        )

    cursor.execute(base_query + where_clause)

    return cursor.fetchone()


@database_common.connection_handler
def add_new_user(cursor: RealDictCursor, user_data):
    """Add new user to a database"""

    query = sql.SQL(
        """INSERT INTO users (username, email, password) VALUES ( {username}, {email}, {password});"""
    ).format(
        username=sql.Literal(user_data["username"]),
        email=sql.Literal(user_data["email"]),
        password=sql.Literal(user_data["password"]),
    )
    cursor.execute(query)


@database_common.connection_handler
def delete_record(cursor: RealDictCursor, table_name: str, record_id: int):
    query = sql.SQL(
        """
        DELETE FROM {table_title} 
        WHERE id = {r_id}
    """
    ).format(table_title=sql.Identifier(table_name), r_id=sql.Literal(record_id))

    cursor.execute(query)


@database_common.connection_handler
def update_title(cursor: RealDictCursor, table_name: str, record_id: int, title: str):
    query = sql.SQL(
        """
        UPDATE {table_title}
        SET title = {title}
        WHERE id = {r_id}
    """
    ).format(
        table_title=sql.Identifier(table_name),
        r_id=sql.Literal(record_id),
        title=sql.Literal(title),
    )

    cursor.execute(query)


@database_common.connection_handler
def add_new_column(cursor: RealDictCursor, column_data: dict):
    """Add new column to database"""
    cursor.execute(
        """
                INSERT INTO statuses (title, board_id, order_number) 
                VALUES (%(s_title)s, %(s_board_id)s, %(s_order_number)s)
                RETURNING id
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
