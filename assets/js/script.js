// UI elements
const addTaskButton = $("#add-task-button");
// Form fields
const newTaskTitle = $("#task-title");
const newTaskDueDate = $("#task-due-date");
const newTaskDescription = $("#task-description");
// Card lanes
const toDoCardsLane = $("#todo-cards");
const inProgressCardsLane = $("#in-progress-cards");
const doneCardsLane = $("#done-cards");
// Card lane boxes
const toDoCardsLaneBox = $("#todo-cards-box");
const inProgressCardsLaneBox = $("#in-progress-cards-box");
const doneCardsLaneBox = $("#done-cards-box");

// Retrieve tasks and nextId from localStorage
let taskList = [];

// Modal form
modal = $("#task-form").dialog({
  autoOpen: false,
  height: 400,
  width: 350,
  modal: true,
  buttons: {
    "Create task": createTask,
    Cancel: function () {
      // Modal form fields are reset
      resetForm();
      //  Modal form window is closed
      modal.dialog("close");
    },
  },
  close: function () {
    // Modal form fields are reset
    resetForm();
  },
});

function createTask() {
  // New task is created
  const newTask = {
    id: crypto.randomUUID(),
    title: newTaskTitle.val(),
    dueDate: newTaskDueDate.val(),
    description: newTaskDescription.val(),
    status: "To do",
  };

  // New task is added to the task list
  taskList.push(newTask);

  // Task list is saved to local storage
  saveTasks();

  // Task list is refreshed
  loadTasks();

  // Card lanes are refreshed
  renderCardLanes();

  // Modal form fields are reset
  resetForm();

  //  Modal form window is closed
  modal.dialog("close");
}

function resetForm() {
  // Modal form fields are reset
  newTaskTitle.val("");
  newTaskDueDate.val("");
  newTaskDescription.val("");
}

function loadTasks() {
  // Gets task list from local storage
  taskList = JSON.parse(localStorage.getItem("tasks"));

  // If task list is null, make it an empty array
  if (taskList === null) {
    taskList = [];
  }
}

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(taskList));
}

function renderCardLanes() {
  // Card lanes are emptied, so they can be refreshed
  toDoCardsLane.children().remove("div");
  inProgressCardsLane.children().remove("div");
  doneCardsLane.children().remove("div");

  // Gets tasks with the status of "To do"
  const toDoCards = taskList.filter((task) => task.status === "To do");
  // Gets tasks with the status of "In progress"
  const inProgressCards = taskList.filter(
    (task) => task.status === "In progress"
  );
  // Gets tasks with the status of "Done"
  const doneCards = taskList.filter((task) => task.status === "Done");

  // Renders "To do" cards
  render(toDoCards, toDoCardsLane);

  // Renders "In progress" cards
  render(inProgressCards, inProgressCardsLane);

  // Renders "Done" cards
  render(doneCards, doneCardsLane);
}

// Renders the cards of a card lane
function render(cardArray, cardLane) {
  for (const card of cardArray) {
    // New card draggable is created
    const newCard = $("<div>").draggable({ opacity: 0.7, helper: "clone" });
    // It is given the id of the card
    newCard.attr("id", card.id);
    // It is given a z index, so that it is not covered by other elements
    newCard.css("z-index", "1");
    newCard.css("background-color", "red");

    // Card's title element is created
    const newCardTitle = $("<h3>");
    newCardTitle.text(card.title);

    // Card's due date element is created
    const newCardDueDate = $("<p>");
    newCardDueDate.text(card.dueDate);

    // Card's description element is created
    const newCardDescription = $("<p>");
    newCardDescription.text(card.description);

    // Card's delete button
    const newDeleteButton = $("<button>");
    newDeleteButton.text("Delete");
    newDeleteButton.on("click", () => handleDelete(card.id));

    // Card's elements are appened to it
    newCard.append(newCardTitle);
    newCard.append(newCardDueDate);
    newCard.append(newCardDescription);
    newCard.append(newDeleteButton);

    // Card is appended to the given card lane
    cardLane.append(newCard);
  }
}

function handleAddTask(event) {
  event.preventDefault();

  // Modal form window is opened
  modal.dialog("open");
}

function handleDelete(id) {
  // Removes the task with the given id from the task list
  taskList = taskList.filter((task) => task.id !== id);

  // The task board is refreshed
  saveTasks();
  loadTasks();
  renderCardLanes();
}

function handleDrop(event, ui) {
  // Gets the task that triggered the event from the task list
  const droppedTaskItem = taskList
    .filter((task) => task.id === ui.draggable[0].id)
    .at(0);

  // Changes the status of the task, depending on which card lane container it was dropped on
  switch (event.target.id) {
    // Dropped on the "To do" card lane
    case "todo-cards-box":
      droppedTaskItem.status = "To do";
      break;
    // Dropped on the "In progress" card lane
    case "in-progress-cards-box":
      droppedTaskItem.status = "In progress";
      break;
    // Dropped on the "Done" card lane
    default:
      droppedTaskItem.status = "Done";
      break;
  }

  // Changes are saved to local storage
  saveTasks();

  // The updated task list is retrived from local storage
  loadTasks();

  // Card lanes are refreshed
  renderCardLanes();
}

// Todo: when the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
  // Card lane containers are made droppable
  toDoCardsLaneBox.droppable({
    drop: handleDrop,
  });
  inProgressCardsLaneBox.droppable({
    drop: handleDrop,
  });
  doneCardsLaneBox.droppable({
    drop: handleDrop,
  });

  // Tasks are loaded from local storage
  loadTasks();

  // Card lanes are rendered
  renderCardLanes();
  addTaskButton.on("click", handleAddTask);
});
