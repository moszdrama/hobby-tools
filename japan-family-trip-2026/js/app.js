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

function openDayMap(day, spotId) {
    if (!DAY_LOCATIONS[day]) day = 1;
    currentMapDay = day;
    currentFocusedSpotId = spotId || null;

    openModal('modal-map');
    switchMapDay(day, spotId);
}

function switchMapDay(day, spotId) {
    currentMapDay = day;
    if (spotId) {
        currentFocusedSpotId = spotId;
    }

    // Update Day Tabs
    const tabs = document.querySelectorAll('.map-tab-btn');
    tabs.forEach(tab => {
        const d = parseInt(tab.getAttribute('data-day'));
        if (d === day) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });

    // Update Title
    const titleEl = document.getElementById('map-modal-title');
    if (titleEl) {
        const dayNames = {
            1: 'Day 1: นาริตะ ➔ ทางด่วน E20 ➔ ฟูจิ คาวากุจิโกะ',
            2: 'Day 2: โอชิโนะฮักไก ➔ ล่องเรือ ➔ คืนรถ Asakusa ➔ Ameyoko',
            3: 'Day 3: วัดอาซากุสะ ➔ สวนอุเอโนะ ➔ Akihabara ➔ บุฟเฟต์ Rokkasen',
            4: 'Day 4: ศาลเจ้าเมจิ ➔ Maisen Aoyama ➔ ชิบูย่า ➔ Tokyo Character Street',
            5: 'Day 5: สถานี Keisei Ueno ➔ ตึกม่วง Takeya ➔ Narita Airport T2'
        };
        titleEl.textContent = `🗺️ แผนที่ ${dayNames[day] || 'Day ' + day}`;
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

    if (countEl) {
        countEl.textContent = `📍 สถานที่ในวันนี้ (${spots.length} จุด)`;
    }

    if (!listEl) return;
    listEl.innerHTML = '';

    spots.forEach((spot, idx) => {
        const card = document.createElement('div');
        card.className = 'map-place-card';
        card.setAttribute('data-id', spot.id);
        if (currentFocusedSpotId === spot.id) {
            card.classList.add('active');
        }

        card.innerHTML = `
            <div class="map-place-num">${idx + 1}</div>
            <div class="map-place-info">
                <div class="map-place-top">
                    <span class="map-place-time">⏱️ ${spot.time}</span>
                    <span class="map-place-cat">${spot.category}</span>
                </div>
                <div class="map-place-name">${spot.name}</div>
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

        const content = `
            <div class="custom-infowindow">
                <h4>${spot.name}</h4>
                <p>⏱️ <b>${spot.time}</b> (${spot.category})<br>${spot.desc}</p>
                <a href="${spot.mapsUrl}" target="_blank">📍 นำทางใน Google Maps ↗</a>
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
            html: `<div class="map-marker-pin"><span class="map-marker-text">${idx + 1}</span></div>`,
            iconSize: [28, 28],
            iconAnchor: [14, 28],
            popupAnchor: [0, -28]
        });

        const popupContent = `
            <div class="custom-infowindow">
                <h4>${idx + 1}. ${spot.name}</h4>
                <p>⏱️ <b>${spot.time}</b> (${spot.category})<br>${spot.desc}</p>
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

    const bounds = new google.maps.LatLngBounds();

    spots.forEach((spot, idx) => {
        const position = { lat: spot.lat, lng: spot.lng };
        bounds.extend(position);

        const marker = new google.maps.Marker({
            position: position,
            map: googleMap,
            label: {
                text: String(idx + 1),
                color: '#ffffff',
                fontWeight: 'bold',
                fontSize: '12px'
            },
            title: spot.name
        });

        marker.addListener('click', () => {
            togglePlaceFocus(spot.id);
        });

        googleMarkers[spot.id] = marker;
    });

    googleMap.fitBounds(bounds);

    setTimeout(() => {
        if (googleMap) {
            google.maps.event.trigger(googleMap, 'resize');
        }
        if (currentFocusedSpotId) {
            focusPlace(currentFocusedSpotId);
        }
    }, 200);
}
