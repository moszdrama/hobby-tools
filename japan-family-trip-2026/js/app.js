// Modal functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

function closeModalOnBackdrop(event, modalId) {
    if (event.target.id === modalId) {
        closeModal(modalId);
    }
}

// Close on Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const activeModals = document.querySelectorAll('.modal-overlay.active');
        activeModals.forEach(m => m.classList.remove('active'));
        document.body.style.overflow = 'auto';
    }
});

// ================= TASK MANAGER (LOCALSTORAGE) =================
const STORAGE_STATUS_KEY = 'japan_trip_2026_tasks';
const STORAGE_CUSTOM_KEY = 'japan_trip_2026_custom_tasks';

const DEFAULT_TASKS = {
    1: [
        { id: 'task_d1_bag', text: 'รับกระเป๋าเดินทางครบ 5 ใบที่สายพานสนามบินนาริตะ', critical: true },
        { id: 'task_d1_subway', text: 'สแกนรับตั๋ว <b>Tokyo Subway Ticket 72 Hours (5 ใบ)</b> ที่ตู้สีแดงในสนามบินนาริตะ', critical: true },
        { id: 'task_d1_car_etc', text: 'รับรถ Nissan Serena + เช็คบัตร <b>ETC</b> เสียบในช่องอ่านบัตรของรถเรียบร้อย', critical: true },
        { id: 'task_d1_car_check', text: 'ถ่ายรูป/วิดีโอตรวจรอยรอบคันรถร่วมกับพนักงาน Nippon Rent-A-Car', critical: true },
        { id: 'task_d1_rest_e20', text: 'แวะพักรถมื้อเที่ยงที่ <b>EXPASA Dangozaka SA (บนสาย E20)</b>', critical: true },
        { id: 'task_d1_supermarket', text: 'แวะซูเปอร์มาร์เก็ต Ogino ซื้อผลไม้/เสบียงก่อนเข้าบ้านพัก Minami', critical: false }
    ],
    2: [
        { id: 'task_d2_checkout', text: 'เช็คเอาท์จากบ้านพัก Lake Kawaguch Cottage Minami ไม่ลืมสิ่งของ', critical: false },
        { id: 'task_d2_hotel_drop', text: '<b>แวะส่งคุณพ่อคุณแม่และกระเป๋า 5 ใบที่โรงแรม Sakura Cross ก่อน</b>', critical: true },
        { id: 'task_d2_gas', text: '<b>เติมน้ำมันเต็มถัง "Regular" (หัวจ่ายสีแดง)</b> ที่ปั๊มใกล้ Asakusa + เก็บใบเสร็จ', critical: true },
        { id: 'task_d2_car_return', text: '<b>คืนรถที่ Nippon Rent-A-Car สาขา TX Asakusa & เคลียร์ค่าทางด่วนบัตร ETC</b>', critical: true },
        { id: 'task_d2_subway_start', text: '<b>สอดบัตร Tokyo Subway Ticket 72 Hours</b> เริ่มใช้งานครั้งแรกที่สถานี Asakusa / Tawaramachi', critical: true }
    ],
    3: [
        { id: 'task_d3_subway_pass', text: 'พกบัตร Tokyo Subway Ticket 72 Hours ติดตัวทุกคน', critical: true },
        { id: 'task_d3_buffet_rokkasen', text: '<b>ไปทานมื้อพิเศษบุฟเฟต์วากิว Rokkasen Shinjuku</b> เวลา 19:00 น. (เตรียมชื่อผู้จอง)', critical: true }
    ],
    4: [
        { id: 'task_d4_pack', text: 'จัดกระเป๋าเดินทาง 5 ใบและชั่งน้ำหนักสัมภาระเตรียมบินกลับ', critical: true },
        { id: 'task_d4_passport', text: 'เช็คพาสปอร์ตตัวจริง 5 เล่ม และเอกสารเดินทางให้พร้อม', critical: true }
    ],
    5: [
        { id: 'task_d5_hotel_out', text: 'เช็คเอาท์จากโรงแรม Sakura Cross Hotel นำกระเป๋า 5 ใบไปฝากที่สถานี Keisei Ueno', critical: true },
        { id: 'task_d5_skyliner', text: '<b>สแกน QR Code รับตั๋ว Keisei Skyliner (5 ใบ)</b> ที่ตู้สีฟ้าสถานี Keisei Ueno (รอบ 11:00 น. นั่งติดกัน)', critical: true },
        { id: 'task_d5_taxfree', text: 'ช้อปปิ้งตึกม่วง Takeya (พกพาสปอร์ตตัวจริงสำหรับทำ Tax-Free)', critical: false },
        { id: 'task_d5_train', text: 'ขึ้นรถไฟ Keisei Skyliner รอบ 11:00 น. นั่งตรงถึงสนามบินนาริตะ 11:41 น.', critical: true },
        { id: 'task_d5_checkin', text: 'เช็คอิน โหลดสัมภาระ 5 ใบ และขึ้นเครื่องบินเวลา 15:00 น.', critical: true }
    ]
};

