// Current Date
const currentDate = dayjs().format("YYYY-MM-DD");
const warningDate = dayjs().add(2, "day").format("YYYY-MM-DD");

// Create task button
const createTaskButton = $("#create-task-button");
// Task form
const taskForm = $("#task-form");
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

function handleCreate() {
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
  taskForm.modal("hide");
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
  // Saves the task list array to local storage
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

    // Card's warning style is applied when the task's due date is 2 days ahead or less from the current date
    // And if the card's status is not equal to "Done"
    if (
      warningDate >= card.dueDate &&
      currentDate <= card.dueDate &&
      card.status !== "Done"
    ) {
      newCard.attr("class", "card bg-warning");
    }
    // Card's danger style is applied when the due date is past the current date
    // And if the card's status is not equal to "Done"
    else if (currentDate > card.dueDate && card.status !== "Done") {
      newCard.attr("class", "card bg-danger text-light");
    }
    // Card's normal style is applied when the due date is 3 days ahead or more from the current date
    else {
      newCard.attr("class", "card");
    }

    // It is given a z index, so that it is not covered by other elements
    newCard.css("z-index", "1");

    // Card's body
    const newCardBody = $("<div>");
    newCardBody.attr("class", "card-body");

    // Card's title element is created
    const newCardTitle = $("<div>");
    newCardTitle.attr("class", "card-header fs-4");
    newCardTitle.text(card.title);

    // Card's description element is created
    const newCardDescription = $("<p>");
    newCardDescription.attr("class", "card-text");
    newCardDescription.text(card.description);

    // Card's due date element is created
    const newCardDueDate = $("<p>");
    newCardDueDate.attr("class", "card-text");
    newCardDueDate.text(card.dueDate);

    // Card's delete button
    const newDeleteButton = $("<button>");
    newDeleteButton.attr("class", "btn btn-dark");
    newDeleteButton.text("Delete");
    newDeleteButton.on("click", () => handleDelete(card.id));

    // Card's elements are appended to the card body
    newCardBody.append(newCardDescription);
    newCardBody.append(newCardDueDate);
    newCardBody.append(newDeleteButton);

    // Card's header and body are appended to the card element
    newCard.append(newCardTitle);
    newCard.append(newCardBody);

    // Card is appended to the given card lane
    cardLane.append(newCard);
  }
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
  createTaskButton.on("click", handleCreate);

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
});
