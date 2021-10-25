import { dataHandler } from "./data_handler.js";

export let dragAndDropHandler = {
    init: function () {
        initDragAndDrop();
    }
}

const tasksSelector = ".task";
const columnsSelector = ".tasks";

function initDragAndDrop() {
    const tasks = document.querySelectorAll(tasksSelector);
    const columns = document.querySelectorAll(columnsSelector);
    initTasks(tasks);
    initColumns(columns);
}

function initTasks(tasks) {
    for (const task of tasks) {
        initTask(task);
    }
}

export function initTask(task) {
    task.setAttribute("draggable", "true");
    task.addEventListener("dragstart", dragStartHandler);
    task.addEventListener("drag", dragHandler);
    task.addEventListener("dragend", dragEndHandler);
}

export function initColumns(columns) {
    for (const column of columns) {
        initColumn(column);
    }
}

export function initColumn(column) {
    column.addEventListener("dragenter", columnEnterHandler);
    column.addEventListener("dragover", columnOverHandler);
    column.addEventListener("dragleave", columnLeaveHandler);
    column.addEventListener("drop", columnDropHandler);
}


function dragStartHandler(event) {
    this.classList.add("dragged-task-source", "dragged-task");
    const transferredData = event.dataTransfer;
    const draggedTaskBoardId = this.parentElement.getAttribute("cardid");
    markColumns(draggedTaskBoardId);
    transferredData.setData(`type/boardid/${draggedTaskBoardId}`, draggedTaskBoardId);
    transferredData.setData("boardId", draggedTaskBoardId);
    transferredData.setData("text/plain", this.textContent);
    deferredOriginChanges(this, "dragged-task");
}

function dragHandler() {
    
}

function dragEndHandler() {
    const draggedTaskBoardId = this.parentElement.getAttribute("cardid");
    markColumns(draggedTaskBoardId, false);
    this.classList.remove("dragged-task-source");
}

function columnEnterHandler(event) {
    const destinationColumnBoardId = this.getAttribute("cardid");
    if (event.dataTransfer.types.includes(`type/boardid/${destinationColumnBoardId}`)) {
        event.preventDefault();
        this.classList.add("over-column");
    }
}

function columnOverHandler(event) {
    const destinationColumnBoardId = this.getAttribute("cardid");
    if (event.dataTransfer.types.includes(`type/boardid/${destinationColumnBoardId}`)) {
        event.preventDefault();
    }
}

function columnLeaveHandler(event) {
    const destinationColumnBoardId = this.getAttribute("cardid");
    if (event.dataTransfer.types.includes(`type/boardid/${destinationColumnBoardId}`)
        && event.relatedTarget !== null
        && event.currentTarget !== event.relatedTarget.closest(columnsSelector)) {
        this.classList.remove("over-column");
    }
}

function columnDropHandler(event) {
    event.preventDefault();
    const destinationColumnBoardId = this.getAttribute("cardid");
    if (event.dataTransfer.getData("boardId") === destinationColumnBoardId) {
        const destinationTask = getDraggedTaskAboveDestinationTask(this, event.clientY);
        const draggedTaskSource = document.querySelector(".dragged-task-source");
        const taskStatusIdBeforeDrag = parseInt(draggedTaskSource.parentElement.parentElement.getAttribute("status-id"));
        const taskStatusIdAfterDrop = parseInt(this.parentElement.getAttribute("status-id"));

        if (destinationTask == null) {
            event.currentTarget.appendChild(draggedTaskSource);
        } else {
            event.currentTarget.insertBefore(draggedTaskSource, destinationTask);
        }

        let newTasksData = getNewTasksDataForColumn(destinationColumnBoardId, taskStatusIdBeforeDrag)
        if (taskStatusIdBeforeDrag !== taskStatusIdAfterDrop) {
            newTasksData = newTasksData.concat(getNewTasksDataForColumn(destinationColumnBoardId, taskStatusIdAfterDrop))
        }

        dataHandler.updateCardsPosition(newTasksData, response => {
        })
    }
}

function deferredOriginChanges(origin, draggedTaskClassName) {
    setTimeout(() => {
        origin.classList.remove(draggedTaskClassName);
    });
}

function markColumns(boardId, marked = true) {
    const columns = document.querySelectorAll(`[cardid='${boardId}']` + columnsSelector);
    for (let column of columns) {
        if (marked) {
            column.classList.add("active-column");
        } else {
            column.classList.remove("active-column");
            column.classList.remove("over-column");
        }
    }
}

function getDraggedTaskAboveDestinationTask(column, y) {
    const tasks = Array.from(column.querySelectorAll(tasksSelector + ":not(.dragged-task-source)"));
    return tasks.reduce((closest, child) => {
        const taskDiv = child.getBoundingClientRect();
        const offset = y - taskDiv.top - taskDiv.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return {offset: offset, task: child };
        } else { return closest; }
    }, { offset: Number.NEGATIVE_INFINITY }).task;
}

function getNewTasksDataForColumn(boardId, statusId) {
    const data = [];
    const column = document.querySelector(`[containerboardid="${boardId}"] [status-id="${statusId}"] ` + columnsSelector);
    for (let childIndex = 0; childIndex < column.children.length; childIndex++) {
        let taskId = column.children[childIndex].getAttribute("task-id");
        let orderNumber = childIndex;
        setTaskOrderNumber(column.children[childIndex], orderNumber);
        data.push({taskId: taskId, orderNumber: orderNumber, statusId: statusId})
    }
    return data;
}

function setTaskOrderNumber(task, orderNumber) {
    task.setAttribute("order-number", orderNumber.toString());
}
