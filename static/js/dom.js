import {dataHandler} from "./data_handler.js";
import {
    addBoardButtons
} from "./board_handler.js";
import {generator} from './container_generator.js';

import {dragAndDropHandler, initTask} from './drag_and_drop_handler.js';
import {util} from "./util.js";


export let dom = {
    init: function () {
        dom.loadBoards();
        generator.handleRefreshButton();
    },

    loadBoards: function () {
        dataHandler.getBoards(function (boards) {
            dom.showBoards(boards);
        });
    },

    showBoards: function (boards) {
        const boardListPromise = generator.generateBoards(boards);
        boardListPromise
            .then(boardList => {
                const outerHtml = util.createElementWithClasses('ul', ['board-container', 'flex-column']);
                outerHtml.innerHTML = boardList;

                const boardsContainer = document.querySelector('#boards');
                boardsContainer.appendChild(outerHtml);

                generator.handleDetailButton();
                fillBoardContent(boards);
            })
    },

    loadCards: function (boardId) {
        dataHandler.getCardsByBoardId(boardId, function (response) {
            dom.showCards(response);
            dragAndDropHandler.init();
        });
    },

    showCards: function (cards) {
        generator.assignCards(cards);
    },

    displayNewBoard: function (board_details, board_id) {

        const newBoardPromise = generator.createTemplateOfBoardsHTML(board_details['title'], board_details['board_private'],
                                                                     board_id, true);
        newBoardPromise
            .then(newBoard => {
                const boardContainer = document.querySelector('.board-container');
                boardContainer.insertAdjacentHTML("beforeend", newBoard);

                generator.handleBoardDetailsEvent(generator.getLastButton());
                generator.initNewColumnsWithDragAndDrop(board_id);
                addBoardButtons(board_id);
                generator.markPrivateBoard(board_details, board_id);
            })
    },

    displayNewCard: function (parent, title, taskId, taskOrderNumber) {
        const newTask = generator.createNewTask(taskId, title, taskOrderNumber);
        initTask(newTask);
        parent.appendChild(newTask);
    },

    displayNewColumn: function(data) {
        const cardsContainer = document.querySelector(`div[containerboardid="${data.board_id}"]`);
        const newColumn = generator.createNewColumn(data);

        cardsContainer.appendChild(newColumn);
    }
};

function fillBoardContent(boards) {
    for (let board of boards) {
        dom.loadCards(board.id)

        if (board.board_private) {
            generator.markPrivateBoard(board, board['id']);
        }

        generator.initNewColumnsWithDragAndDrop(board.id);
        addBoardButtons(board.id);
    }
}
