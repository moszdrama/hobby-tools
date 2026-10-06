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
    0: [
        { id: 'task_d0_passport', text: 'ตรวจเช็คพาสปอร์ตตัวจริง 5 เล่ม (อายุการใช้งานเหลือมากกว่า 6 เดือน)', critical: true },
        { id: 'task_d0_idp', text: 'เตรียม <b>ใบขับขี่สากล (IDP 1949 เล่มสีเทา) + ใบขับขี่ไทย Smart Card</b> ของผู้ขับทุกคน', critical: true },
        { id: 'task_d0_vjw', text: 'กรอกข้อมูล <b>Visit Japan Web</b> (ตม. & ศุลกากร) ครบ 5 ท่าน + บันทึกภาพหน้าจอ QR Code เก็บไว้', critical: true },
        { id: 'task_d0_sim', text: 'ซื้อ <b>SIM Card / e-SIM ญี่ปุ่น</b> สำหรับเชื่อมต่อ Internet ตลอดทริป', critical: true },
        { id: 'task_d0_tickets', text: 'บันทึก Voucher / QR Code ตั๋ว <b>Tokyo Subway 72h</b> และ <b>Keisei Skyliner</b> (พิมพ์สำรอง 1 ชุด)', critical: true },
        { id: 'task_d0_money', text: 'แลกเงินสดเยน (JPY) สำหรับตู้กดน้ำ/ของกินเล่น/ค่าทางด่วน + เตรียม Travel Card / Credit Card', critical: false },
        { id: 'task_d0_medicine', text: 'เตรียมยาประจำตัว ยาสามัญ และของใช้ส่วนตัวจำเป็นสำหรับคุณพ่อคุณแม่', critical: false }
    ],
    1: [
        { id: 'task_d1_bag', text: 'รับกระเป๋าเดินทางครบ 5 ใบที่สายพานสนามบินนาริตะ', critical: true },
        { id: 'task_d1_subway', text: 'สแกนรับตั๋ว <b>Tokyo Subway Ticket 72 Hours (5 ใบ)</b> ที่ตู้สีแดงในสนามบินนาริตะ', critical: true },
        { id: 'task_d1_car_etc', text: 'รับรถ Toyota Sienta + เช็คบัตร <b>ETC</b> เสียบในช่องอ่านบัตรของรถเรียบร้อย', critical: true },
        { id: 'task_d1_car_check', text: 'ถ่ายรูป/วิดีโอตรวจรอยรอบคันรถร่วมกับพนักงาน Nippon Rent-A-Car', critical: true },
        { id: 'task_d1_rest_e20', text: 'แวะพักรถมื้อเที่ยงที่ <b>EXPASA Dangozaka SA (บนสาย E20)</b>', critical: true },
        { id: 'task_d1_supermarket', text: 'แวะซูเปอร์มาร์เก็ต Ogino ซื้อผลไม้/เสบียงก่อนเข้าบ้านพัก Minami', critical: false }
    ],
    2: [
        { id: 'task_d2_run', text: '<b>วิ่งเช้าตรู่เลียบทะเลสาบคาวากุจิโกะ</b> (06:00 - 07:30 น. รูทสวน Oishi Park ~5-6 กม. ชมวิวฟูจิยามเช้า)', critical: false },
        { id: 'task_d2_checkout', text: 'เช็คเอาท์จากบ้านพัก Lake Kawaguch Cottage Minami ไม่ลืมสิ่งของ', critical: false },
        { id: 'task_d2_hotel_drop', text: '<b>แวะส่งคุณพ่อคุณแม่และกระเป๋า 5 ใบที่โรงแรม Sakura Cross ก่อน</b>', critical: true },
        { id: 'task_d2_gas', text: '<b>เติมน้ำมันเต็มถัง "Regular" (หัวจ่ายสีแดง)</b> ที่ปั๊ม ENEOS Ueno Yamabushi-cho + เก็บใบเสร็จ', critical: true },
        { id: 'task_d2_car_return', text: '<b>คืนรถที่ Nippon Rent-A-Car สาขา TX Asakusa & เคลียร์ค่าทางด่วนบัตร ETC</b>', critical: true },
        { id: 'task_d2_subway_start', text: '<b>สอดบัตร Tokyo Subway Ticket 72 Hours</b> เริ่มใช้งานครั้งแรกที่สถานี Asakusa / Tawaramachi', critical: true }
    ],
    3: [
        { id: 'task_d3_subway_pass', text: 'พกบัตร Tokyo Subway Ticket 72 Hours ติดตัวทุกคน', critical: true },
        { id: 'task_d3_buffet_rokkasen', text: '<b>ไปทานมื้อพิเศษบุฟเฟต์วากิว Rokkasen Shinjuku</b> เวลา 19:00 น. (เตรียมชื่อผู้จอง)', critical: true }
    ],
    4: [
        { id: 'task_d4_run', text: '<b>วิ่งเช้าตรู่รอบพระราชวังโตเกียว</b> (06:00 - 07:30 น. ระยะทาง ~5 กม. สัมผัสบรรยากาศเช้าตรู่)', critical: false },
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
    0: '📋 Day 0: ก่อนวันเดินทาง (เตรียมตัว & เอกสารล่วงหน้า)',
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
    const daysToShow = (currentActiveTab === 'all') ? [0, 1, 2, 3, 4, 5] : [parseInt(currentActiveTab)];

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

    for (let day = 0; day <= 5; day++) {
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

// ================= INTERACTIVE DAILY MAP =================
const GMAPS_KEY_STORAGE = 'japan_trip_gmaps_api_key';

const DAY_LOCATIONS = {
    1: [
        {
            id: 'd1_narita',
            name: 'สนามบินนาริตะ & Nippon Rent-A-Car',
            time: '08:00 - 10:00',
            category: 'รับรถ & ตั๋ว',
            lat: 35.7653,
            lng: 140.3855,
            desc: 'รับกระเป๋า 5 ใบ, สแกน QR ตั๋ว Subway 72h (5 ใบ) และรับรถ Toyota Sienta พร้อมบัตร ETC',
            mapsUrl: 'https://maps.google.com/?q=Nippon+Rent-A-Car+Narita+Airport'
        },
        {
            id: 'd1_dangozaka',
            name: 'EXPASA Dangozaka SA (สาย E20)',
            time: '11:45 - 13:00',
            category: 'มื้อกลางวัน',
            lat: 35.6175,
            lng: 139.0682,
            desc: 'จุดพักรถใหญ่บนทางด่วน Chuo E20 มีศูนย์อาหาร ข้าวหน้าเนื้อโคชู ทงคัตสึ ราเมง คาเฟ่ และผลไม้สด',
            mapsUrl: 'https://maps.google.com/?q=Dangozaka+Service+Area+Downbound'
        },
        {
            id: 'd1_oishi',
            name: 'สวนโออิชิ (Oishi Park)',
            time: '13:45 - 15:15',
            category: 'ที่เที่ยว',
            lat: 35.5230,
            lng: 138.7456,
            desc: 'จุดชมวิวฟูจิริมทะเลสาบ พุ่มไม้โคเชียสีแดง ทางเดินราบเรียบ คาเฟ่ไอศกรีมบลูเบอร์รี่',
            mapsUrl: 'https://maps.google.com/?q=Oishi+Park+Kawaguchiko'
        },
        {
            id: 'd1_ogino',
            name: 'ซูเปอร์มาร์เก็ต OGINO Kawaguchiko',
            time: '15:30 - 16:30',
            category: 'ช้อปปิ้ง',
            lat: 35.5029,
            lng: 138.7592,
            desc: 'ซื้อผลไม้สด (องุ่นไซมัสคัส/พีช), ของสด, เครื่องดื่ม และขนมไปทานที่บ้านพัก',
            mapsUrl: 'https://maps.google.com/?q=OGINO+Kawaguchiko+Store'
        },
        {
            id: 'd1_cottage',
            name: 'Lake Kawaguch Cottage Minami',
            time: '16:30 - 17:30',
            category: 'ที่พัก',
            lat: 35.5265,
            lng: 138.7410,
            desc: 'เช็คอินบ้านพักส่วนตัวริมทะเลสาบคาวากุจิโกะ บรรยากาศเงียบสงบ วิวธรรมชาติ',
            mapsUrl: 'https://maps.google.com/?q=Lake+Kawaguch+Cottage+Minami'
        },
        {
            id: 'd1_fudou',
            name: 'Houtou Fudou Higashikoiten',
            time: '18:00 - 19:30',
            category: 'มื้อเย็น',
            lat: 35.5057,
            lng: 138.7758,
            desc: 'บะหมี่โฮโตะร้อนๆ ซุปผักและฟักทองในหม้อเหล็กโบราณ ปลอดอาหารทะเล ทานได้ 100%',
            mapsUrl: 'https://maps.google.com/?q=Houtou+Fudou+Higashikoiten'
        }
    ],
    2: [
        {
            id: 'd2_kawaguchiko_run',
            name: 'วิ่งเช้าตรู่: ริมทะเลสาบคาวากุจิโกะ (รูทสวน Oishi Park)',
            time: '06:00 - 07:30',
            category: 'กิจกรรมเช้า',
            lat: 35.5230,
            lng: 138.7450,
            desc: 'วิ่งรับลมหนาวยามเช้าเลียบทะเลสาบฝั่งเหนือ ชมวิวฟูจิสะท้อนน้ำ เส้นทางเรียบ ปลอดภัย มีทางเท้าตลอดสาย',
            mapsUrl: 'https://maps.google.com/?q=Oishi+Park+Kawaguchiko'
        },
        {
            id: 'd2_oshino',
            name: 'หมู่บ้านน้ำใส Oshino Hakkai',
            time: '08:30 - 10:30',
            category: 'ที่เที่ยว',
            lat: 35.4601,
            lng: 138.8328,
            desc: 'ชมบ่อน้ำใสศักดิ์สิทธิ์ 8 บ่อ ทางเดินราบ ชิมโมจิย่างใบโยโมกิและมันเผาหวาน',
            mapsUrl: 'https://maps.google.com/?q=Oshino+Hakkai'
        },
        {
            id: 'd2_boat',
            name: 'เรือนำเที่ยว Appare Kawaguchiko',
            time: '10:45 - 11:45',
            category: 'ล่องเรือ',
            lat: 35.5050,
            lng: 138.7700,
            desc: 'นั่งเรือชมวิวฟูจิ 360 องศา 20 นาที สบาย ไม่ต้องเดิน',
            mapsUrl: 'https://maps.google.com/?q=Kawaguchiko+Sightseeing+Boat+Appare'
        },
        {
            id: 'd2_rikyu',
            name: 'หมูทอดทงคัตสึ Tonkatsu Rikyu',
            time: '12:00 - 13:15',
            category: 'มื้อกลางวัน',
            lat: 35.5098,
            lng: 138.7610,
            desc: 'ร้านหมูทอดทงคัตสึชื่อดังริมทะเลสาบ กรอบนอกนุ่มใน เติมข้าวและซุปได้ ปลอดอาหารทะเล',
            mapsUrl: 'https://maps.google.com/?q=Tonkatsu+Rikyu+Kawaguchiko'
        },
        {
            id: 'd2_hotel_drop',
            name: 'โรงแรม Sakura Cross Hotel Ueno-Iriya',
            time: '15:30 - 16:00',
            category: 'ที่พัก',
            lat: 35.72104541045482,
            lng: 139.78644795162737,
            desc: 'แวะส่งคุณพ่อคุณแม่และกระเป๋า 5 ใบที่โรงแรมก่อนนำรถไปคืนที่สาขา Asakusa',
            mapsUrl: 'https://maps.google.com/?q=Sakura+Cross+Hotel+Ueno-Iriya+Annex'
        },
        {
            id: 'd2_gas_station',
            name: 'ปั๊มน้ำมัน ENEOS 上野山伏町SS',
            time: '16:00 - 16:15',
            category: 'เติมน้ำมัน',
            lat: 35.716849,
            lng: 139.785304,
            desc: 'เติมน้ำมัน Regular (หัวจ่ายสีแดง) เต็มถังก่อนคืนรถ บริการ Full Service (พนักงานเติมให้ แจ้ง "Regular Mantan") และเก็บใบเสร็จไว้แสดง',
            mapsUrl: 'https://www.google.com/maps/search/?api=1&query=ENEOS+%E4%B8%8A%E9%87%8E%E5%B1%B1%E4%BC%8F%E7%94%BA%EF%BD%93%EF%BD%93'
        },
        {
            id: 'd2_car_return',
            name: 'คืนรถ Nippon Rent-A-Car TX Asakusa',
            time: '16:15 - 16:45',
            category: 'คืนรถเช่า',
            lat: 35.7163,
            lng: 139.7917,
            desc: 'คืนรถ Toyota Sienta ที่สาขา Asakusa แสดงใบเสร็จค่าน้ำมัน พร้อมเคลียร์ค่าทางด่วนบัตร ETC',
            mapsUrl: 'https://maps.google.com/?q=Nippon+Rent-A-Car+TX+Asakusa'
        },
        {
            id: 'd2_ameyoko',
            name: 'ตลาดอาเมโยโกะ (Ameyoko)',
            time: '17:00 - 18:30',
            category: 'ช้อปปิ้ง',
            lat: 35.7107,
            lng: 139.7745,
            desc: 'เริ่มใช้บัตร Subway 72h จาก Asakusa นั่งมา Ueno เดินช้อปปิ้งขนม ของฝาก ผลไม้สด',
            mapsUrl: 'https://maps.google.com/?q=Ameyoko+Shopping+District'
        },
        {
            id: 'd2_motomura',
            name: 'กิวคัตสึ Gyukatsu Motomura Ueno',
            time: '18:30 - 20:00',
            category: 'มื้อเย็น',
            lat: 35.7118,
            lng: 139.7748,
            desc: 'เนื้อชุบแป้งทอดเตาหินส่วนตัว นุ่มละลายในปาก คนแพ้อาหารทะเลทานได้สบาย',
            mapsUrl: 'https://maps.google.com/?q=Gyukatsu+Motomura+Ueno'
        }
    ],
    3: [
        {
            id: 'd3_sensoji',
            name: 'วัดเซ็นโซจิ & ถนนนากามิเสะ (Sensoji)',
            time: '09:00 - 11:30',
            category: 'ที่เที่ยว',
            lat: 35.7148,
            lng: 139.7967,
            desc: 'ไหว้พระวัดอาซากุสะ โคมแดงคามินาริมง ชิมขนมโบราณ ซื้อของฝาก มีลิฟต์ขึ้นวิหาร',
            mapsUrl: 'https://maps.google.com/?q=Sens%C5%8D-ji+Temple'
        },
        {
            id: 'd3_imahan',
            name: 'สุกี้ยากี้ Asakusa Imahan',
            time: '11:45 - 13:00',
            category: 'มื้อกลางวัน',
            lat: 35.7138,
            lng: 139.7915,
            desc: 'สุกี้ยากี้เนื้อวัวระดับตำนานกว่า 120 ปี หรือข้าวหน้าเนื้อ Gyudon ชั้นเลิศ บรรยากาศญี่ปุ่นแท้',
            mapsUrl: 'https://maps.google.com/?q=Asakusa+Imahan'
        },
        {
            id: 'd3_ueno_park',
            name: 'สวนอุเอโนะ & บึงชิโนบาซุ (Ueno Park)',
            time: '13:30 - 15:00',
            category: 'ที่เที่ยว',
            lat: 35.7140,
            lng: 139.7732,
            desc: 'สวนร่มรื่น นั่งพักผ่อนริมบึงบัว ลมพัดเย็นสบาย ทางเดินราบ ม้านั่งตลอดทาง',
            mapsUrl: 'https://maps.google.com/?q=Ueno+Onshi+Park'
        },
        {
            id: 'd3_akihabara',
            name: 'อากิฮาบาระ (Yodobashi & Radio Kaikan)',
            time: '15:30 - 18:30',
            category: 'ช้อปปิ้ง',
            lat: 35.6987,
            lng: 139.7747,
            desc: 'ช้อปปิ้งของเล่น โมเดล ฟิกเกอร์ กล่องสุ่ม ทางเดินกว้าง ลิฟต์สะดวก',
            mapsUrl: 'https://maps.google.com/?q=Yodobashi+Camera+Multimedia+Akiba'
        },
        {
            id: 'd3_rokkasen',
            name: 'บุฟเฟต์วากิว Rokkasen Shinjuku',
            time: '19:00 - 21:00',
            category: 'มื้อพิเศษ',
            lat: 35.6934,
            lng: 139.6998,
            desc: 'บุฟเฟต์เนื้อวากิวพรีเมียม Matsusaka / A5 ปิ้งย่าง & ชาบู ละลายในปาก ปลอดอาหารทะเล',
            mapsUrl: 'https://maps.google.com/?q=Yakiniku+Tei+Rokkasen+Shinjuku'
        }
    ],
    4: [
        {
            id: 'd4_imperial_palace_run',
            name: 'วิ่งเช้าตรู่: รอบพระราชวังอิมพีเรียล (Imperial Palace Loop)',
            time: '06:00 - 07:30',
            category: 'กิจกรรมเช้า',
            lat: 35.6798,
            lng: 139.7565,
            desc: 'รูทวิ่งชมวิวรอบพระราชวังโตเกียว 1 รอบ ~5.0 กม. ผ่านประตู Sakuradamon อากาศสดชื่นยามเช้า ไม่มีไฟแดง',
            mapsUrl: 'https://maps.google.com/?q=Kokyo+Gaien+National+Garden'
        },
        {
            id: 'd4_meiji',
            name: 'ศาลเจ้าเมจิ (Meiji Jingu)',
            time: '09:30 - 11:30',
            category: 'ที่เที่ยว',
            lat: 35.6764,
            lng: 139.6993,
            desc: 'ศาลเจ้าท่ามกลางธรรมชาติร่มรื่น ทางเดินใต้ร่มเงาไม้ใหญ่ พื้นราบ เดินสบาย',
            mapsUrl: 'https://maps.google.com/?q=Meiji+Jingu+Shrine'
        },
        {
            id: 'd4_maisen',
            name: 'ทงคัตสึ Maisen Tonkatsu Aoyama',
            time: '12:00 - 13:30',
            category: 'มื้อกลางวัน',
            lat: 35.6669,
            lng: 139.7112,
            desc: 'ร้านหมูทอดคัตสึอันดับ 1 ของโตเกียว สาขาโรงอาบน้ำโบราณ นั่งสบาย หมูนุ่มมาก',
            mapsUrl: 'https://maps.google.com/?q=Maisen+Tonkatsu+Aoyama+Main+Store'
        },
        {
            id: 'd4_shibuya',
            name: 'ห้าแยกชิบูย่า & Shibuya PARCO',
            time: '14:00 - 16:30',
            category: 'ช้อปปิ้ง',
            lat: 35.6595,
            lng: 139.7005,
            desc: 'ถ่ายรูปห้าแยก Shibuya Crossing และช้อป Nintendo Store / Pokemon Center ใน PARCO',
            mapsUrl: 'https://maps.google.com/?q=Shibuya+Scramble+Crossing'
        },
        {
            id: 'd4_character_street',
            name: 'Tokyo Character Street (สถานีโตเกียว)',
            time: '17:00 - 19:00',
            category: 'ช้อปปิ้ง',
            lat: 35.6812,
            lng: 139.7671,
            desc: 'รวมช็อปการ์ตูนทางการกว่า 30 ร้าน (Ghibli, Sanrio, Ultraman, Pokemon) ใต้สถานีโตเกียว',
            mapsUrl: 'https://maps.google.com/?q=Tokyo+Character+Street'
        },
        {
            id: 'd4_shabu_sai',
            name: 'บุฟเฟต์ชาบู Shabu Sai (Ueno Sakura Terrace)',
            time: '19:30 - 21:00',
            category: 'มื้อเย็น',
            lat: 35.7126,
            lng: 139.7753,
            desc: 'บุฟเฟต์ชาบู-สุกี้ยากี้เนื้อวัว/หมู บาร์ผักไม่อั้น ติดสถานี Ueno นั่งสบาย เหมาะกับครอบครัว',
            mapsUrl: 'https://maps.google.com/?q=Shabu+Sai+Ueno+no+Mori+Sakura+Terrace'
        }
    ],
    5: [
        {
            id: 'd5_keisei_ueno',
            name: 'สถานี Keisei Ueno (ตู้ Skyliner & ฝากกระเป๋า)',
            time: '08:30 - 10:30',
            category: 'สถานีรถไฟ',
            lat: 35.7117,
            lng: 139.7738,
            desc: 'ฝากกระเป๋าเดินทาง 5 ใบ และสแกน QR Code รับตั๋วจริง Keisei Skyliner (รอบ 11:00 น.)',
            mapsUrl: 'https://maps.google.com/?q=Keisei+Ueno+Station'
        },
        {
            id: 'd5_takeya',
            name: 'ตึกม่วง ทาเคยะ (Takeya Ueno)',
            time: '09:30 - 10:45',
            category: 'ช้อปปิ้ง',
            lat: 35.7077,
            lng: 139.7766,
            desc: 'ช้อปปิ้งขนมและของฝากส่งท้าย ทำ Tax-Free ได้ครบครัน',
            mapsUrl: 'https://maps.google.com/?q=Takeya+Ueno'
        },
        {
            id: 'd5_narita_lunch',
            name: 'สนามบินนาริตะ Terminal 2 (มื้อกลางวัน & เช็คอิน)',
            time: '12:00 - 13:30',
            category: 'มื้อกลางวัน',
            lat: 35.7720,
            lng: 140.3878,
            desc: 'ทานมื้อกลางวันส่งท้ายที่ชั้น 4 T2 ก่อนโหลดกระเป๋าและขึ้นเครื่องกลับไทยเวลา 15:00 น.',
            mapsUrl: 'https://maps.google.com/?q=Narita+International+Airport+Terminal+2'
        }
    ],
    'tiktok': [
        {
            id: 'tt_age3',
            name: 'Age.3 (อาเกะซัง) สาขา Asakusa',
            time: '11:00 - 18:00',
            category: 'แซนด์วิชทอด',
            area: 'Asakusa',
            lat: 35.7128,
            lng: 139.7942,
            desc: 'แซนด์วิชทอดแป้งกรอบนอกนุ่มใน ไส้ล้นทะลัก เมนูเด็ด: ไส้เครมบรูเล่ (Crème Brûlée) เบิร์นน้ำตาลไหม้กรุบกรอบ และไส้วิปครีมนัวๆ รอคิวไม่นาน',
            mapsUrl: 'https://maps.google.com/?q=Age.3+Asakusa'
        },
        {
            id: 'tt_butter',
            name: 'BUTTER 美瑛放牧酪農場 (Marunouchi Bldg B1)',
            time: '11:00 - 21:00',
            category: 'แพนเค้กเนยก้อน',
            area: 'Tokyo Station',
            lat: 35.6811,
            lng: 139.7635,
            desc: 'คาเฟ่แพนเค้กเนยก้อน ครัวเปิดทำสด แพนเค้กเนื้อฟูท็อปด้วยเนยแท้ก้อนยักษ์จากฟาร์มบิเอะ ฮอกไกโด หอมมันเค็มหวานลงตัว เสิร์ฟคู่ไอศกรีมนมสดเข้มข้น',
            mapsUrl: 'https://maps.google.com/?q=BUTTER+Marunouchi+Building'
        },
        {
            id: 'tt_marion_crepe',
            name: 'Marion Crêpes (มาริออน เครป) Harajuku',
            time: '10:30 - 20:00',
            category: 'เครปเย็น',
            area: 'Harajuku',
            lat: 35.6711,
            lng: 139.7049,
            desc: 'เครปเย็นในตำนานแห่งถนน Takeshita ฮาราจูกุ ไส้แน่นทะลัก แป้งหอมนุ่ม ทั้งสตรอว์เบอร์รี ชีสเค้ก บราวนี่ นูเทลล่า และไอศกรีม',
            mapsUrl: 'https://maps.google.com/?q=Marion+Crepes+Harajuku'
        },
        {
            id: 'tt_sweet_box',
            name: 'SWEET BOX Harajuku',
            time: '11:00 - 20:00',
            category: 'เครปเย็น',
            area: 'Harajuku',
            lat: 35.6713,
            lng: 139.7047,
            desc: 'ร้านเครปเย็นฝั่งตรงข้าม Marion Crêpes แป้งนุ่มหอม วิปครีมแน่น ผลไม้สดและท็อปปิ้งล้นๆ สายเครปต้องลองเทียบกัน',
            mapsUrl: 'https://maps.google.com/?q=SWEET+BOX+Harajuku'
        },
        {
            id: 'tt_im_donut',
            name: 'I\'m donut ? สาขา Shibuya',
            time: '11:00 - 20:00',
            category: 'โดนัทสด',
            area: 'Shibuya',
            lat: 35.6608,
            lng: 139.7061,
            desc: 'โดนัทสดแป้งสดคิวยาวสุดฮิต จุดเด่นคือแป้งนุ่มฟู เหนียวหนึบ ละลายในปาก ไม่อมน้ำมัน รสยอดนิยม: พิสตาชิโอครีม, มัทฉะ, ช็อกโกแลตสตรอว์เบอร์รี',
            mapsUrl: 'https://maps.google.com/?q=I%27m+donut+Shibuya'
        },
        {
            id: 'tt_shiopan',
            name: 'Shiopan Pain Maison (ขนมปังเกลือเนยฉ่ำ)',
            time: '08:30 - 19:00',
            category: 'ขนมปังเกลือ',
            area: 'Ginza & Asakusa',
            lat: 35.6705,
            lng: 139.7712,
            desc: 'ต้นตำรับชิโอะปังอันดับ 1 ในโตเกียว กรอบนอกนุ่มหนึบใน กัดแล้วเนยฉ่ำทะลัก รสชาติ: ออริจินัลเค็มมัน, ไส้มันหวาน และรสทรัฟเฟิลหอมฟุ้ง (มีสาขา Ginza และ Asakusa)',
            mapsUrl: 'https://maps.google.com/?q=Pain+Maison+Ginza'
        },
        {
            id: 'tt_craver_matcha',
            name: 'Craver Club Matcha Ginza',
            time: '11:00 - 19:00',
            category: 'มัทฉะพรีเมียม',
            area: 'Ginza',
            lat: 35.6719,
            lng: 139.7658,
            desc: 'ร้านมัทฉะไวรัลขนาด 1 คูหา ชงสดแก้วต่อแก้ว ใช้มัทฉะเข้มข้นถึง 7 กรัมต่อแก้ว เมนูแนะนำ: Premium Matcha Latte (1,296 เยน) หอมนัวเข้มข้นสะใจ',
            mapsUrl: 'https://maps.google.com/?q=Craver+Club+Matcha+Ginza'
        },
        {
            id: 'tt_nakamura_tokichi',
            name: 'Nakamura Tokichi (นากามุระ โทคิจิ) GINZA SIX',
            time: '10:30 - 20:30',
            category: 'ชาเขียวในตำนาน',
            area: 'Ginza',
            lat: 35.6696,
            lng: 139.7639,
            desc: 'ร้านชาเขียวระดับตำนานจากเมืองอุจิ เกียวโต อายุกว่า 170 ปี สั่งเซตมัทฉะพรีเมียมพร้อมขนมหวาน วุ้นชาเขียว ไอศกรีมและพาร์เฟต์มัทฉะแบบจัดเต็ม (5,840 เยน)',
            mapsUrl: 'https://maps.google.com/?q=Nakamura+Tokichi+GINZA+SIX'
        },
        {
            id: 'tt_kiwamiya',
            name: 'Hamburg Kiwamiya (คิวะมิยะ) Shibuya PARCO B1',
            time: '11:00 - 22:00',
            category: 'แฮมเบิร์กวากิว',
            area: 'Shibuya PARCO',
            lat: 35.6620,
            lng: 139.6987,
            desc: 'แฮมเบิร์กเนื้อวากิวปั้นสด นั่งหน้าเคาน์เตอร์บาร์ย่างเองบนเตาหินร้อนๆ สั่งเป็นเซตเติมข้าว ซุปมิโซะ สลัดฟรีไม่อั้น ตบท้ายด้วยซอฟต์เสิร์ฟไอศกรีมนม',
            mapsUrl: 'https://maps.google.com/?q=Kiwamiya+Shibuya+PARCO'
        },
        {
            id: 'tt_motomura',
            name: 'Gyukatsu Motomura (กิวคัตสึ โมโตมุระ) สาขา Asakusa/Ueno',
            time: '11:00 - 21:30',
            category: 'กิวคัตสึ',
            area: 'Asakusa & Ueno',
            lat: 35.7118,
            lng: 139.7748,
            desc: 'เนื้อวัวชุบเกล็ดขนมปังทอดกรอบด้านนอก ด้านในยังแรร์ เสิร์ฟให้ย่างต่อบนเตาหินร้อนส่วนตัวตามชอบ นุ่มละลายในปาก ทานคู่ข้าวบาร์เลย์ ซุปมิโซะ และซอสสูตรเด็ด',
            mapsUrl: 'https://maps.google.com/?q=Gyukatsu+Motomura+Ueno'
        },
        {
            id: 'tt_hamburg_yoshi',
            name: 'Hamburg Yoshi (แฮมเบิร์ก โยชิ) Harajuku',
            time: '11:30 - 21:00',
            category: 'แฮมเบิร์กเตาถ่าน',
            area: 'Harajuku',
            lat: 35.6691,
            lng: 139.7067,
            desc: 'เจ้าของคลิปให้คะแนน 10/10 แฮมเบิร์กเนื้อปั้นสดย่างเตาถ่านหอมกรุ่น เสิร์ฟทีละชิ้นร้อนๆ (เนื้อ, ลิ้นวัว, วากิว) ซอสเดมิเกลซรสเผ็ด ข้าวหม้อดินเติมไม่อั้น + ไข่ดิบฟรี 1 ฟอง',
            mapsUrl: 'https://maps.google.com/?q=Hamburg+Yoshi+Harajuku'
        },
        {
            id: 'tt_takao',
            name: 'Hakata Tempura Takao (Shibuya PARCO 7F)',
            time: '11:00 - 22:00',
            category: 'เทมปุระ',
            area: 'Shibuya PARCO',
            lat: 35.6620,
            lng: 139.6987,
            desc: 'เทมปุระทอดสดใหม่ เสิร์ฟทีละชิ้นกรอบร้อนไม่อมน้ำมัน (กุ้ง, ไก่, ผัก) ไฮไลต์สุดคุ้ม: ตักไข่ปลาเมนไทโกะผสมสาหร่ายคอมบุและผักดองสูตรเด็ดฟรีไม่อั้น!',
            mapsUrl: 'https://maps.google.com/?q=Hakata+Tempura+Takao+Shibuya+PARCO'
        },
        {
            id: 'tt_miura_misakiko',
            name: 'Miura Misakiko (มิอุระ มิซากิโค) ซูชิหน้าล้น Ueno',
            time: '11:00 - 22:00',
            category: 'ซูชิสายพาน',
            area: 'Ueno (Ameyoko)',
            lat: 35.7112,
            lng: 139.7749,
            desc: 'ซูชิสายพานหน้าล้นในตำนาน เชฟปั้นสดวางพูนท็อปปิ้งล้นทะลักพูนจาน ทั้งทูน่าสับพูนจาน แซลมอนสับ ไข่ปลาแซลมอนล้นๆ ราคาจับต้องได้ อยู่ติดตลาด Ameyoko',
            mapsUrl: 'https://maps.google.com/?q=Miura+Misakiko+Ueno'
        },
        {
            id: 'tt_kamo_to_negi',
            name: 'Ramen Kamo to Negi (ราเมงเป็ด คาโมะ โตะ เนงิ)',
            time: '09:00 - 22:30',
            category: 'ราเมงเป็ด',
            area: 'Ueno / Okachimachi',
            lat: 35.7088,
            lng: 139.7745,
            desc: 'ราเมงซุปเป็ดชื่อดังคิวยาว น้ำซุปใสกลมกล่อมเคี่ยวจากเป็ดและน้ำธรรมชาติ ไม่ใส่ผงชูรส ท็อปด้วยเนื้อเป็ดกงฟีนุ่มละมุนและเลือกท็อปปิ้งต้นหอมญี่ปุ่นได้ 2 แบบ',
            mapsUrl: 'https://maps.google.com/?q=Ramen+Kamo+to+Negi+Ueno'
        },
        {
            id: 'tt_hinoya_curry',
            name: 'Hinoya Curry (ฮิโนยะ แกงกะหรี่แชมป์โตเกียว)',
            time: '11:00 - 21:00',
            category: 'ข้าวแกงกะหรี่',
            area: 'Akihabara',
            lat: 35.7005,
            lng: 139.7725,
            desc: 'แกงกะหรี่ดีกรีแชมป์ Kanda Curry Grand Prix เอกลักษณ์ "คำแรกหวาน คำต่อไปเผ็ดร้อนกลมกล่อม" เมนูเด็ด: ข้าวแกงกะหรี่หมูทอดทงคัตสึชีสเยิ้มๆ',
            mapsUrl: 'https://maps.google.com/?q=Hinoya+Curry+Akihabara'
        },
        {
            id: 'tt_yoridocoro',
            name: 'Yoridocoro (คาเฟ่ปลาย่างติดทางรถไฟ) - Kamakura',
            time: '07:00 - 18:00',
            category: 'ปลาย่าง / คาเฟ่ริมราง',
            area: 'Kamakura',
            lat: 35.3039,
            lng: 139.5244,
            desc: 'ร้านปลาย่างบรรยากาศโฮมมี่ในบ้านไม้ญี่ปุ่นโบราณ ติดริมรางรถไฟสาย Enoden ไฮไลต์: ปลาย่างหอมๆ ทานคู่ "ข้าวหน้าไข่ดิบตีฟู" ที่ให้ลูกค้าสนุกกับการตีไข่ขาวจนฟูฟ่องก่อนราดไข่แดง',
            mapsUrl: 'https://maps.google.com/?q=Yoridocoro+Kamakura'
        }
    ]
};

let currentMapDay = 1;
let currentFocusedSpotId = null;
let currentMapMode = 'none'; // 'google' | 'leaflet'

// Google Maps objects
let googleMap = null;
let googleMarkers = {};
let googleInfoWindow = null;
let isGoogleMapsLoaded = false;
let googleMapsAuthFailed = false;

// Leaflet objects
let leafletMap = null;
let leafletMarkers = {};

// User Geolocation objects
let userLocation = null; // { lat, lng, accuracy, timestamp }
let userLeafletMarker = null;
let userLeafletCircle = null;
let userGoogleMarker = null;
let userGoogleCircle = null;
let isLocatingUser = false;
let gpsStatusTimer = null;

// Calculate distance between two points in km (Haversine formula)
function getDistanceKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function formatDistance(km) {
    if (km < 1) {
        return `${Math.round(km * 1000)} ม.`;
    } else if (km < 10) {
        return `${km.toFixed(1)} กม.`;
    } else {
        return `${Math.round(km)} กม.`;
    }
}

function showGpsStatus(message, duration = 3000) {
    const statusEl = document.getElementById('map-gps-status');
    if (!statusEl) return;
    statusEl.innerHTML = message;
    statusEl.classList.add('show');
    if (gpsStatusTimer) clearTimeout(gpsStatusTimer);
    gpsStatusTimer = setTimeout(() => {
        statusEl.classList.remove('show');
    }, duration);
}

function locateUserPosition(panToUser = true) {
    if (!navigator.geolocation) {
        showGpsStatus('❌ อุปกรณ์หรือเบราว์เซอร์ไม่รองรับ GPS');
        return;
    }

    const gpsBtn = document.getElementById('map-gps-btn');
    if (gpsBtn) {
        gpsBtn.classList.add('loading');
        gpsBtn.disabled = true;
    }
    showGpsStatus('📡 กำลังค้นหาตำแหน่งปัจจุบันของคุณ...');
    isLocatingUser = true;

    navigator.geolocation.getCurrentPosition(
        (position) => {
            isLocatingUser = false;
            if (gpsBtn) {
                gpsBtn.classList.remove('loading');
                gpsBtn.classList.add('active');
                gpsBtn.disabled = false;
            }

            userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                accuracy: position.coords.accuracy || 20,
                timestamp: Date.now()
            };

            const accuracyText = userLocation.accuracy < 1000 
                ? `(ความแม่นยำ ±${Math.round(userLocation.accuracy)} ม.)` 
                : '';
            showGpsStatus(`✅ ระบุตำแหน่งสำเร็จ ${accuracyText}`, 3500);

            // Render marker on current map mode
            renderUserLocationOnMap(panToUser);

            // Re-render place cards with updated distances
            renderMapPlaces(currentMapDay);
        },
        (error) => {
            isLocatingUser = false;
            if (gpsBtn) {
                gpsBtn.classList.remove('loading');
                gpsBtn.disabled = false;
            }

            let msg = '⚠️ ไม่สามารถระบุตำแหน่งได้';
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    msg = '🔒 กรุณาอนุญาตสิทธิ์เข้าถึงพิกัด (Location Permission) ในเบราว์เซอร์';
                    break;
                case error.POSITION_UNAVAILABLE:
                    msg = '📡 ข้อมูลตำแหน่งไม่พร้อมใช้งานในขณะนี้';
                    break;
                case error.TIMEOUT:
                    msg = '⏱️ หมดเวลาในการค้นหาสัญญาณ GPS';
                    break;
            }
            showGpsStatus(msg, 4500);
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
        }
    );
}

