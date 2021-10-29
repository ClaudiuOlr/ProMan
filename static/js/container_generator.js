import { initColumns, initColumn } from "./drag_and_drop_handler.js";
import {
    createDeleteCardButton,
    createEditCardButton,
} from "./card_handler.js";
import { dataHandler } from "./data_handler.js";
import { util } from "./util.js";

const defaultColumns = ["New", "In Progress", "Testing", "Done"];

export let generator = {
    generateBoards: function (boards) {
        return new Promise((resolve) => {
            let boardList = "";

            Object.keys(boards).length === 0
                ? resolve(boardList)
                : generateBoardList(resolve, boardList, boards);
        });
    },

    createTemplateOfBoardsHTML: function (
        title,
        board_private,
        id,
        isNewBoard = false
    ) {
        return new Promise((resolve) => {
            board_private = board_private ? "true" : "false";
            const boardDetailsPromise = this.generateBoardDetails(
                id,
                isNewBoard
            );
            boardDetailsPromise.then((boardDetails) => {
                const boardsTemplate = getBoardTemplate(
                    title,
                    board_private,
                    id,
                    boardDetails
                );
                resolve(boardsTemplate);
            });
        });
    },

    generateBoardDetails: function (id, isNewBoard) {
        return new Promise((resolve) => {
            isNewBoard
                ? this.generateDefaultColumns(resolve, id).then((r) =>
                      resolve()
                  )
                : generateColumns(resolve, id);
        });
    },

    generateDefaultColumns: async function (resolve, id) {
        let cardList = "";
        for (let [index, columnName] of defaultColumns.entries()) {
            const columnData = {
                title: columnName,
                board_id: id,
                order_number: index,
            };
            await this.createNewColumnPromise(columnData).then((statusId) => {
                cardList += getColumn(columnData, statusId);

                if (index === defaultColumns.length - 1) {
                    resolve(cardList);
                }
            });
        }
    },

    getColumnsByBoardId: function (id) {
        return new Promise((resolve) => {
            dataHandler.getColumnsByBoardsId(id, (response) => {
                resolve(response.columns);
            });
        });
    },

    createNewColumnPromise: function (columnData) {
        return new Promise((resolve) => {
            dataHandler.createColumn(columnData, (response) => {
                resolve(response.id);
            });
        });
    },

    handleDetailButton: function () {
        const detailBtn = document.querySelectorAll(".detail-button");
        detailBtn.forEach((button) => {
            generator.handleBoardDetailsEvent(button);
        });
    },

    assignCards: function (cards) {
        cards.forEach((card) => {
            let column = document.querySelector(
                `.cell[data-status-id="${card.status_id}"] .tasks`
            );
            const task = this.createNewTask(
                card.id,
                card.title,
                card.order_number
            );
            column.appendChild(task);
        });
    },

    getLastButton: function () {
        const buttons = [...document.querySelectorAll(".board-details > i")];
        return buttons[buttons.length - 1];
    },

    initNewColumnsWithDragAndDrop: function (board_id) {
        initColumns(
            document.querySelectorAll(
                `div[containerBoardId="${board_id}"] .tasks`
            )
        );
    },

    createNewTask: function (taskId, title, orderNumber) {
        const task = util.createElementWithClasses("div", ["task"]);
        task.setAttribute("task-id", taskId);
        task.setAttribute("order-number", orderNumber);

        const taskTitle = util.createElementWithClasses("div", ["task-title"]);
        taskTitle.textContent = title;
        task.appendChild(taskTitle);

        task.appendChild(addButtonsToCard(task, taskId));

        return task;
    },

    markPrivateBoard: function (board_details, board_id) {
        const icons = document.getElementsByClassName(
            "div.title fas fa-user-lock"
        );

        if (board_details.board_private && icons.length === 0) {
            const lockIcon = '<i class="fas fa-user-lock"></i>';
            const boardTitleContainer = document.querySelector(
                `li[boardId="${board_id}"] .col-title`
            );
            boardTitleContainer.insertAdjacentHTML("afterbegin", lockIcon);
        }
        stylePrivateBoard(board_details, board_id);
    },

    handleBoardDetailsEvent: function (button) {
        button.addEventListener("click", function (e) {
            e.preventDefault();
            button.getAttribute("boardId");
            const cardsContainer =
                button.parentElement.parentElement.nextElementSibling;
            cardsContainer.classList.toggle("show");

            button.className = button.classList.contains("fa-ellipsis-h")
                ? "detail-button fas fa-times"
                : "detail-button fas fa-ellipsis-h";
        });
    },

    createNewColumn: function (data) {
        const cellElement = util.createElementWithClasses("div", ["cell"]);
        //  Replace all non-standard attributes with datasets
        //  as per the below
        cellElement.dataset.statusId = data.status_id;
        cellElement.setAttribute("status-order-number", data.order_number);

        const titleElement = util.createElementWithClasses("h3");
        titleElement.textContent = data.title;
        if (
            document
                .querySelector(`li[boardid="${data.board_id}"]`)
                .getAttribute("boardprivate") === "true"
        ) {
            titleElement.classList.add("private");
        }

        const tasksElement = util.createElementWithClasses("div", [
            "tasks",
            "flex-column",
        ]);
        tasksElement.setAttribute("cardid", data.board_id);
        initColumn(tasksElement);

        cellElement.appendChild(titleElement);
        cellElement.appendChild(tasksElement);
        return cellElement;
    },
};

