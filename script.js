document.addEventListener("DOMContentLoaded", () => {
    const taskForm = document.getElementById("task-form");
    const taskTitleInput = document.getElementById("task-title");
    const taskDescInput = document.getElementById("task-desc");
    const taskPriorityInput = document.getElementById("task-priority");
    const taskIdInput = document.getElementById("task-id");
    
    const formTitle = document.getElementById("form-title");
    const submitBtn = document.getElementById("submit-btn");
    const cancelBtn = document.getElementById("cancel-btn");
    const taskBoard = document.getElementById("task-board");
    const filterButtons = document.querySelectorAll(".filter-btn");

    // Obtener tareas previas de localStorage o empezar vacío [C - Leer inicial]
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    let currentFilter = "all";

    // --- FUNCIONES CRUD ---

    // Guardar / Actualizar Tarea [C - Create / U - Update]
    taskForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const id = taskIdInput.value;
        const taskData = {
            title: taskTitleInput.value,
            desc: taskDescInput.value,
            priority: taskPriorityInput.value,
            completed: false
        };

        if (id) {
            // Modo Edición (Update)
            tasks = tasks.map(t => t.id === parseInt(id) ? { ...t, ...taskData } : t);
        } else {
            // Modo Creación (Create)
            taskData.id = Date.now(); // ID único basado en tiempo
            tasks.push(taskData);
        }

        saveAndRender();
        resetForm();
    });

    // Renderizar Tablero [R - Read]
    function renderTasks() {
        taskBoard.innerHTML = "";

        // Filtrar tareas según selección del usuario
        const filteredTasks = tasks.filter(task => {
            if (currentFilter === "alta") return task.priority === "alta" && !task.completed;
            if (currentFilter === "completada") return task.completed;
            return true; // "all"
        });

        if (filteredTasks.length === 0) {
            taskBoard.innerHTML = `<p style="color: var(--text-muted); grid-column: 1/-1; text-align: center; padding: 2rem;">No hay tareas en esta categoría 🚀</p>`;
            return;
        }

        filteredTasks.forEach(task => {
            const card = document.createElement("div");
            card.className = `task-card ${task.completed ? 'completed' : ''}`;
            
            card.innerHTML = `
                <span class="badge ${task.priority}">${task.priority}</span>
                <h3>${task.title}</h3>
                <p>${task.desc || 'Sin descripción.'}</p>
                <div class="card-actions">
                    <button class="btn-complete" onclick="toggleComplete(${task.id})">✔</button>
                    <button class="btn-edit" onclick="startEdit(${task.id})">✏</button>
                    <button class="btn-delete" onclick="deleteTask(${task.id})">🗑</button>
                </div>
            `;
            taskBoard.appendChild(card);
        });
    }

    // Guardar en almacenamiento del navegador
    function saveAndRender() {
        localStorage.setItem("tasks", JSON.stringify(tasks));
        renderTasks();
    }

    // Borrar Tarea [D - Delete]
    window.deleteTask = (id) => {
        tasks = tasks.filter(t => t.id !== id);
        saveAndRender();
        resetForm();
    };

    // Cambiar Estado Completado (Update alternativo)
    window.toggleComplete = (id) => {
        tasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
        saveAndRender();
    };

    // Cargar datos en formulario para editar [U - Preparación de Update]
    window.startEdit = (id) => {
        const task = tasks.find(t => t.id === id);
        if (!task) return;

        taskIdInput.value = task.id;
        taskTitleInput.value = task.title;
        taskDescInput.value = task.desc;
        taskPriorityInput.value = task.priority;

        formTitle.textContent = "✏ Editar Tarea";
        submitBtn.textContent = "Actualizar";
        cancelBtn.classList.remove("hidden");
    };

    // --- EXTRAS DE INTERFAZ ---

    function resetForm() {
        taskForm.reset();
        taskIdInput.value = "";
        formTitle.textContent = "⚡ Nueva Tarea";
        submitBtn.textContent = "Guardar Tarea";
        cancelBtn.classList.add("hidden");
    }

    cancelBtn.addEventListener("click", resetForm);

    // Manejo de filtros estéticos
    filterButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            filterButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            currentFilter = btn.getAttribute("data-filter");
            renderTasks();
        });
    });

    // Carga inicial de datos
    renderTasks();
});
