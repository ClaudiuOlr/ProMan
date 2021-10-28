import { dataHandler } from "./data_handler.js";
import { util } from "./util.js";

export function addBoardButtons(boardId) {
    const boardButtons = document.querySelector(
        `li[boardid="${boardId}"] > .title`
    );
    const boardTitleBar = document.querySelector(`li[boardid="${boardId}"]`);

    boardButtons.appendChild(
        createButton(
            "new-card-modal",
            ["fas", "fa-plus-circle"],
            "New card",
            boardId
        )
    );
    boardButtons.appendChild(createDeleteBoardButton(boardId, boardTitleBar));
    boardButtons.appendChild(
        createButton("edit-board-modal", ["fas", "fa-edit"], "Edit", boardId)
    );
    boardButtons.appendChild(
        createButton(
            "new-column-modal",
            ["fas", "fa-columns"],
            "New column",
            boardId
        )
    );
}
function createButton(modalId, iconClasses, titleText, boardId) {
    const button = util.addButton(iconClasses, titleText);

    button.onclick = function () {
        const modalToShow = document.getElementById(modalId);
        modalToShow.style.display = "block";

        localStorage.setItem("activeBoard", boardId);
    };
    return button;
}
function createDeleteBoardButton(boardId, elementToDelete) {
    const deleteButton = util.addButton(["fas", "fa-trash-alt"], "Delete");

    deleteButton.onclick = function () {
        dataHandler.deleteBoard(boardId, function () {
            const columns = elementToDelete.nextElementSibling;
            elementToDelete.remove();
            columns.remove();
        });
    };
    return deleteButton;
}