function generateColumns(resolve, id) {
    let cardList = "";
    generator.getColumnsByBoardId(id).then((columns) => {
        for (let [columnIndex, column] of columns.entries()) {
            cardList += `
                <div class="cell" data-status-id="${column.id}" data-status-order-number="${column.order_number}">
                    <h3 contenteditable="true" class="editable" maxLength="15">${column.title}</h3>
                    <div class="tasks flex-column" cardId="${id}"></div>
                </div>
                `;
            if (columnIndex === Object.keys(columns).length - 1) {
                resolve(cardList);
            }
        }
    });
}

function stylePrivateBoard(board_details, board_id) {
    if (board_details.board_private) {
        //  dataset
        const li = document.querySelector(`li[boardId="${board_id}"]`);
        const cards = document.querySelectorAll(
            `div[containerBoardId="${board_id}"] .cell h3`
        );

        li.classList.add("private");
        cards.forEach((card) => {
            card.classList.add("private");
        });
    }
}

function addButtonsToCard(elementToDelete, cardId) {
    const buttonPanel = util.createElementWithClasses("div", ["button-panel"]);

    buttonPanel.appendChild(createDeleteCardButton(elementToDelete, cardId));
    buttonPanel.appendChild(createEditCardButton(cardId));

    return buttonPanel;
}

function generateBoardList(resolve, boardList, boards) {
    (async () => {
        for (let board of boards) {
            const templateOfBoardsPromise =
                generator.createTemplateOfBoardsHTML(
                    board.title,
                    board.board_private,
                    board.id
                );
            await templateOfBoardsPromise.then((result) => {
                boardList += result;
            });
        }
        return resolve(boardList);
    })();
}

function getColumn(columnData, statusId) {
    //  dataset
    return `
            <div class='cell' status-id="${statusId}" status-order-number='${columnData.order_number}'>
                <h3>${columnData.title}</h3>
                <div class="tasks flex-column" cardId="${columnData.board_id}"></div>
            </div>
           `;
}

function getBoardTemplate(title, board_private, id, boardDetails) {
    //  dataset
    return `
            <li class="flex-row-start" boardId="${id}" boardPrivate="${board_private}">
                <div class="title flex-row-start">
                    <div class="col-title"><h3>${title}</h3></div>                       
                </div>
                <div class="board-details flex-row-end">
                    <i class="detail-button fas fa-ellipsis-h" boardId="${id}"></i>
                </div>
            </li>
            <div class="cards-container flex-row-start hide-details" containerBoardId="${id}">${boardDetails}</div>
           `;
}
