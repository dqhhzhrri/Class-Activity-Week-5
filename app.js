// State aplikasi (array of objects) & Filter aktif saat ini
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'semua';

// Seleksi Elemen DOM
const taskForm = document.getElementById('task-form');
const taskTitleInput = document.getElementById('task-title');
const taskCourseSelect = document.getElementById('task-course');
const taskDeadlineInput = document.getElementById('task-deadline');
const errorMsg = document.getElementById('error-msg');
const taskList = document.getElementById('task-list');
const taskCounter = document.getElementById('task-counter');
const filterBtns = document.querySelectorAll('.filter-btn');

// Fungsi utama untuk menyimpan ke localStorage dan merender ulang tampilan
function render() {
    // Simpan ke localStorage & urutkan berdasarkan deadline terdekat (Bonus)
    tasks.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    localStorage.setItem('tasks', JSON.stringify(tasks));

    // Kosongkan list DOM sebelum diisi ulang
    taskList.innerHTML = '';

    // Filter tugas berdasarkan status (Semua / Aktif / Selesai)
    const filteredTasks = tasks.filter(task => {
        if (currentFilter === 'aktif') return !task.selesai;
        if (currentFilter === 'selesai') return task.selesai;
        return true; // 'semua'
    });

    // Pesan jika daftar kosong
    if (filteredTasks.length === 0) {
        taskList.innerHTML = `<li class="empty-state">Tidak ada tugas yang ditampilkan.</li>`;
    } else {
        filteredTasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item ${task.selesai ? 'completed' : ''}`;
            li.dataset.id = task.id;

            // Aman dari XSS: Menggunakan textContent untuk teks dari user
            const taskInfo = document.createElement('div');
            taskInfo.className = 'task-info';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = task.selesai;
            checkbox.className = 'toggle-complete';

            const taskDetails = document.createElement('div');
            taskDetails.className = 'task-details';

            const titleSpan = document.createElement('span');
            titleSpan.className = 'task-title-text';
            titleSpan.textContent = task.judul; // AMAN (Mencegah XSS)

            const metaSpan = document.createElement('span');
            metaSpan.className = 'task-meta';
            metaSpan.textContent = `${task.matkul} • deadline ${task.deadline}`; // AMAN

            taskDetails.appendChild(titleSpan);
            taskDetails.appendChild(metaSpan);
            taskInfo.appendChild(checkbox);
            taskInfo.appendChild(taskDetails);

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.textContent = '✕';
            deleteBtn.title = 'Hapus Tugas';

            li.appendChild(taskInfo);
            li.appendChild(deleteBtn);
            taskList.appendChild(li);
        });
    }

    // Update Counter (Jumlah tugas aktif)
    const activeCount = tasks.filter(task => !task.selesai).length;
    taskCounter.textContent = `${activeCount} tugas aktif`;
}

// 1. Event listener Form Tambah Tugas dengan Validasi
taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    errorMsg.textContent = '';

    const judul = taskTitleInput.value.trim();
    const matkul = taskCourseSelect.value;
    const deadline = taskDeadlineInput.value;

    // Validasi: judul minimal 3 karakter & deadline wajib diisi
    if (judul.length < 3) {
        errorMsg.textContent = 'Judul tugas minimal harus 3 karakter.';
        return;
    }
    if (!deadline) {
        errorMsg.textContent = 'Deadline wajib diisi.';
        return;
    }

    // Tambah objek baru ke state
    const newTask = {
        id: Date.now().toString(),
        judul: judul,
        matkul: matkul,
        deadline: deadline,
        selesai: false
    };

    tasks.push(newTask);

    // Reset form
    taskTitleInput.value = '';
    taskDeadlineInput.value = '';
    errorMsg.textContent = '';

    render();
});

// 3. Event Delegation di <ul> untuk checkbox (selesai) dan tombol hapus
taskList.addEventListener('click', (e) => {
    const target = e.target;
    const taskItem = target.closest('.task-item');
    if (!taskItem) return;

    const taskId = taskItem.dataset.id;

    // Jika tombol hapus diklik
    if (target.classList.contains('delete-btn')) {
        tasks = tasks.filter(task => task.id !== taskId);
        render();
    }

    // Jika checkbox selesai diklik
    if (target.classList.contains('toggle-complete')) {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            task.selesai = target.checked;
            render();
        }
    }
});

// 4. Event listener untuk Tombol Filter (Semua / Aktif / Selesai)
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('on'));
        btn.classList.add('on');
        currentFilter = btn.dataset.filter;
        render();
    });
});

// Panggilan pertama saat halaman dimuat
render();