function renderUserLocationOnMap(panToUser = false) {
    if (!userLocation) return;

    if (currentMapMode === 'leaflet' && leafletMap) {
        renderUserLocationLeaflet(panToUser);
    } else if (currentMapMode === 'google' && googleMap) {
        renderUserLocationGoogle(panToUser);
    }
}

function renderUserLocationLeaflet(panToUser = false) {
    if (!leafletMap || !userLocation) return;

    const latLng = [userLocation.lat, userLocation.lng];

    if (userLeafletMarker) {
        leafletMap.removeLayer(userLeafletMarker);
    }
    if (userLeafletCircle) {
        leafletMap.removeLayer(userLeafletCircle);
    }

    // Accuracy circle
    userLeafletCircle = L.circle(latLng, {
        radius: Math.max(userLocation.accuracy, 30),
        color: '#2563eb',
        fillColor: '#3b82f6',
        fillOpacity: 0.15,
        weight: 1
    }).addTo(leafletMap);

    // Pulsing Blue Dot Marker
    const userIcon = L.divIcon({
        className: 'user-gps-marker-wrap',
        html: `
            <div class="user-gps-marker">
                <div class="user-gps-pulse"></div>
                <div class="user-gps-dot"></div>
            </div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
        popupAnchor: [0, -12]
    });

    userLeafletMarker = L.marker(latLng, { icon: userIcon, zIndexOffset: 1000 }).addTo(leafletMap);
    userLeafletMarker.bindPopup(`
        <div class="custom-infowindow">
            <h4 style="color: #2563eb; margin-bottom: 4px;">📍 ตำแหน่งปัจจุบันของคุณ</h4>
            <p style="font-size: 0.8rem; margin: 0; color: #475569;">
                พิกัด: ${userLocation.lat.toFixed(5)}, ${userLocation.lng.toFixed(5)}<br>
                ความแม่นยำ: ±${Math.round(userLocation.accuracy)} เมตร
            </p>
        </div>
    `);

    if (panToUser) {
        leafletMap.setView(latLng, Math.max(leafletMap.getZoom(), 15), { animate: true });
        userLeafletMarker.openPopup();
    }
}

function renderUserLocationGoogle(panToUser = false) {
    if (!googleMap || !userLocation) return;

    const position = { lat: userLocation.lat, lng: userLocation.lng };

    if (userGoogleMarker) {
        userGoogleMarker.setMap(null);
    }
    if (userGoogleCircle) {
        userGoogleCircle.setMap(null);
    }

    // Accuracy circle
    userGoogleCircle = new google.maps.Circle({
        strokeColor: '#2563eb',
        strokeOpacity: 0.6,
        strokeWeight: 1,
        fillColor: '#3b82f6',
        fillOpacity: 0.15,
        map: googleMap,
        center: position,
        radius: Math.max(userLocation.accuracy, 30)
    });

    // Pulsing Blue Dot Marker (Native Google Maps Circle Symbol)
    userGoogleMarker = new google.maps.Marker({
        position: position,
        map: googleMap,
        title: 'ตำแหน่งปัจจุบันของคุณ',
        zIndex: 9999,
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: '#2563eb',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 3,
            scale: 8
        }
    });

    userGoogleMarker.addListener('click', () => {
        if (!googleInfoWindow) googleInfoWindow = new google.maps.InfoWindow();
        googleInfoWindow.setContent(`
            <div class="custom-infowindow">
                <h4 style="color: #2563eb; margin-bottom: 4px;">📍 ตำแหน่งปัจจุบันของคุณ</h4>
                <p style="font-size: 0.8rem; margin: 0; color: #475569;">
                    พิกัด: ${userLocation.lat.toFixed(5)}, ${userLocation.lng.toFixed(5)}<br>
                    ความแม่นยำ: ±${Math.round(userLocation.accuracy)} เมตร
                </p>
            </div>
        `);
        googleInfoWindow.open(googleMap, userGoogleMarker);
    });

    if (panToUser) {
        googleMap.panTo(position);
        googleMap.setZoom(Math.max(googleMap.getZoom() || 12, 15));
        google.maps.event.trigger(userGoogleMarker, 'click');
    }
}


function getApiKey() {
    return (localStorage.getItem(GMAPS_KEY_STORAGE) || '').trim();
}

function openMapSettings() {
    const key = getApiKey();
    const input = document.getElementById('gmaps-api-key-input');
    const statusBox = document.getElementById('map-key-status-box');
    if (input) input.value = key;
    if (statusBox) {
        if (key) {
            const masked = key.length > 8 ? key.substring(0, 4) + '...' + key.substring(key.length - 4) : '••••••••';
            statusBox.className = 'map-key-status active';
            statusBox.innerHTML = `🟢 <b>ใช้งานอยู่:</b> <code>${masked}</code> (บันทึกในเครื่องแล้ว)`;
        } else {
            statusBox.className = 'map-key-status empty';
            statusBox.innerHTML = `ℹ️ <b>ยังไม่มี API Key:</b> ระบบใช้งาน OpenStreetMap ให้โดยอัตโนมัติ`;
        }
    }
    openModal('modal-map-settings');
}

function saveApiKey() {
    const input = document.getElementById('gmaps-api-key-input');
    const newKey = input ? input.value.trim() : '';
    if (newKey) {
        localStorage.setItem(GMAPS_KEY_STORAGE, newKey);
        googleMapsAuthFailed = false;
        alert('✅ บันทึก Google Maps API Key เรียบร้อยแล้ว');
    } else {
        localStorage.removeItem(GMAPS_KEY_STORAGE);
        alert('ℹ️ ลบ API Key แล้ว สลับไปใช้งาน OpenStreetMap');
    }
    closeModal('modal-map-settings');
    // Re-render map with new configuration
    initMapForDay(currentMapDay);
}

function clearApiKey() {
    if (confirm('ต้องการล้าง Google Maps API Key ใช่หรือไม่? (ระบบจะสลับไปใช้ OpenStreetMap แทน)')) {
        localStorage.removeItem(GMAPS_KEY_STORAGE);
        const input = document.getElementById('gmaps-api-key-input');
        if (input) input.value = '';
        googleMapsAuthFailed = false;
        closeModal('modal-map-settings');
        initMapForDay(currentMapDay);
    }
}

function updateEngineBar() {
    const bar = document.getElementById('map-engine-bar');
    const text = document.getElementById('map-engine-text');
    if (!bar || !text) return;

    if (currentMapMode === 'google') {
        text.innerHTML = `🟢 <b>Google Maps API</b> • กำลังใช้งาน Google Maps JavaScript API`;
    } else {
        const key = getApiKey();
        if (key && googleMapsAuthFailed) {
            text.innerHTML = `⚠️ <b>OpenStreetMap Mode</b> (Key ไม่ถูกต้อง/โควต้าหมด สลับสำรองอัตโนมัติ) • <button type="button" class="engine-switch-link" onclick="openMapSettings()">ตรวจเช็ค Key</button>`;
        } else {
            text.innerHTML = `🗺️ <b>OpenStreetMap Mode</b> (พิกัดพร้อมใช้งาน) • <button type="button" class="engine-switch-link" onclick="openMapSettings()">คลิกเพื่อใส่ Google Maps API Key</button>`;
        }
    }
}

// Mobile Bottom Sheet Functions
function toggleMobileBottomSheet() {
    const panel = document.getElementById('map-places-panel');
    if (!panel) return;
    panel.classList.toggle('sheet-expanded');
}

function setMobileBottomSheet(expanded = false) {
    const panel = document.getElementById('map-places-panel');
    if (!panel) return;
    if (expanded) {
        panel.classList.add('sheet-expanded');
    } else {
        panel.classList.remove('sheet-expanded');
    }
}

function openDayMap(day, spotId) {
    if (day !== 'tiktok' && !DAY_LOCATIONS[day]) day = 1;
    currentMapDay = day;
    currentFocusedSpotId = spotId || null;

    // Reset bottom sheet to collapsed state when map opens
    setMobileBottomSheet(false);

    openModal('modal-map');
    switchMapDay(day, spotId);

    // If permission was already granted previously, update user location silently
    if (navigator.permissions && navigator.permissions.query) {
        navigator.permissions.query({ name: 'geolocation' }).then(result => {
            if (result.state === 'granted' && !userLocation) {
                locateUserPosition(false);
            }
        }).catch(() => {});
    }
}

function switchMapDay(day, spotId) {
    currentMapDay = day;
    if (spotId) {
        currentFocusedSpotId = spotId;
    }

    // Update Day Tabs
    const tabs = document.querySelectorAll('.map-tab-btn');
    tabs.forEach(tab => {
        const d = tab.getAttribute('data-day');
        if (String(d) === String(day)) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });

    // Update Title & Subtitle
    const titleEl = document.getElementById('map-modal-title');
    const subtitleEl = document.getElementById('map-modal-subtitle');
    if (titleEl) {
        if (day === 'tiktok') {
            titleEl.textContent = '🍴 ลายแทง 16 ร้านเด็ดโตเกียว 2026 จาก TikTok ช่อง I AM EAT';
            if (subtitleEl) subtitleEl.textContent = 'พิกัดร้านเด็ด คาเฟ่ & ของหวานยอดฮิตในโตเกียว แตะเพื่อซูมดูรายละเอียด (แตะซ้ำดูทั้งหมด)';
        } else {
            const dayNames = {
                1: 'Day 1: นาริตะ ➔ ทางด่วน E20 ➔ ฟูจิ คาวากุจิโกะ',
                2: 'Day 2: โอชิโนะฮักไก ➔ ล่องเรือ ➔ คืนรถ Asakusa ➔ Ameyoko',
                3: 'Day 3: วัดอาซากุสะ ➔ สวนอุเอโนะ ➔ Akihabara ➔ บุฟเฟต์ Rokkasen',
                4: 'Day 4: ศาลเจ้าเมจิ ➔ Maisen Aoyama ➔ ชิบูย่า ➔ Tokyo Character Street',
                5: 'Day 5: สถานี Keisei Ueno ➔ ตึกม่วง Takeya ➔ Narita Airport T2'
            };
            titleEl.textContent = `🗺️ แผนที่ ${dayNames[day] || 'Day ' + day}`;
            if (subtitleEl) subtitleEl.textContent = 'คลิกรายการเพื่อเลื่อนหาหมุด (คลิกซ้ำเพื่อดูภาพรวมทั้งหมด)';
        }
    }

    // Render Places List
    renderMapPlaces(day);

    // Initialize or Update Map Engine
    initMapForDay(day);
}

function renderMapPlaces(day) {
    const listEl = document.getElementById('map-places-list');
    const countEl = document.getElementById('map-places-count');
    const spots = DAY_LOCATIONS[day] || [];
    const isTiktok = (day === 'tiktok');

    if (countEl) {
        if (isTiktok) {
            countEl.textContent = `🍴 ร้านเด็ด TikTok (${spots.length} ร้าน)`;
        } else {
            countEl.textContent = `📍 สถานที่ในวันนี้ (${spots.length} จุด)`;
        }
    }

    if (!listEl) return;
    listEl.innerHTML = '';

    spots.forEach((spot, idx) => {
        const card = document.createElement('div');
        card.className = `map-place-card ${isTiktok ? 'tiktok-card' : ''}`;
        card.setAttribute('data-id', spot.id);
        if (currentFocusedSpotId === spot.id) {
            card.classList.add('active');
        }

        const timeOrArea = spot.area ? `📍 ${spot.area} • ⏱️ ${spot.time}` : `⏱️ ${spot.time}`;

        let distanceBadgeHtml = '';
        if (userLocation && spot.lat && spot.lng) {
            const distKm = getDistanceKm(userLocation.lat, userLocation.lng, spot.lat, spot.lng);
            distanceBadgeHtml = `<span class="map-place-distance" title="ระยะทางโดยประมาณจากตำแหน่งของคุณในปัจจุบัน">📏 ~${formatDistance(distKm)}</span>`;
        }

        card.innerHTML = `
            <div class="map-place-num ${isTiktok ? 'tiktok-place-num' : ''}">${idx + 1}</div>
            <div class="map-place-info">
                <div class="map-place-top">
                    <span class="map-place-time">${timeOrArea}</span>
                    <span class="map-place-cat">${spot.category}</span>
                </div>
                <div class="map-place-name">
                    ${spot.name} 
                    ${isTiktok ? '<span class="tiktok-badge-pill">TikTok Highlight</span>' : ''}
                    ${distanceBadgeHtml}
                </div>
                <div class="map-place-desc">${spot.desc}</div>
                <div class="map-place-actions">
                    <a class="map-place-glink" href="${spot.mapsUrl}" target="_blank" onclick="event.stopPropagation();">📍 เปิดใน Google Maps ↗</a>
                </div>
            </div>
        `;

        card.addEventListener('click', () => {
            togglePlaceFocus(spot.id);
        });

        listEl.appendChild(card);
    });
}

function highlightPlaceCard(spotId, scroll) {
    const cards = document.querySelectorAll('.map-place-card');
    cards.forEach(c => {
        if (c.getAttribute('data-id') === spotId) {
            c.classList.add('active');
            if (scroll) {
                c.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        } else {
            c.classList.remove('active');
        }
    });
}

function togglePlaceFocus(spotId) {
    if (currentFocusedSpotId === spotId) {
        resetDayMapFocus();
    } else {
        focusPlace(spotId);
    }
}

function resetDayMapFocus() {
    currentFocusedSpotId = null;

    // Remove active class from cards
    const cards = document.querySelectorAll('.map-place-card');
    cards.forEach(c => c.classList.remove('active'));

    const spots = DAY_LOCATIONS[currentMapDay] || [];
    if (!spots.length) return;

    if (currentMapMode === 'google' && googleMap) {
        if (googleInfoWindow) {
            googleInfoWindow.close();
        }
        const bounds = new google.maps.LatLngBounds();
        spots.forEach(s => bounds.extend({ lat: s.lat, lng: s.lng }));
        googleMap.fitBounds(bounds);
    } else if (currentMapMode === 'leaflet' && leafletMap) {
        leafletMap.closePopup();
        const bounds = spots.map(s => [s.lat, s.lng]);
        leafletMap.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
    }
}

function focusPlace(spotId) {
    currentFocusedSpotId = spotId;
    const spots = DAY_LOCATIONS[currentMapDay] || [];
    const spot = spots.find(s => s.id === spotId);
    if (!spot) return;

    highlightPlaceCard(spotId, true);

    if (currentMapMode === 'google' && googleMap && googleMarkers[spotId]) {
        const marker = googleMarkers[spotId];
        googleMap.panTo({ lat: spot.lat, lng: spot.lng });
        googleMap.setZoom(16);

        const timeOrArea = spot.area ? `📍 <b>${spot.area}</b> • ⏱️ ${spot.time}` : `⏱️ <b>${spot.time}</b>`;
        const content = `
            <div class="custom-infowindow">
                <h4 style="margin: 0 0 6px 0; color: #1e3a8a; font-size: 0.95rem;">${spot.name}</h4>
                <p style="margin: 0 0 6px 0; font-size: 0.85rem; color: #475569;">
                    ${timeOrArea} (${spot.category})<br>${spot.desc}
                </p>
                <a href="${spot.mapsUrl}" target="_blank" style="color: #2563eb; font-weight: 600; text-decoration: none; font-size: 0.82rem;">📍 นำทางใน Google Maps ↗</a>
            </div>
        `;
        if (googleInfoWindow) {
            googleInfoWindow.setContent(content);
            googleInfoWindow.open(googleMap, marker);
        }
    } else if (currentMapMode === 'leaflet' && leafletMap && leafletMarkers[spotId]) {
        const marker = leafletMarkers[spotId];
        leafletMap.setView([spot.lat, spot.lng], 16, { animate: true });
        marker.openPopup();
    }
}

function initMapForDay(day) {
    const key = getApiKey();
    if (key && !googleMapsAuthFailed) {
        if (window.google && window.google.maps) {
            initGoogleMap(day);
        } else {
            loadGoogleMapsScript(key, () => {
                initGoogleMap(day);
            });
        }
    } else {
        initLeafletMap(day);
    }
}

function loadGoogleMapsScript(apiKey, callback) {
    if (window.google && window.google.maps) {
        callback();
        return;
    }

    window.onGoogleMapsApiLoaded = function() {
        isGoogleMapsLoaded = true;
        callback();
    };

    window.gm_authFailure = function() {
        console.warn('Google Maps authentication failed with provided API key. Falling back to OpenStreetMap.');
        googleMapsAuthFailed = true;
        initLeafletMap(currentMapDay);
    };

    // Remove any previous script
    const existing = document.getElementById('google-maps-api-script');
    if (existing) existing.remove();

    const script = document.createElement('script');
    script.id = 'google-maps-api-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places&callback=onGoogleMapsApiLoaded`;
    script.async = true;
    script.defer = true;
    script.onerror = function() {
        console.warn('Failed to load Google Maps script. Falling back to OpenStreetMap.');
        googleMapsAuthFailed = true;
        initLeafletMap(currentMapDay);
    };
    document.head.appendChild(script);
}

function initLeafletMap(day) {
    currentMapMode = 'leaflet';
    updateEngineBar();
    const container = document.getElementById('map-canvas');
    if (!container) return;

    if (googleMap) {
        googleMap = null;
        googleMarkers = {};
        container.innerHTML = '';
    }

    const spots = DAY_LOCATIONS[day] || [];
    if (!spots.length) return;
    const isTiktok = (day === 'tiktok');

    if (!leafletMap) {
        leafletMap = L.map('map-canvas', {
            zoomControl: true,
            scrollWheelZoom: true
        });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors'
        }).addTo(leafletMap);
    }

    // Clear previous markers
    for (let id in leafletMarkers) {
        leafletMap.removeLayer(leafletMarkers[id]);
    }
    leafletMarkers = {};

    const bounds = [];
    spots.forEach((spot, idx) => {
        const latLng = [spot.lat, spot.lng];
        bounds.push(latLng);

        const icon = L.divIcon({
            className: 'custom-leaflet-marker-wrap',
            html: `<div class="map-marker-pin ${isTiktok ? 'tiktok-marker-pin' : ''}"><span class="map-marker-text">${idx + 1}</span></div>`,
            iconSize: [28, 28],
            iconAnchor: [14, 28],
            popupAnchor: [0, -28]
        });

        const timeOrArea = spot.area ? `📍 <b>${spot.area}</b> • ⏱️ ${spot.time}` : `⏱️ <b>${spot.time}</b>`;
        const popupContent = `
            <div class="custom-infowindow ${isTiktok ? 'tiktok-popup' : ''}">
                <h4>${idx + 1}. ${spot.name}</h4>
                <p>${timeOrArea} (${spot.category})<br>${spot.desc}</p>
                <a href="${spot.mapsUrl}" target="_blank">📍 นำทางใน Google Maps ↗</a>
            </div>
        `;

        const marker = L.marker(latLng, { icon: icon }).addTo(leafletMap);
        marker.bindPopup(popupContent);

        marker.on('click', (e) => {
            L.DomEvent.stopPropagation(e);
            togglePlaceFocus(spot.id);
        });

        leafletMarkers[spot.id] = marker;
    });

    leafletMap.off('click');
    leafletMap.on('click', () => {
        if (currentFocusedSpotId) {
            resetDayMapFocus();
        }
    });

    if (bounds.length) {
        leafletMap.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
    }

    // Re-render user location marker if available
    if (userLocation) {
        renderUserLocationLeaflet(false);
    }

    setTimeout(() => {
        if (leafletMap) leafletMap.invalidateSize();
        if (currentFocusedSpotId) {
            focusPlace(currentFocusedSpotId);
        }
    }, 200);
}