const DAY_TITLES = {
    1: '🍁 Day 1: ศุกร์ที่ 9 ต.ค. (นาริตะ ➔ ฟูจิ)',
    2: '🍁 Day 2: เสาร์ที่ 10 ต.ค. (ฟูจิ ➔ คืนรถ Asakusa ➔ โตเกียว)',
    3: '🍁 Day 3: อาทิตย์ที่ 11 ต.ค. (วัดอาซากุสะ ➔ บุฟเฟต์ Rokkasen)',
    4: '🍁 Day 4: จันทร์ที่ 12 ต.ค. (ชิบูย่า ➔ Ueno Sakura Terrace)',
    5: '🍁 Day 5: อังคารที่ 13 ต.ค. (Keisei Skyliner ➔ สนามบินนาริตะ)'
};

let currentActiveTab = 'all';

function getCustomTasks() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_CUSTOM_KEY)) || {};
    } catch (e) {
        return {};
    }
}

function saveCustomTasks(customTasks) {
    localStorage.setItem(STORAGE_CUSTOM_KEY, JSON.stringify(customTasks));
}

function getTaskStatuses() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_STATUS_KEY)) || {};
    } catch (e) {
        return {};
    }
}

function saveTaskStatuses(statuses) {
    localStorage.setItem(STORAGE_STATUS_KEY, JSON.stringify(statuses));
}

function openTaskModal(day) {
    if (day && day !== 'all') {
        switchTaskTab(day);
    } else {
        switchTaskTab('all');
    }
    openModal('modal-tasks');
}

