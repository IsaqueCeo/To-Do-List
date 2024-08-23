const taskInput = document.getElementById('task-input');
const dueDateInput = document.getElementById('due-date');
const categorySelect = document.getElementById('category-select');
const addTaskBtn = document.getElementById('add-task-btn');
const taskList = document.getElementById('task-list');
const taskCounter = document.getElementById('task-counter');
const editModal = document.getElementById('edit-modal');
const editTaskInput = document.getElementById('edit-task-input');
const editDueDateInput = document.getElementById('edit-due-date');
const darkModeToggle = document.getElementById('dark-mode-toggle');
const progress = document.getElementById('progress');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let editTaskIndex = null;

// Adiciona eventos aos botões de navegação
document.getElementById('nav-all').addEventListener('click', () => renderTasks('all'));
document.getElementById('nav-pending').addEventListener('click', () => renderTasks('pending'));
document.getElementById('nav-completed').addEventListener('click', () => renderTasks('completed'));
document.getElementById('nav-today').addEventListener('click', () => renderTasks('today'));

addTaskBtn.addEventListener('click', addTask);
document.getElementById('filter-all').addEventListener('click', () => filterTasks('all'));
document.getElementById('filter-pending').addEventListener('click', () => filterTasks('pending'));
document.getElementById('filter-completed').addEventListener('click', () => filterTasks('completed'));
document.getElementById('filter-today').addEventListener('click', () => filterTasks('today'));
document.getElementById('clear-all').addEventListener('click', clearAllTasks);
darkModeToggle.addEventListener('click', toggleDarkMode);
document.querySelector('.close').addEventListener('click', () => {
    editModal.style.display = 'none';
});
document.getElementById('save-edit-btn').addEventListener('click', saveTaskEdits);

// Função para adicionar uma tarefa
function addTask() {
    const taskText = taskInput.value.trim();
    const taskDueDate = dueDateInput.value;
    const taskCategory = categorySelect.value;

    if (taskText !== "") {
        const task = {
            text: taskText,
            dueDate: taskDueDate,
            category: taskCategory,
            completed: false
        };
        tasks.push(task);
        saveTasks();
        renderTasks();
        taskInput.value = "";
        dueDateInput.value = "";
    }
}

// Renderiza as tarefas com base no filtro aplicado
function renderTasks(filter = 'all') {
    taskList.innerHTML = '';
    const filteredTasks = tasks.filter(task => {
        const isToday = task.dueDate === new Date().toISOString().split('T')[0];
        if (filter === 'all') return true;
        if (filter === 'pending') return !task.completed;
        if (filter === 'completed') return task.completed;
        if (filter === 'today') return isToday && !task.completed;
    });

    filteredTasks.forEach((task, index) => {
        const li = document.createElement('li');
        li.draggable = true;
        li.textContent = `${task.text} [${task.category}] - ${task.dueDate ? `Para: ${task.dueDate}` : 'Sem data'}`;

        if (task.completed) {
            li.classList.add('completed');
        }

        li.addEventListener('click', () => toggleCompleteTask(index));
        li.addEventListener('dblclick', () => openEditModal(index));
        li.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            removeTask(index);
        });

        li.addEventListener('dragstart', (e) => handleDragStart(e, index));
        li.addEventListener('dragover', handleDragOver);
        li.addEventListener('drop', (e) => handleDrop(e, index));

        taskList.appendChild(li);
    });

    updateTaskCounter();
    updateProgressBar();
}

// Alterna o estado de conclusão da tarefa
function toggleCompleteTask(index) {
    tasks[index].completed = !tasks[index].completed;
    saveTasks();
    renderTasks();
}

// Remove uma tarefa
function removeTask(index) {
    tasks.splice(index, 1);
    saveTasks();
    renderTasks();
}

// Abre o modal para editar uma tarefa
function openEditModal(index) {
    editTaskIndex = index;
    editTaskInput.value = tasks[index].text;
    editDueDateInput.value = tasks[index].dueDate || '';
    editModal.style.display = 'block';
}

// Salva as alterações feitas na tarefa
function saveTaskEdits() {
    if (editTaskIndex !== null) {
        tasks[editTaskIndex].text = editTaskInput.value.trim();
        tasks[editTaskIndex].dueDate = editDueDateInput.value;
        saveTasks();
        renderTasks();
        editModal.style.display = 'none';
    }
}

// Filtra as tarefas com base no filtro selecionado
function filterTasks(filter) {
    renderTasks(filter);
}

// Limpa todas as tarefas
function clearAllTasks() {
    tasks = [];
    saveTasks();
    renderTasks();
}

// Salva as tarefas no localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Atualiza o contador de tarefas
function updateTaskCounter() {
    taskCounter.textContent = `Total de Tarefas: ${tasks.length}`;
}

// Atualiza a barra de progresso
function updateProgressBar() {
    const completedTasks = tasks.filter(task => task.completed).length;
    const totalTasks = tasks.length;
    const progressPercentage = totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100;
    progress.style.width = `${progressPercentage}%`;
}

// Alterna o modo escuro/claro
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    darkModeToggle.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
}

// Manipula o início do arrasto
function handleDragStart(e, index) {
    e.dataTransfer.setData('text/plain', index);
}

// Manipula o arrasto sobre outro item
function handleDragOver(e) {
    e.preventDefault();
}

// Manipula a soltura do item arrastado
function handleDrop(e, index) {
    e.preventDefault();
    const draggedIndex = e.dataTransfer.getData('text/plain');
    if (draggedIndex !== index.toString()) {
        const draggedTask = tasks.splice(draggedIndex, 1)[0];
        tasks.splice(index, 0, draggedTask);
        saveTasks();
        renderTasks();
    }
}

// Renderiza as tarefas ao carregar a página
renderTasks();