function initGoogleMap(day) {
    currentMapMode = 'google';
    updateEngineBar();
    const container = document.getElementById('map-canvas');
    if (!container) return;

    if (leafletMap) {
        leafletMap.remove();
        leafletMap = null;
        leafletMarkers = {};
        container.innerHTML = '';
    }

    const spots = DAY_LOCATIONS[day] || [];
    if (!spots.length) return;

    if (!googleMap) {
        googleMap = new google.maps.Map(container, {
            zoom: 12,
            center: { lat: spots[0].lat, lng: spots[0].lng },
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true
        });
        googleInfoWindow = new google.maps.InfoWindow();
        googleInfoWindow.addListener('closeclick', () => {
            resetDayMapFocus();
        });
        googleMap.addListener('click', () => {
            if (currentFocusedSpotId) {
                resetDayMapFocus();
            }
        });
    }

    for (let id in googleMarkers) {
        googleMarkers[id].setMap(null);
    }
    googleMarkers = {};

    const isTiktok = (day === 'tiktok');
    const bounds = new google.maps.LatLngBounds();

    spots.forEach((spot, idx) => {
        const position = { lat: spot.lat, lng: spot.lng };
        bounds.extend(position);

        const markerOptions = {
            position: position,
            map: googleMap,
            label: {
                text: String(idx + 1),
                color: '#ffffff',
                fontWeight: 'bold',
                fontSize: '11px'
            },
            title: spot.name
        };

        if (isTiktok) {
            markerOptions.icon = {
                path: 'M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 z',
                fillColor: '#ea580c',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 2,
                scale: 1.15,
                labelOrigin: new google.maps.Point(0, -30)
            };
        }

        const marker = new google.maps.Marker(markerOptions);

        marker.addListener('click', () => {
            togglePlaceFocus(spot.id);
        });

        googleMarkers[spot.id] = marker;
    });

    googleMap.fitBounds(bounds);

    // Re-render user location marker if available
    if (userLocation) {
        renderUserLocationGoogle(false);
    }

    setTimeout(() => {
        if (googleMap) {
            google.maps.event.trigger(googleMap, 'resize');
        }
        if (currentFocusedSpotId) {
            focusPlace(currentFocusedSpotId);
        }
    }, 200);
}

