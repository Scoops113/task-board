document.addEventListener('DOMContentLoaded', function () {
    // Retrieve tasks and nextId from localStorage
    let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
    let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

    // Function to generate a unique task id
    function generateTaskId() {
        return nextId++;
    }

    // Function to create a task card
    function createTaskCard(task) {
        const currentDate = dayjs();
        const deadlineDate = dayjs(task.deadline);
        let colorClass = '';

        // Determine the color of the task card based on deadline proximity
        if (currentDate.isAfter(deadlineDate, 'day')) {
            colorClass = 'bg-danger'; // Red for overdue tasks
        } else if (currentDate.isSame(deadlineDate.subtract(1, 'day'), 'day')) {
            colorClass = 'bg-warning'; // Yellow for tasks due tomorrow
        } else if (currentDate.isSame(deadlineDate, 'day')) {
            colorClass = 'bg-warning'; // Yellow for tasks due today
        } else {
            colorClass = 'bg-success'; // Green for tasks due later
        }

        const card = `
            <div class="task-card ${colorClass}" id="task-${task.id}" draggable="true">
                <h3>${task.title}</h3>
                <p>${task.description}</p>
                <p>Deadline: ${task.deadline}</p>
                <button class="delete-btn" data-id="${task.id}">Delete</button>
            </div>
        `;
        return card;
    }

    // Function to render the task list and make cards draggable
    function renderTaskList() {
        const notStartedTasks = document.getElementById('todo-cards');
        const inProgressTasks = document.getElementById('in-progress-cards');
        const completedTasks = document.getElementById('done-cards');

        notStartedTasks.innerHTML = '';
        inProgressTasks.innerHTML = '';
        completedTasks.innerHTML = '';

        taskList.forEach(task => {
            const card = createTaskCard(task);
            if (task.status === 'not-started') {
                notStartedTasks.innerHTML += card;
            } else if (task.status === 'in-progress') {
                inProgressTasks.innerHTML += card;
            } else if (task.status === 'completed') {
                completedTasks.innerHTML += card;
            }
        });

        // Make task cards draggable
        $('.task-card').draggable({
            revert: true,
            revertDuration: 0,
            zIndex: 100,
            start: function () {
                $(this).css('transform', 'scale(1.1)');
            },
            stop: function () {
                $(this).css('transform', 'scale(1)');
            }
        });

        // Make lanes droppable
        $('.card-body').droppable({
            accept: '.task-card',
            drop: function(event, ui) {
                const taskId = ui.draggable.attr('id').split('-')[1];
                const targetLane = $(this).closest('.card').attr('id');
                handleDrop(taskId, targetLane);
            }
        });
    }

    // Function to handle adding a new task
    function handleAddTask(event) {
        event.preventDefault();
        const title = document.getElementById('title').value;
        const description = document.getElementById('description').value;
        const deadline = document.getElementById('deadline').value;

        const task = {
            id: generateTaskId(),
            title: title,
            description: description,
            deadline: deadline,
            status: 'not-started'
        };

        taskList.push(task);
        localStorage.setItem("tasks", JSON.stringify(taskList)); // Save updated task list
        localStorage.setItem("nextId", nextId); // Save nextId

        renderTaskList();

        // Close modal
        $('#formModal').modal('hide');

        // Reset form
        document.getElementById('taskForm').reset();
    }

    // Function to handle deleting a task
    function handleDeleteTask(event) {
        const taskId = event.target.dataset.id;
        taskList = taskList.filter(task => task.id !== parseInt(taskId));
        localStorage.setItem("tasks", JSON.stringify(taskList));
        renderTaskList();
    }

    // Function to handle dropping a task into a new status lane
    function handleDrop(taskId, targetLane) {
        const taskIndex = taskList.findIndex(task => task.id === parseInt(taskId));
        if (taskIndex !== -1) {
            let newStatus;
            if (targetLane === 'in-progress') {
                newStatus = 'in-progress';
            } else if (targetLane === 'done') {
                newStatus = 'completed';
            } else {
                newStatus = 'not-started';
            }
            taskList[taskIndex].status = newStatus;
            localStorage.setItem("tasks", JSON.stringify(taskList));
            renderTaskList();
        }
    }

    // Event listener for form submission
    document.getElementById('taskForm').addEventListener('submit', handleAddTask);

    // Event listener for delete button
    document.addEventListener('click', function (event) {
        if (event.target.classList.contains('delete-btn')) {
            handleDeleteTask(event);
        }
    });

    // Initialize date picker
    $(function() {
        $("#deadline").datepicker();
    });

    // When the page loads, render the task list and make lanes droppable
    renderTaskList();
});
