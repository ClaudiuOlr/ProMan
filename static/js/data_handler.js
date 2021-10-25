export let dataHandler = {
    _data: {},

    _api_get: function (url, callback) {
        fetch(url, {
            method: "GET",
            credentials: "same-origin",
        })
            .then((response) => response.json())
            .then((json_response) => callback(json_response));
    },

    _api_post: function (url, data, callback) {
        fetch(url, {
            method: "POST",
            credentials: "same-origin",
            body: JSON.stringify(data),
            cache: "no-cache",
            headers: new Headers({ "content-type": "application/json", }),
        })
            .then((response) => response.json())
            .then((json_response) => callback(json_response));
    },

    _api_put: function (url, data, callback) {
        fetch(url, {
            method: "PUT",
            credentials: "same-origin",
            body: JSON.stringify(data),
            cache: "no-cache",
            headers: new Headers({ "content-type": "application/json", }),
        })
            .then((response) => response.json())
            .then((json_response) => callback(json_response));
    },

    _api_delete: function (url, data, callback) {
        fetch(url, {
            method: "DELETE",
            credentials: "same-origin",
            body: JSON.stringify(data),
            cache: "no-cache",
            headers: new Headers({ "content-type": "application/json", }),
        })
            .then((response) => response.json())
            .then((json_response) => callback(json_response));
    },
    init: function () {},

    getBoards: function (callback) {
        this._api_get("/boards", (response) => {
            this._data["boards"] = response;
            callback(response);
        });
    },
    
    getCardsByBoardId: function (boardId, callback) {
        this._api_get(`/cards?boardId=${boardId}`, (response) => {
            this._data["cards"] = response;
            callback(response);
        });
    },
    getStatuses: function (callback) {},
    getStatus: function (statusId, callback) {},

    getCard: function (cardId, callback) {},

    createNewBoard: function (boardDetails, callback) {
        this._api_post("/boards", boardDetails, (response) => {
            this._data["newBoard"] = response;
            callback(response);
        });
    },

    updateBoard: function (boardData, callback) {
        this._api_put("/boards", boardData, (response) => {
            this._data["newBoard"] = response;
            callback(response);
        });
    },

    createNewCard: function (cardData, callback) {
        this._api_post("/cards", cardData, (response) => {
            this._data["newCard"] = response;
            callback(response);
        });
    },

    updateCardsPosition: function (cardsData, callback) {
        this._api_post("/update-cards-position", cardsData, callback);
    },

    updateCardsOrderNumbers: function (cardsOrderNumbers, callback) {
        this._api_post(
            "/update-cards-order-numbers",
            cardsOrderNumbers,
            (response) => {
                this._data["cardsOrderNumbers"] = response;
                callback(response);
            }
        );
    },

    updateCard: function (cardData, callback) {
        this._api_put("/cards", cardData, (response) => {
            this._data["newCardTitle"] = response;
            callback(response);
        });
    },

    deleteBoard: function (boardId, callback) {
        this._api_delete("/boards", boardId, (response) => {
            this._data["boardId"] = response;
            callback(response);
        });
    },

    deleteCard: function (cardId, callback) {
        this._api_delete("/cards", cardId, (response) => {
            this._data["cardId"] = response;
            callback(response);
        });
    },

    createColumn: function (columnData, callback) {
        this._api_post("/statuses", columnData, callback);
    },

    getColumnsByBoardsId: function (boardId, callback) {
        this._api_get(`/statuses?boardId=${boardId}`, callback);
    },
};