// ================= INTERACTIVE ROUTE MAP DATA & FUNCTIONS =================
const ROUTE_DATA = {
    'run_kawaguchiko': {
        id: 'run_kawaguchiko',
        title: '🏃 วิ่งเลียบทะเลสาบฟูจิ: Cottage Minami ⇄ Oishi Park',
        subtitle: 'สูดโอโซนบริสุทธิ์ยามเช้า ชมวิวเงาฟูจิสะท้อนน้ำ (Sakasa Fuji) ริมทะเลสาบฝั่งเหนือ',
        type: 'run',
        typeName: '🏃 วิ่งเช้าตรู่ (Morning Run)',
        distance: '5.6 กม. (ไป-กลับ)',
        duration: '35 - 45 นาที',
        elevation: 'ทางราบเรียบตลอดสาย (+18 ม.)',
        surface: 'ทางเท้าคอนกรีตเรียบริมน้ำ & เลียบ Route 21',
        highlight: 'วิวภูเขาไฟฟูจิเต็มตาตลอดเส้นทาง ไม่มีไฟแดงขวางกั้น',
        color: '#0284c7',
        gmapsDirUrl: 'https://www.google.com/maps/dir/Lake+Kawaguch+Cottage+Minami/Oishi+Park',
        waypoints: [
            {
                name: 'จุดปล่อยตัว: บ้านพัก Lake Kawaguch Cottage Minami',
                type: 'start',
                lat: 35.5265,
                lng: 138.7410,
                desc: 'ออกสตาร์ทจากหน้าบ้านพัก เลี้ยวขวามุ่งหน้าทิศตะวันออกสู่ทางเดินเท้าเลียบทะเลสาบ',
                mapsUrl: 'https://maps.google.com/?q=Lake+Kawaguch+Cottage+Minami'
            },
            {
                name: 'จุดชมวิวแหลมนางาซากิ (Nagasaki Park)',
                type: 'waypoint',
                lat: 35.5245,
                lng: 138.7490,
                desc: 'แหลมยื่นริมทะเลสาบ จุดถ่ายรูปยอดนิยมอันดับ 1 ในการชมฟูจิสะท้อนผิวน้ำช่วงเช้าตรู่',
                mapsUrl: 'https://maps.google.com/?q=Nagasaki+Park+Kawaguchiko'
            },
            {
                name: 'จุดกลับตัว: สวน Oishi Park (ลานดอกไม้ริมฟูจิ)',
                type: 'turn',
                lat: 35.5230,
                lng: 138.7450,
                desc: 'จุดกลับตัวระยะ 2.8 กม. ลานดอกไม้ริมน้ำ มีห้องน้ำสะอาด ตู้กดน้ำ และศาลานั่งพัก',
                mapsUrl: 'https://maps.google.com/?q=Oishi+Park+Kawaguchiko'
            },
            {
                name: 'เส้นชัย: กลับสู่ Cottage Minami',
                type: 'end',
                lat: 35.5265,
                lng: 138.7410,
                desc: 'วิ่งย้อนกลับเส้นทางเดิมเลียบผิวน้ำ สิ้นสุดระยะ 5.6 กม. คลายกล้ามเนื้อและพักผ่อน',
                mapsUrl: 'https://maps.google.com/?q=Lake+Kawaguch+Cottage+Minami'
            }
        ],
        coordinates: [
            [35.5265, 138.7410],
            [35.5264, 138.7428],
            [35.5260, 138.7445],
            [35.5255, 138.7465],
            [35.5250, 138.7480],
            [35.5245, 138.7490],
            [35.5240, 138.7485],
            [35.5235, 138.7472],
            [35.5231, 138.7460],
            [35.5230, 138.7450],
            [35.5231, 138.7460],
            [35.5235, 138.7472],
            [35.5240, 138.7485],
            [35.5245, 138.7490],
            [35.5250, 138.7480],
            [35.5255, 138.7465],
            [35.5260, 138.7445],
            [35.5264, 138.7428],
            [35.5265, 138.7410]
        ]
    },
    'run_kawaguchiko_bridge': {
        id: 'run_kawaguchiko_bridge',
        title: '🌉 วิ่งข้ามสะพาน Kawaguchiko Ohashi Loop (วิวฟูจิพาโนรามา 360°)',
        subtitle: 'รูทวิ่งข้ามสะพานใหญ่กลางทะเลสาบ วนรอบอ่าวตะวันออก ชมฟูจิสะท้อนน้ำเต็มตา พิกัด Plus Code แม่นยำ',
        type: 'run',
        typeName: '🌉 วิ่งข้ามสะพาน (Bridge Loop)',
        distance: '6.0 กม. (ลูปวงกลม)',
        duration: '38 - 50 นาที',
        elevation: 'มีสโลปขึ้น-ลงสะพานโอฮาชิ (+35 ม.)',
        surface: 'ทางเท้าคอนกรีตเลียบน้ำ & ทางเท้าบนสะพานกว้าง ปลอดภัย',
        highlight: 'วิ่งข้ามสะพานยาว 500 ม. กลางทะเลสาบ วิวฟูจิพาโนรามา 360 องศา สัมผัสลมหนาวยามเช้า',
        color: '#059669',
        gmapsDirUrl: 'https://www.google.com/maps/dir/35.524128,138.768003/35.521503,138.757253/35.512753,138.766003/35.511503,138.764378/35.508503,138.762253/35.509878,138.774378/35.524128,138.768003',
        waypoints: [
            {
                name: 'จุดปล่อยตัว: บ้านพัก Lake Kawaguch Cottage Minami',
                type: 'start',
                lat: 35.524128,
                lng: 138.768003,
                desc: 'จุดปล่อยตัวหน้าบ้านพัก (Plus Code: GQF9+M6) เริ่มวิ่งเลียบทางเท้าฝั่งเหนือมุ่งหน้าทิศตะวันตก',
                mapsUrl: 'https://maps.google.com/?q=35.524128,138.768003'
            },
            {
                name: 'จุดชมวิวแหลมนางาซากิ (Nagasaki Park)',
                type: 'waypoint',
                lat: 35.521503,
                lng: 138.757253,
                desc: 'จุดชมวิวแหลมยื่นริมทะเลสาบ (Plus Code: GQC4+JW) ถ่ายรูปเงาฟูจิสะท้อนน้ำ Sakasa Fuji ยามเช้า',
                mapsUrl: 'https://maps.google.com/?q=35.521503,138.757253'
            },
            {
                name: 'ศาลเจ้าอุบุยะงาซากิ (เชิงสะพานโอฮาชิฝั่งเหนือ)',
                type: 'waypoint',
                lat: 35.512753,
                lng: 138.766003,
                desc: 'เชิงสะพานโอฮาชิฝั่งเหนือ (Plus Code: GQ78+4C) จุดเริ่มวิ่งขึ้นทางเท้าสะพานข้ามทะเลสาบ',
                mapsUrl: 'https://maps.google.com/?q=35.512753,138.766003'
            },
            {
                name: 'สะพาน Kawaguchiko Ohashi (กลางสะพาน - ไฮไลต์วิว 360°)',
                type: 'turn',
                lat: 35.511503,
                lng: 138.764378,
                desc: 'กึ่งกลางสะพานโอฮาชิ (Plus Code: GQ67+JQ) ชมวิวฟูจิและผืนน้ำแบบพาโนรามา 360 องศา ลมพัดเย็นสบาย',
                mapsUrl: 'https://maps.google.com/?q=35.511503,138.764378'
            },
            {
                name: 'Kawaguchiko Kitahara Museum (เชิงสะพานฝั่งใต้)',
                type: 'waypoint',
                lat: 35.508503,
                lng: 138.762253,
                desc: 'เชิงสะพานฝั่งใต้ (Plus Code: GQ56+CW) เลี้ยวซ้ายเข้าทางเดินเลียบชายหาด Funatsuhama มุ่งหน้าฝั่งตะวันออก',
                mapsUrl: 'https://maps.google.com/?q=35.508503,138.762253'
            },
            {
                name: 'Azagawa, 浅川 ป้ายรถเมล์ (ย่านออนเซ็นฝั่งตะวันออก)',
                type: 'rest',
                lat: 35.509878,
                lng: 138.774378,
                desc: 'ป้ายรถเมล์อาซากาวะ (Plus Code: GQ5F+XQ) ริมทะเลสาบฝั่งตะวันออก วิ่งต่อไปตามถนนเลียบน้ำมุ่งหน้าทิศเหนือ',
                mapsUrl: 'https://maps.google.com/?q=35.509878,138.774378'
            },
            {
                name: 'เส้นชัย: บ้านพัก Lake Kawaguch Cottage Minami',
                type: 'end',
                lat: 35.524128,
                lng: 138.768003,
                desc: 'วิ่งวนกลับถึงบ้านพัก (Plus Code: GQF9+M6) ครบรอบลูปสะพานโอฮาชิระยะทาง ~6.0 กม. พอดี คูลดาวน์และพักผ่อน',
                mapsUrl: 'https://maps.google.com/?q=35.524128,138.768003'
            }
        ],
        coordinates: [
            [35.524128, 138.768003],
            [35.523500, 138.765000],
            [35.522800, 138.762000],
            [35.522200, 138.759500],
            [35.521503, 138.757253],
            [35.520000, 138.759000],
            [35.518000, 138.761500],
            [35.515500, 138.764000],
            [35.512753, 138.766003],
            [35.512000, 138.765000],
            [35.511503, 138.764378],
            [35.510000, 138.763200],
            [35.509000, 138.762600],
            [35.508503, 138.762253],
            [35.507500, 138.765000],
            [35.506500, 138.768000],
            [35.506000, 138.771000],
            [35.506800, 138.773500],
            [35.508500, 138.774200],
            [35.509878, 138.774378],
            [35.512500, 138.773000],
            [35.515500, 138.771000],
            [35.518500, 138.769500],
            [35.521500, 138.768800],
            [35.524128, 138.768003]
        ]
    },
    'run_imperial_palace': {
        id: 'run_imperial_palace',
        title: '🏃 วิ่งรอบพระราชวังอิมพีเรียลโตเกียว (Imperial Palace Loop)',
        subtitle: 'รูทวิ่งยอดนิยมระดับโลกใจกลางมหานครโตเกียว 1 รอบ 5.0 กม. วิ่งวนทวนเข็มนาฬิกา',
        type: 'run',
        typeName: '🏃 วิ่งรอบพระราชวัง (Palace Loop)',
        distance: '5.0 กม. (1 รอบ)',
        duration: '28 - 38 นาที',
        elevation: 'เนินลาดช่วง Chidorigafuchi เล็กน้อย (+32 ม.)',
        surface: 'ทางเท้าคอนกรีตเรียบ & ทางเดินสวนสาธารณะกว้างขวาง',
        highlight: 'ไม่มีสัญญาณไฟแดงขวางกั้น ลมพัดเย็นสบายผ่านคูเมืองโบราณและป่าไม้ร่มรื่น',
        color: '#16a34a',
        gmapsDirUrl: 'https://www.google.com/maps/dir/Sakuradamon+Gate/Kokyo+Gaien+National+Garden',
        waypoints: [
            {
                name: 'จุดเริ่มต้น: ประตูซากุราดะมง (Sakuradamon Gate)',
                type: 'start',
                lat: 35.6780,
                lng: 139.7533,
                desc: 'ประตูเมืองโบราณ จุดนัดพบยอดนิยมของนักวิ่งโตเกียว ใกล้สถานีใต้ดิน Sakuradamon / Hibiya',
                mapsUrl: 'https://maps.google.com/?q=Sakuradamon+Gate'
            },
            {
                name: 'ลานสวน Kokyo Gaien & วิวสะพานแว่นตา Nijubashi',
                type: 'waypoint',
                lat: 35.6815,
                lng: 139.7580,
                desc: 'ทางวิ่งกว้างขวาง วิวสวนต้นสนโบราณและสะพานคู่สัญลักษณ์ของพระราชวัง',
                mapsUrl: 'https://maps.google.com/?q=Kokyo+Gaien+National+Garden'
            },
            {
                name: 'ประตูโอเตมง (Otemon) & ทางเดินริมคูน้ำตะวันออก',
                type: 'waypoint',
                lat: 35.6865,
                lng: 139.7600,
                desc: 'วิ่งเลียบคูน้ำฝั่งตะวันออกผ่านประตูทางเข้าหลักของปราสาทเอโดะเดิม',
                mapsUrl: 'https://maps.google.com/?q=Otemon+Gate+Tokyo'
            },
            {
                name: 'สะพานทาเคบาชิ (Takebashi) & สวน Kitanomaru',
                type: 'waypoint',
                lat: 35.6908,
                lng: 139.7558,
                desc: 'ช่วงเริ่มสโลปขึ้นเนินเบาๆ สัมผัสความร่มรื่นของแมกไม้เลียบคูเมืองตอนเหนือ',
                mapsUrl: 'https://maps.google.com/?q=Takebashi+Station'
            },
            {
                name: 'จุดชมวิวคูเมืองจิโดริกะฟุจิ (Chidorigafuchi) & ประตูฮันโซมง',
                type: 'waypoint',
                lat: 35.6848,
                lng: 139.7437,
                desc: 'จุดสูงสุดของเส้นทาง มองเห็นคูเมืองและตึกระฟ้าฝั่ง Marunouchi จากนั้นวิ่งลงเนินยาวสบายๆ',
                mapsUrl: 'https://maps.google.com/?q=Chidorigafuchi+Moat'
            },
            {
                name: 'เส้นชัย: ครบรอบ 5.0 กม. ที่ประตูซากุราดะมง',
                type: 'end',
                lat: 35.6780,
                lng: 139.7533,
                desc: 'วิ่งวนกลับมาบรรจบที่ประตู Sakuradamon ครบ 1 รอบ 5.0 กม. พอดี คูลดาวน์และขึ้นรถไฟใต้ดิน',
                mapsUrl: 'https://maps.google.com/?q=Sakuradamon+Gate'
            }
        ],
        coordinates: [
            [35.6780, 139.7533],
            [35.6795, 139.7555],
            [35.6815, 139.7580],
            [35.6838, 139.7595],
            [35.6865, 139.7600],
            [35.6888, 139.7585],
            [35.6908, 139.7558],
            [35.6918, 139.7525],
            [35.6914, 139.7495],
            [35.6903, 139.7460],
            [35.6875, 139.7445],
            [35.6848, 139.7437],
            [35.6818, 139.7452],
            [35.6795, 139.7475],
            [35.6780, 139.7510],
            [35.6780, 139.7533]
        ]
    },
    'drive_narita_fuji': {
        id: 'drive_narita_fuji',
        title: '🚗 ขับรถข้ามจังหวัด: สนามบินนาริตะ ➔ ทางด่วน E20 ➔ ฟูจิ คาวากุจิโกะ',
        subtitle: 'เส้นทางขับรถรับรถวันแรก ผ่านโครงข่ายทางด่วนข้ามโตเกียว สู่ทะเลสาบคาวากุจิโกะ',
        type: 'drive',
        typeName: '🚗 ทางด่วนข้ามจังหวัด (Expressway Drive)',
        distance: '175 กม.',
        duration: '2 ชม. 30 นาที - 3 ชม.',
        elevation: 'ไต่ระดับจากระดับน้ำทะเล (NRT) สู่ความสูง ~850 ม. (ฟูจิ)',
        surface: 'ทางด่วนชำระเงินอัตโนมัติ (บัตร ETC ช่องม่วง)',
        highlight: 'แวะศูนย์อาหารยักษ์ EXPASA Dangozaka SA ชิมเนื้อโคชู & วิวฟูจิตลอดทาง',
        color: '#ea580c',
        gmapsDirUrl: 'https://www.google.com/maps/dir/Narita+International+Airport/EXPASA+Dangozaka+(Downbound)/Lake+Kawaguch+Cottage+Minami',
        waypoints: [
            {
                name: 'จุดเริ่มต้น: Nippon Rent-A-Car สนามบินนาริตะ (T2)',
                type: 'start',
                lat: 35.7720,
                lng: 140.3878,
                desc: 'รับรถ Toyota Sienta เสียบบัตร ETC เข้าช่องทางด่วน Higashi-Kanto Expressway มุ่งหน้าทิศตะวันตก',
                mapsUrl: 'https://maps.google.com/?q=Nippon+Rent-A-Car+Narita+Airport'
            },
            {
                name: 'เข้า Shuto Expressway ➔ เชื่อมต่อ Chuo Expressway (E20)',
                type: 'waypoint',
                lat: 35.6680,
                lng: 139.6100,
                desc: 'ผ่านทางด่วนชูโตะ เข้าสู่ด่าน Takaido IC จุดเริ่มต้นทางด่วนสายหลัก Chuo Expwy E20 มุ่งหน้า จ.ยามานาชิ',
                mapsUrl: 'https://maps.google.com/?q=Takaido+IC+Tokyo'
            },
            {
                name: 'จุดพักรถครึ่งทาง: EXPASA Dangozaka SA (E20 ขาออก)',
                type: 'rest',
                lat: 35.6178,
                lng: 139.0664,
                desc: 'จุดแวะพักทานมื้อกลางวัน ข้าวหน้าเนื้อวัวโคชู ซื้อผลไม้สด ยามานาชิ เข้าห้องน้ำ พักผ่อน 1 ชั่วโมง',
                mapsUrl: 'https://maps.google.com/?q=Dangozaka+Service+Area+Downbound'
            },
            {
                name: 'ชุมทาง Otsuki JCT ➔ เบี่ยงเข้าทางด่วน Fujiyoshida Line',
                type: 'waypoint',
                lat: 35.6120,
                lng: 138.9400,
                desc: 'ชิดซ้ายที่ Otsuki JCT เข้าสู่ทางด่วนสายฟูจิโยชิดะ มองเห็นยอดภูเขาไฟฟูจิเบื้องหน้าชัดเจน',
                mapsUrl: 'https://maps.google.com/?q=Otsuki+Junction'
            },
            {
                name: 'ด่านเก็บเงิน Kawaguchiko IC ➔ ถนน Route 139 / 21',
                type: 'waypoint',
                lat: 35.4850,
                lng: 138.7620,
                desc: 'ออกจากทางด่วนผ่านช่อง ETC อัตโนมัติ วิ่งเข้าสู่ถนนเลียบทะเลสาบฝั่งเหนือ Route 21',
                mapsUrl: 'https://maps.google.com/?q=Kawaguchiko+IC'
            },
            {
                name: 'ปลายทาง: บ้านพัก Lake Kawaguch Cottage Minami',
                type: 'end',
                lat: 35.5265,
                lng: 138.7410,
                desc: 'ถึงบ้านพักตากอากาศริมทะเลสาบ เช็คอิน จอดรถหน้าบ้าน พักผ่อนพร้อมวิวฟูจิส่วนตัว',
                mapsUrl: 'https://maps.google.com/?q=Lake+Kawaguch+Cottage+Minami'
            }
        ],
        coordinates: [
            [35.7720, 140.3878],
            [35.7640, 140.3800],
            [35.7280, 140.3200],
            [35.6980, 140.2350],
            [35.6650, 140.1250],
            [35.6700, 140.0150],
            [35.6550, 139.9100],
            [35.6450, 139.8600],
            [35.6350, 139.7900],
            [35.6550, 139.7450],
            [35.6750, 139.7150],
            [35.6820, 139.6850],
            [35.6680, 139.6100],
            [35.6600, 139.5350],
            [35.6700, 139.4500],
            [35.6680, 139.3700],
            [35.6550, 139.2700],
            [35.6320, 139.2100],
            [35.6150, 139.1800],
            [35.6178, 139.0664],
            [35.6120, 138.9400],
            [35.5500, 138.9050],
            [35.4850, 138.7620],
            [35.5050, 138.7600],
            [35.5180, 138.7620],
            [35.5240, 138.7500],
            [35.5265, 138.7410]
        ]
    }
};