function switchTaskTab(tab) {
    currentActiveTab = tab;
    // update tab buttons
    const tabButtons = document.querySelectorAll('.task-tab-btn');
    tabButtons.forEach(btn => {
        const isAll = tab === 'all' && btn.textContent.includes('ทั้งหมด');
        const isDay = btn.textContent.trim() === ('Day ' + tab);
        if (isAll || isDay) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    renderTaskGroups();
}

function toggleTask(taskId) {
    const statuses = getTaskStatuses();
    statuses[taskId] = !statuses[taskId];
    saveTaskStatuses(statuses);
    renderTaskGroups();
    updateAllCounters();
}

function addCustomTask(day) {
    const input = document.getElementById('task-add-input-' + day);
    if (!input) return;
    const text = input.value.trim();
    if (!text) {
        input.focus();
        return;
    }

    const customTasks = getCustomTasks();
    if (!customTasks[day]) customTasks[day] = [];
    const newId = 'custom_' + day + '_' + Date.now();
    customTasks[day].push({
        id: newId,
        text: text,
        critical: false,
        custom: true
    });

    saveCustomTasks(customTasks);
    input.value = '';
    renderTaskGroups();
    updateAllCounters();
}

function deleteCustomTask(day, taskId) {
    if (!confirm('ต้องการลบ Task นี้ใช่หรือไม่?')) return;
    const customTasks = getCustomTasks();
    if (customTasks[day]) {
        customTasks[day] = customTasks[day].filter(t => t.id !== taskId);
        saveCustomTasks(customTasks);
    }
    const statuses = getTaskStatuses();
    delete statuses[taskId];
    saveTaskStatuses(statuses);

    renderTaskGroups();
    updateAllCounters();
}

function resetAllTaskChecks() {
    if (!confirm('ต้องการล้างเครื่องหมายติ๊กถูกทั้งหมดใช่หรือไม่? (รายการสิ่งที่ต้องทำจะยังคงอยู่)')) return;
    localStorage.removeItem(STORAGE_STATUS_KEY);
    renderTaskGroups();
    updateAllCounters();
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function renderTaskGroups() {
    const container = document.getElementById('modal-task-body');
    if (!container) return;

    const customTasks = getCustomTasks();
    const statuses = getTaskStatuses();

    let html = '';
    const daysToShow = (currentActiveTab === 'all') ? [1, 2, 3, 4, 5] : [parseInt(currentActiveTab)];

    daysToShow.forEach(day => {
        const defaultList = DEFAULT_TASKS[day] || [];
        const customList = customTasks[day] || [];
        const allList = [...defaultList, ...customList];

        let dayCompleted = 0;
        allList.forEach(t => {
            if (statuses[t.id]) dayCompleted++;
        });

        html += `
            <div class="task-day-group">
                <div class="task-day-group-header">
                    <span>${DAY_TITLES[day]}</span>
                    <span class="task-day-counter">${dayCompleted} / ${allList.length} เสร็จแล้ว</span>
                </div>
                <ul class="task-list">
        `;

        if (allList.length === 0) {
            html += `<li style="font-size: 0.85rem; color: #94a3b8; padding: 6px 0;">ยังไม่มี Task ในวันนี้</li>`;
        } else {
            allList.forEach(task => {
                const isChecked = !!statuses[task.id];
                const completedClass = isChecked ? 'completed' : '';
                const tagBadge = task.critical ? `<span class="task-tag-badge task-tag-crit">⚡ สำคัญ</span>` : (task.custom ? `<span class="task-tag-badge task-tag-custom">✏️ เพิ่มเอง</span>` : '');
                const delBtn = task.custom ? `<button type="button" class="task-del-btn" title="ลบ Task" onclick="event.stopPropagation(); deleteCustomTask(${day}, '${task.id}')">🗑️</button>` : '';
                const displayText = task.custom ? escapeHtml(task.text) : task.text;

                html += `
                    <li class="task-item ${completedClass}" onclick="toggleTask('${task.id}')">
                        <input type="checkbox" id="${task.id}" class="task-checkbox" ${isChecked ? 'checked' : ''} onclick="event.stopPropagation(); toggleTask('${task.id}')">
                        <span class="task-text">${displayText}</span>
                        ${tagBadge}
                        ${delBtn}
                    </li>
                `;
            });
        }

        html += `
                </ul>
                <!-- Add Custom Task Form -->
                <div class="task-add-box">
                    <input type="text" id="task-add-input-${day}" class="task-add-input" placeholder="➕ เพิ่ม Task ใน Day ${day} เช่น ซื้อของฝาก, แวะ 7-Eleven..." onkeydown="if(event.key==='Enter'){ addCustomTask(${day}); event.preventDefault(); }">
                    <button type="button" class="task-add-btn" onclick="addCustomTask(${day})">+ เพิ่ม</button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

function updateAllCounters() {
    const customTasks = getCustomTasks();
    const statuses = getTaskStatuses();

    let totalAll = 0;
    let completedAll = 0;

    for (let day = 1; day <= 5; day++) {
        const defaultList = DEFAULT_TASKS[day] || [];
        const customList = customTasks[day] || [];
        const allList = [...defaultList, ...customList];

        let dayCompleted = 0;
        allList.forEach(t => {
            totalAll++;
            if (statuses[t.id]) {
                dayCompleted++;
                completedAll++;
            }
        });

        // Update day counters in day header
        const dayCounterEls = document.querySelectorAll(`.day-task-counter[data-day="${day}"]`);
        dayCounterEls.forEach(el => {
            el.textContent = `${dayCompleted}/${allList.length}`;
        });

        // Update day summaries in timeline banner
        const daySummaryEls = document.querySelectorAll(`.day-task-summary[data-day="${day}"]`);
        daySummaryEls.forEach(el => {
            el.textContent = `${dayCompleted}/${allList.length} เรียบร้อย`;
        });
    }

    const percent = totalAll > 0 ? Math.round((completedAll / totalAll) * 100) : 0;

    // Top Progress Card
    const bar = document.getElementById('progress-bar');
    const text = document.getElementById('progress-text');
    if (bar && text) {
        bar.style.width = percent + '%';
        text.textContent = `${completedAll} / ${totalAll} รายการ (${percent}%)`;
        if (completedAll === totalAll && totalAll > 0) {
            text.textContent = `🎉 ครบทุกรายการแล้ว (${completedAll}/${totalAll})`;
        }
    }

    // Modal Progress Bar
    const modalBar = document.getElementById('modal-progress-bar');
    const modalText = document.getElementById('modal-progress-text');
    if (modalBar && modalText) {
        modalBar.style.width = percent + '%';
        modalText.textContent = `${completedAll} / ${totalAll} รายการ (${percent}%)`;
    }

    // FAB Badge
    const fabBadge = document.getElementById('fab-task-count');
    if (fabBadge) {
        fabBadge.textContent = `${completedAll}/${totalAll}`;
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    renderTaskGroups();
    updateAllCounters();
});