let currentRouteId = 'run_kawaguchiko';
let currentFocusedWaypointIdx = null;

// Route Leaflet Map instances
let leafletRouteMap = null;
let leafletRoutePolyline = null;
let leafletRouteMarkers = [];

// Route Google Map instances
let googleRouteMap = null;
let googleRoutePolyline = null;
let googleRouteMarkers = [];
let googleRouteInfoWindow = null;

function openRouteMap(routeId = 'run_kawaguchiko') {
    if (!ROUTE_DATA[routeId]) routeId = 'run_kawaguchiko';
    currentRouteId = routeId;
    currentFocusedWaypointIdx = null;

    setRouteBottomSheet(false);
    openModal('modal-route-map');
    switchRoute(routeId);

    if (navigator.permissions && navigator.permissions.query) {
        navigator.permissions.query({ name: 'geolocation' }).then(result => {
            if (result.state === 'granted' && !userLocation) {
                locateUserPosition(false);
            }
        }).catch(() => {});
    }
}

function switchRoute(routeId) {
    if (!ROUTE_DATA[routeId]) return;
    currentRouteId = routeId;
    currentFocusedWaypointIdx = null;
    const route = ROUTE_DATA[routeId];

    // Update Tabs
    const tabs = document.querySelectorAll('.route-tab-btn');
    tabs.forEach(tab => {
        if (tab.getAttribute('data-route') === routeId) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });

    // Update Header
    const titleEl = document.getElementById('route-modal-title');
    const subtitleEl = document.getElementById('route-modal-subtitle');
    if (titleEl) titleEl.textContent = route.title;
    if (subtitleEl) subtitleEl.textContent = route.subtitle;

    // Update Stats Bar
    const infoBar = document.getElementById('route-info-bar');
    if (infoBar) {
        infoBar.innerHTML = `
            <div class="route-stat-pill"><b>ประเภท:</b> ${route.typeName}</div>
            <div class="route-stat-pill">📏 <b>ระยะทาง:</b> ${route.distance}</div>
            <div class="route-stat-pill">⏱️ <b>เวลาโดยประมาณ:</b> ${route.duration}</div>
            <div class="route-stat-pill">⛰️ <b>ระดับความสูง:</b> ${route.elevation}</div>
            <div class="route-stat-pill">🛣️ <b>สภาพเส้นทาง:</b> ${route.surface}</div>
            <div class="route-overview-text">💡 <b>ไฮไลต์เส้นทาง:</b> ${route.highlight}</div>
        `;
    }

    // Update External Navigation Link in Footer
    const gmapsLink = document.getElementById('route-external-gmaps-link');
    if (gmapsLink) {
        gmapsLink.href = route.gmapsDirUrl;
        gmapsLink.innerHTML = `🗺️ เปิดเส้นทาง "${route.typeName}" ใน Google Maps ↗`;
    }

    // Render Waypoints
    renderRouteWaypoints(route);

    // Render on Map
    initRouteMap(route);
}

function toggleRouteBottomSheet() {
    const panel = document.getElementById('route-waypoints-panel');
    if (!panel) return;
    panel.classList.toggle('sheet-expanded');
}

function setRouteBottomSheet(expanded = false) {
    const panel = document.getElementById('route-waypoints-panel');
    if (!panel) return;
    if (expanded) {
        panel.classList.add('sheet-expanded');
    } else {
        panel.classList.remove('sheet-expanded');
    }
}

function renderRouteWaypoints(route) {
    const listEl = document.getElementById('route-waypoints-list');
    const countEl = document.getElementById('route-waypoints-count');
    if (countEl) {
        countEl.textContent = `📍 จุดเช็คพอยต์ (${route.waypoints.length} จุด)`;
    }
    if (!listEl) return;
    listEl.innerHTML = '';

    route.waypoints.forEach((wp, idx) => {
        const card = document.createElement('div');
        card.className = 'route-waypoint-card';
        card.setAttribute('data-idx', idx);

        let badgeClass = 'waypoint';
        let badgeIcon = idx + 1;
        if (wp.type === 'start') {
            badgeClass = 'start';
            badgeIcon = '🚩';
        } else if (wp.type === 'end') {
            badgeClass = 'end';
            badgeIcon = '🏁';
        } else if (wp.type === 'turn') {
            badgeClass = 'turn';
            badgeIcon = '🔄';
        } else if (wp.type === 'rest') {
            badgeClass = 'rest';
            badgeIcon = '🍱';
        }

        let distBadge = '';
        if (userLocation && wp.lat && wp.lng) {
            const distKm = getDistanceKm(userLocation.lat, userLocation.lng, wp.lat, wp.lng);
            distBadge = `<span class="map-place-distance">📏 ~${formatDistance(distKm)}</span>`;
        }

        card.innerHTML = `
            <div class="route-waypoint-num ${badgeClass}">${badgeIcon}</div>
            <div class="route-waypoint-info">
                <div class="route-waypoint-title">
                    <span>${wp.name}</span>
                    ${distBadge}
                </div>
                <div class="route-waypoint-desc">${wp.desc}</div>
                <a class="route-waypoint-glink" href="${wp.mapsUrl}" target="_blank" onclick="event.stopPropagation();">📍 นำทางใน Google Maps ↗</a>
            </div>
        `;

        card.addEventListener('click', () => {
            focusRouteWaypoint(idx);
        });

        listEl.appendChild(card);
    });
}

function focusRouteWaypoint(idx) {
    const route = ROUTE_DATA[currentRouteId];
    if (!route || !route.waypoints[idx]) return;
    const wp = route.waypoints[idx];
    currentFocusedWaypointIdx = idx;

    // Highlight card
    const cards = document.querySelectorAll('.route-waypoint-card');
    cards.forEach((c, i) => {
        if (i === idx) {
            c.classList.add('active');
            c.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
            c.classList.remove('active');
        }
    });

    if (currentMapMode === 'google' && googleRouteMap && googleRouteMarkers[idx]) {
        googleRouteMap.panTo({ lat: wp.lat, lng: wp.lng });
        googleRouteMap.setZoom(16);
        if (googleRouteInfoWindow) {
            googleRouteInfoWindow.setContent(`
                <div class="custom-infowindow">
                    <h4 style="margin: 0 0 6px 0; color: #1e3a8a; font-size: 0.95rem;">${wp.name}</h4>
                    <p style="margin: 0 0 6px 0; font-size: 0.85rem; color: #475569;">${wp.desc}</p>
                    <a href="${wp.mapsUrl}" target="_blank" style="color: #2563eb; font-weight: 600; text-decoration: none; font-size: 0.82rem;">📍 นำทางใน Google Maps ↗</a>
                </div>
            `);
            googleRouteInfoWindow.open(googleRouteMap, googleRouteMarkers[idx]);
        }
    } else if (currentMapMode === 'leaflet' && leafletRouteMap && leafletRouteMarkers[idx]) {
        leafletRouteMap.setView([wp.lat, wp.lng], 16, { animate: true });
        leafletRouteMarkers[idx].openPopup();
    }
}

function resetRouteFocus() {
    currentFocusedWaypointIdx = null;
    const cards = document.querySelectorAll('.route-waypoint-card');
    cards.forEach(c => c.classList.remove('active'));

    const route = ROUTE_DATA[currentRouteId];
    if (!route) return;

    if (currentMapMode === 'google' && googleRouteMap && googleRoutePolyline) {
        if (googleRouteInfoWindow) googleRouteInfoWindow.close();
        const bounds = new google.maps.LatLngBounds();
        route.coordinates.forEach(pt => bounds.extend({ lat: pt[0], lng: pt[1] }));
        googleRouteMap.fitBounds(bounds);
    } else if (currentMapMode === 'leaflet' && leafletRouteMap && leafletRoutePolyline) {
        leafletRouteMap.closePopup();
        leafletRouteMap.fitBounds(leafletRoutePolyline.getBounds(), { padding: [35, 35] });
    }
}

function initRouteMap(route) {
    const key = getApiKey();
    if (key && !googleMapsAuthFailed) {
        if (window.google && window.google.maps) {
            renderRouteGoogle(route);
        } else {
            loadGoogleMapsScript(key, () => {
                renderRouteGoogle(route);
            });
        }
    } else {
        renderRouteLeaflet(route);
    }
}

function renderRouteLeaflet(route) {
    const container = document.getElementById('route-map-canvas');
    if (!container) return;

    if (googleRouteMap) {
        googleRouteMap = null;
        googleRouteMarkers = [];
        googleRoutePolyline = null;
        container.innerHTML = '';
    }

    if (!leafletRouteMap) {
        leafletRouteMap = L.map('route-map-canvas', {
            zoomControl: true,
            scrollWheelZoom: true
        });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors'
        }).addTo(leafletRouteMap);
    }

    // Clear previous polyline
    if (leafletRoutePolyline) {
        leafletRouteMap.removeLayer(leafletRoutePolyline);
        leafletRoutePolyline = null;
    }

    // Clear previous markers
    leafletRouteMarkers.forEach(m => leafletRouteMap.removeLayer(m));
    leafletRouteMarkers = [];

    // Draw route polyline
    leafletRoutePolyline = L.polyline(route.coordinates, {
        color: route.color,
        weight: 6,
        opacity: 0.85,
        lineJoin: 'round',
        lineCap: 'round'
    }).addTo(leafletRouteMap);

    // Add Waypoint markers
    route.waypoints.forEach((wp, idx) => {
        let badgeClass = 'waypoint';
        let badgeIcon = idx + 1;
        if (wp.type === 'start') { badgeClass = 'start'; badgeIcon = '🚩'; }
        else if (wp.type === 'end') { badgeClass = 'end'; badgeIcon = '🏁'; }
        else if (wp.type === 'turn') { badgeClass = 'turn'; badgeIcon = '🔄'; }
        else if (wp.type === 'rest') { badgeClass = 'rest'; badgeIcon = '🍱'; }

        const icon = L.divIcon({
            className: 'custom-leaflet-marker-wrap',
            html: `<div class="route-pin ${badgeClass}"><span>${badgeIcon}</span></div>`,
            iconSize: [28, 28],
            iconAnchor: [14, 28],
            popupAnchor: [0, -28]
        });

        const popupContent = `
            <div class="custom-infowindow">
                <h4 style="margin: 0 0 6px 0; color: #1e3a8a; font-size: 0.95rem;">${wp.name}</h4>
                <p style="margin: 0 0 6px 0; font-size: 0.85rem; color: #475569;">${wp.desc}</p>
                <a href="${wp.mapsUrl}" target="_blank" style="color: #2563eb; font-weight: 600; font-size: 0.82rem;">📍 นำทางใน Google Maps ↗</a>
            </div>
        `;

        const marker = L.marker([wp.lat, wp.lng], { icon: icon }).addTo(leafletRouteMap);
        marker.bindPopup(popupContent);

        marker.on('click', (e) => {
            L.DomEvent.stopPropagation(e);
            focusRouteWaypoint(idx);
        });

        leafletRouteMarkers.push(marker);
    });

    leafletRouteMap.off('click');
    leafletRouteMap.on('click', () => {
        resetRouteFocus();
    });

    leafletRouteMap.fitBounds(leafletRoutePolyline.getBounds(), { padding: [35, 35] });

    setTimeout(() => {
        if (leafletRouteMap) leafletRouteMap.invalidateSize();
    }, 200);
}

function renderRouteGoogle(route) {
    const container = document.getElementById('route-map-canvas');
    if (!container) return;

    if (leafletRouteMap) {
        leafletRouteMap.remove();
        leafletRouteMap = null;
        leafletRouteMarkers = [];
        leafletRoutePolyline = null;
        container.innerHTML = '';
    }

    if (!googleRouteMap) {
        googleRouteMap = new google.maps.Map(container, {
            zoom: 13,
            center: { lat: route.coordinates[0][0], lng: route.coordinates[0][1] },
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true
        });
        googleRouteInfoWindow = new google.maps.InfoWindow();
        googleRouteInfoWindow.addListener('closeclick', () => {
            resetRouteFocus();
        });
        googleRouteMap.addListener('click', () => {
            resetRouteFocus();
        });
    }

    // Clear previous polyline
    if (googleRoutePolyline) {
        googleRoutePolyline.setMap(null);
        googleRoutePolyline = null;
    }

    // Clear previous markers
    googleRouteMarkers.forEach(m => m.setMap(null));
    googleRouteMarkers = [];

    // Draw Google Polyline
    const path = route.coordinates.map(pt => ({ lat: pt[0], lng: pt[1] }));
    googleRoutePolyline = new google.maps.Polyline({
        path: path,
        geodesic: true,
        strokeColor: route.color,
        strokeOpacity: 0.85,
        strokeWeight: 6,
        map: googleRouteMap
    });

    const bounds = new google.maps.LatLngBounds();
    path.forEach(pt => bounds.extend(pt));

    // Add Waypoint markers
    route.waypoints.forEach((wp, idx) => {
        let labelText = String(idx + 1);
        if (wp.type === 'start') labelText = 'S';
        else if (wp.type === 'end') labelText = 'E';
        else if (wp.type === 'turn') labelText = 'T';
        else if (wp.type === 'rest') labelText = 'R';

        const marker = new google.maps.Marker({
            position: { lat: wp.lat, lng: wp.lng },
            map: googleRouteMap,
            title: wp.name,
            label: {
                text: labelText,
                color: '#ffffff',
                fontWeight: 'bold',
                fontSize: '11px'
            }
        });

        marker.addListener('click', () => {
            focusRouteWaypoint(idx);
        });

        googleRouteMarkers.push(marker);
    });

    googleRouteMap.fitBounds(bounds);

    setTimeout(() => {
        if (googleRouteMap) {
            google.maps.event.trigger(googleRouteMap, 'resize');
            googleRouteMap.fitBounds(bounds);
        }
    }, 200);
}

