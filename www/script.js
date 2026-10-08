// ===============================
// Worker Attendance App v2
// Part 1
// ===============================

let workers = JSON.parse(localStorage.getItem("workers")) || [];

workers.forEach(function(worker){

    if(worker.paid === undefined){

        worker.paid = 0;

    }

    if(!worker.paymentHistory){

        worker.paymentHistory = [];

    }

});

let selectedWorker = -1;
let selectedAttendanceWorker = -1;

let attendanceData = {};

let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();

// PIN Lock

let savedPin =
    localStorage.getItem("appPin") || "";

window.addEventListener("load", function(){

    savedPin = localStorage.getItem("appPin") || "";

    let fingerprintEnabled =
        localStorage.getItem("fingerprintEnabled");

    if(fingerprintEnabled === "true" &&
       window.Fingerprint){

        Fingerprint.show({

            title: "Unlock App",
            subtitle: "Worker Attendance",
            description: "Touch fingerprint sensor",
            disableBackup: true

        },

        function(){

            // Fingerprint Success
            return;

        },

        function(){

            // Fingerprint Failed
            if(savedPin !== ""){

                document.getElementById("pinModal").style.display="flex";

                document.getElementById("pinTitle").innerHTML =
                "Enter PIN";

            }

        });

        return;

    }

    if(savedPin !== ""){

        document.getElementById("pinModal").style.display="flex";

        document.getElementById("pinTitle").innerHTML =
        "Enter PIN";

    }

});

function checkPin(){

    let pin =
        document.getElementById("pinInput").value;

    if(pin.length!=4){

        alert("Enter 4 Digit PIN");
        return;

    }

    if(savedPin===""){

        localStorage.setItem("appPin",pin);

        savedPin=pin;

        alert("PIN Created");

        document.getElementById("pinModal").style.display="none";

        return;

    }

if(pin===savedPin){

    let input = document.getElementById("pinInput");

    input.value = "";

    input.blur();

    if(window.Keyboard && Keyboard.hide){

        Keyboard.hide();

    }

    document.getElementById("pinModal").style.display = "none";

}else{

        alert("Wrong PIN");

        document.getElementById("pinInput").value="";

    }

}

function saveWorkers(){
    localStorage.setItem("workers", JSON.stringify(workers));
}


// ===============================
// Monthly Salary Logic
// ===============================

function getMonthKey(dateString){
    return String(dateString || "").substring(0,7);
}

function getCurrentMonthKey(){
    let now = new Date();
    return now.getFullYear() + "-" +
        String(now.getMonth()+1).padStart(2,"0");
}

function getMonthSalary(worker, monthKey){

    if(!worker.attendance) return 0;

    let hourlyRate = Number(worker.wage || 0) / 8;
    let salary = 0;

    Object.keys(worker.attendance).forEach(function(dateKey){

        if(getMonthKey(dateKey) !== monthKey) return;

        let item = worker.attendance[dateKey] || {};

        if(item.status === "present"){
            salary += Number(worker.wage || 0);
        }

        if(item.status === "half"){
            salary += Number(worker.wage || 0) * 0.5;
        }

        salary += Number(item.ot || 0) * hourlyRate;
    });

    return salary;
}

function getCompletedSalary(worker){

    if(!worker.attendance) return 0;

    let currentMonth = getCurrentMonthKey();
    let months = {};

    Object.keys(worker.attendance).forEach(function(dateKey){

        let key = getMonthKey(dateKey);

        if(key && key < currentMonth){
            months[key] = true;
        }

    });

    let total = 0;

    Object.keys(months).forEach(function(key){
        total += getMonthSalary(worker,key);
    });

    return total;
}

function getCurrentMonthEarnings(worker){
    return getMonthSalary(
        worker,
        getCurrentMonthKey()
    );
}

function getCurrentMonthName(){
    return new Date().toLocaleString(
        "en-US",
        {month:"long"}
    );
}

function renderWorkers(){

    let totalWorkersElement =
        document.getElementById("totalWorkers");

    let currentEarningsElement =
        document.getElementById("currentMonthEarnings");

    let currentMonthTitle =
        document.getElementById("currentMonthEarningsTitle");

    let totalBalanceElement =
        document.getElementById("homeTotalBalance");

    let workingDaysElement =
        document.getElementById("homeWorkingDays");

    let overview =
        document.getElementById("homeWorkerOverview");

    let emptyState =
        document.getElementById("homeEmptyState");


    if(totalWorkersElement){
        totalWorkersElement.innerHTML = workers.length;
    }


    let totalCurrentEarnings = 0;
    let totalBalance = 0;
    let totalWorkingDays = 0;


    if(overview){
        overview.innerHTML = "";
    }


    workers.forEach(function(worker,index){

        if(!worker.attendance){
            worker.attendance = {};
        }

        if(!worker.presentDays){
            worker.presentDays = 0;
        }

        if(!worker.totalOT){
            worker.totalOT = 0;
        }


        let completedSalary =
            getCompletedSalary(worker);

        let currentEarnings =
            getCurrentMonthEarnings(worker);

        let paid =
            Number(worker.paid || 0);

        let balance =
            completedSalary - paid;


        totalCurrentEarnings +=
            currentEarnings;

        totalBalance +=
            balance;


        let currentMonth =
            getCurrentMonthKey();

        let workingDays = 0;

        Object.keys(worker.attendance).forEach(function(dateKey){

            if(getMonthKey(dateKey) !== currentMonth){
                return;
            }

            let item =
                worker.attendance[dateKey] || {};

            if(item.status === "present"){
                workingDays += 1;
            }

            if(item.status === "half"){
                workingDays += 0.5;
            }

        });


        totalWorkingDays +=
            workingDays;


        let initials =
            String(worker.name || "?")
            .trim()
            .charAt(0)
            .toUpperCase();


        if(overview){

            overview.innerHTML += `

                <div
                    class="modern-home-worker-card"
                    onclick="openWorkerCard(${index})">

                    <div class="modern-home-worker-avatar">
                        ${initials}
                    </div>


                    <div class="modern-home-worker-info">

                        <strong>
                            ${worker.name || "Unnamed Worker"}
                        </strong>

                        <span>
                            Daily Wage ₹${Number(worker.wage || 0)}
                        </span>

                    </div>


                    <div class="modern-home-worker-money">

                        <small>Balance</small>

                        <strong>
                            ₹${Math.round(balance)}
                        </strong>

                    </div>


                    <div class="modern-home-worker-arrow">
                        ›
                    </div>

                </div>

            `;

        }

    });


    if(currentEarningsElement){

        currentEarningsElement.innerHTML =
            Math.round(totalCurrentEarnings);

    }


    if(currentMonthTitle){

        currentMonthTitle.innerHTML =
            getCurrentMonthName() + " Earnings";

    }


    if(totalBalanceElement){

        totalBalanceElement.innerHTML =
            Math.round(totalBalance);

    }


    if(workingDaysElement){

        workingDaysElement.innerHTML =
            Number.isInteger(totalWorkingDays)
                ? totalWorkingDays
                : totalWorkingDays.toFixed(1);

    }


    if(emptyState){

        emptyState.style.display =
            workers.length === 0
                ? "flex"
                : "none";

    }

    if(overview){

        overview.style.display =
            workers.length === 0
                ? "none"
                : "flex";

    }


    let dateElement =
        document.getElementById("modernHomeDate");

    if(dateElement){

        let now = new Date();

        dateElement.innerHTML =
            "📅 " +
            now.toLocaleDateString(
                "en-US",
                {
                    day:"numeric",
                    month:"short"
                }
            );

    }

}

function openWorkerCard(index){

    let worker = workers[index];

    if(!worker.attendance){
        worker.attendance = {};
    }

    let present = 0;
    let half = 0;
    let totalOT = 0;

    Object.keys(worker.attendance).forEach(function(dateKey){

        let item = worker.attendance[dateKey] || {};

        if(item.status === "present"){
            present++;
        }

        if(item.status === "half"){
            half++;
        }

        totalOT += Number(item.ot || 0);

    });

    worker.presentDays = present + (half * 0.5);
    worker.halfDays = half;
    worker.totalOT = totalOT;

    let completedSalary =
        typeof getCompletedSalary === "function"
            ? getCompletedSalary(worker)
            : 0;

    let currentEarnings =
        typeof getCurrentMonthEarnings === "function"
            ? getCurrentMonthEarnings(worker)
            : 0;

    let paid = Number(worker.paid || 0);

    let balance = completedSalary - paid;

    let initials =
        String(worker.name || "?")
        .trim()
        .charAt(0)
        .toUpperCase();

    let content =
        document.getElementById("singleWorkerContent");

    if(!content){
        return;
    }

    content.innerHTML = `

        <div style="
            background:#ffffff;
            border-radius:20px;
            padding:20px;
            box-shadow:0 4px 18px rgba(0,0,0,.10);
            margin:10px 0 20px;
        ">

            <div style="
                display:flex;
                align-items:center;
                gap:14px;
                margin-bottom:20px;
            ">

                <div style="
                    width:62px;
                    height:62px;
                    min-width:62px;
                    border-radius:50%;
                    background:#e8f2ff;
                    color:#1976d2;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    font-size:25px;
                    font-weight:700;
                ">
                    ${initials}
                </div>

                <div style="flex:1;">

                    <div style="
                        font-size:22px;
                        font-weight:700;
                        color:#222;
                    ">
                        ${worker.name}
                    </div>

                    <div style="
                        font-size:13px;
                        color:#777;
                        margin-top:4px;
                    ">
                        Daily Wage ₹${Number(worker.wage || 0)}
                    </div>

                </div>

                <button
                    class="menu-btn"
                    onclick="event.stopPropagation(); showMenu(${index},event)"
                    style="
                        width:42px;
                        height:42px;
                        border-radius:50%;
                    "
                >
                    ⋮
                </button>

            </div>


            <div style="
                display:grid;
                grid-template-columns:repeat(2,1fr);
                gap:10px;
                margin-bottom:18px;
            ">

                <div style="
                    background:#eaf7ee;
                    border-radius:14px;
                    padding:14px;
                ">
                    <div style="font-size:12px;color:#666;">
                        Present
                    </div>
                    <div style="
                        font-size:22px;
                        font-weight:700;
                        color:#159447;
                        margin-top:4px;
                    ">
                        ${present}
                    </div>
                </div>


                <div style="
                    background:#fff7df;
                    border-radius:14px;
                    padding:14px;
                ">
                    <div style="font-size:12px;color:#666;">
                        Half Day
                    </div>
                    <div style="
                        font-size:22px;
                        font-weight:700;
                        color:#b77900;
                        margin-top:4px;
                    ">
                        ${half}
                    </div>
                </div>


                <div style="
                    background:#eef4ff;
                    border-radius:14px;
                    padding:14px;
                ">
                    <div style="font-size:12px;color:#666;">
                        OT Hours
                    </div>
                    <div style="
                        font-size:22px;
                        font-weight:700;
                        color:#1976d2;
                        margin-top:4px;
                    ">
                        ${totalOT}h
                    </div>
                </div>


                <div style="
                    background:#fff0f0;
                    border-radius:14px;
                    padding:14px;
                ">
                    <div style="font-size:12px;color:#666;">
                        Paid
                    </div>
                    <div style="
                        font-size:22px;
                        font-weight:700;
                        color:#d93025;
                        margin-top:4px;
                    ">
                        ₹${Math.round(paid)}
                    </div>
                </div>

            </div>


            <div style="
                border-top:1px solid #eee;
                padding-top:15px;
            ">

                <div style="
                    display:flex;
                    justify-content:space-between;
                    padding:10px 0;
                ">
                    <span>💰 Completed Salary</span>
                    <strong>
                        ₹${Math.round(completedSalary)}
                    </strong>
                </div>

                <div style="
                    display:flex;
                    justify-content:space-between;
                    padding:10px 0;
                ">
                    <span>🔵 Balance</span>
                    <strong style="color:#1976d2;">
                        ₹${Math.round(balance)}
                    </strong>
                </div>

                <div style="
                    display:flex;
                    justify-content:space-between;
                    padding:10px 0;
                ">
                    <span>📅 ${getCurrentMonthName()} Earnings</span>
                    <strong style="color:#8a5a00;">
                        ₹${Math.round(currentEarnings)}
                    </strong>
                </div>

            </div>


            <div style="
                display:flex;
                gap:10px;
                margin-top:15px;
            ">

                <button
                    class="attendance-btn"
                    style="flex:1;"
                    onclick="openPaidDialog(${index})"
                >
                    💵 Paid
                </button>




                <button
                    class="attendance-btn"
                    style="flex:1;"
                    onclick="showPaymentMonthSelector(${index})"
                >
                    📜 History
                </button>

                <button
                    class="attendance-btn"
                    style="flex:1;"
                    onclick="showMonthSelector(${index})"
                >
                    📄 PDF
                </button>
            </div>

        </div>
    `;


    document.querySelector(".container").style.display = "none";

    let dashboard =
        document.getElementById("dashboardView");

    if(dashboard){
        dashboard.style.display = "none";
    }

    let workersView =
        document.getElementById("workersView");

    if(workersView){
        workersView.style.display = "none";
    }

    let attendanceView =
        document.getElementById("attendanceView");

    if(attendanceView){
        attendanceView.style.display = "none";
    }

    let salaryView =
        document.getElementById("salaryView");

    if(salaryView){
        salaryView.style.display = "none";
    }

    let bottomNav =
        document.querySelector(".bottom-nav");

    if(bottomNav){
        bottomNav.style.display = "none";
    }

    document.getElementById(
        "singleWorkerView"
    ).style.display = "block";

    window.scrollTo(0,0);

}

function closeWorkerCard(){

    let singleWorker =
        document.getElementById("singleWorkerView");

    if(singleWorker){
        singleWorker.style.display = "none";
    }

    let container =
        document.querySelector(".container");

    if(container){
        container.style.display = "block";
    }

    let dashboard =
        document.getElementById("dashboardView");

    if(dashboard){
        dashboard.style.display = "none";
    }

    let workersView =
        document.getElementById("workersView");

    if(workersView){
        workersView.style.display = "block";
    }

    let attendanceView =
        document.getElementById("attendanceView");

    if(attendanceView){
        attendanceView.style.display = "none";
    }

    let salaryView =
        document.getElementById("salaryView");

    if(salaryView){
        salaryView.style.display = "none";
    }

    let bottomNav =
        document.querySelector(".bottom-nav");

    if(bottomNav){
        bottomNav.style.display = "flex";
    }

    setActiveNav("navWorkers");

    renderWorkersScreen();

    window.scrollTo(0,0);
}

function refreshWorkerCard(index){

    renderWorkers();

    setTimeout(function(){

        openWorkerCard(index);

    },50);

}

function addWorker(){

    let name =
        document.getElementById("name").value.trim();

    let wage =
        Number(document.getElementById("wage").value);

    if(name==="" || wage<=0){

        alert("Please enter worker details");

        return;

    }

workers.push({

    name:name,

    wage:wage,

    presentDays:0,

    totalOT:0,

    paid:0,

    paymentHistory:[],

    attendance:{}

});

    saveWorkers();

    renderWorkers();

    document.getElementById("name").value="";

    document.getElementById("wage").value="";

}

renderWorkers();

// ===============================
// Part 2 - Menu & Attendance
// ===============================

function showMenu(index,event){

    selectedWorker = index;

    let menu = document.getElementById("popupMenu");

    menu.style.display = "block";

    const rect = event.target.getBoundingClientRect();

    const menuWidth = 170;
    const menuHeight = 130;

    let left = rect.right - menuWidth;
    let top = rect.bottom + 5;

    // Right side screen ke bahar na jaye
    if(left + menuWidth > window.innerWidth){
        left = window.innerWidth - menuWidth - 10;
    }

    // Left side screen ke bahar na jaye
    if(left < 10){
        left = 10;
    }

    // Bottom screen ke bahar na jaye
    if(top + menuHeight > window.innerHeight){
        top = rect.top - menuHeight - 5;
    }

    // Top screen ke bahar na jaye
    if(top < 10){
        top = 10;
    }

    menu.style.left = left + "px";
    menu.style.top = top + "px";
}

document.addEventListener("click",function(e){

    if(
        !e.target.closest(".menu-btn") &&
        !e.target.closest("#popupMenu")
    ){

        document.getElementById("popupMenu").style.display="none";

    }

});

function menuDelete(){

    document.getElementById("popupMenu").style.display="none";

    if(confirm("Delete this worker?")){

        deleteWorker(selectedWorker);

    }

}

function deleteWorker(index){

    workers.splice(index,1);

    saveWorkers();

    renderWorkers();

}

function menuHistory(){

    document.getElementById("popupMenu").style.display="none";

    showPaymentMonthSelector(selectedWorker);

}

function openAttendance(index){

    selectedAttendanceWorker=index;

    let today = new Date();
    currentYear = today.getFullYear();
    currentMonth = today.getMonth();

    attendanceData=
        workers[index].attendance || {};

    document.getElementById(
        "attendanceModal"
    ).style.display="flex";

    renderCalendar();

}

function closeAttendance(){

    document.getElementById(
        "attendanceModal"
    ).style.display="none";

}

// ===============================
// Part 3A - Calendar
// ===============================

function renderCalendar(){

    const grid=document.getElementById("calendarGrid");
    grid.innerHTML="";

    const days=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

    days.forEach(day=>{
        let h=document.createElement("div");
        h.className="day-name";
        h.textContent=day;
        grid.appendChild(h);
    });

    const monthNames=[
        "January","February","March","April",
        "May","June","July","August",
        "September","October","November","December"
    ];

    // Today's date
    let today=new Date();
    today.setHours(0,0,0,0);

    let todayYear=today.getFullYear();
    let todayMonth=today.getMonth();
    let todayDay=today.getDate();

    // Future month ko current month par lock karo
    if(
        currentYear > todayYear ||
        (
            currentYear === todayYear &&
            currentMonth > todayMonth
        )
    ){

        currentYear=todayYear;
        currentMonth=todayMonth;

    }

    document.getElementById("calendarTitle").textContent=
        monthNames[currentMonth]+" "+currentYear;

    let firstDay=
        new Date(currentYear,currentMonth,1).getDay();

    let totalDays=
        new Date(currentYear,currentMonth+1,0).getDate();

    for(let i=0;i<firstDay;i++){

        grid.appendChild(
            document.createElement("div")
        );

    }

    for(let day=1;day<=totalDays;day++){

        let dateKey=
            currentYear+"-"+
            String(currentMonth+1).padStart(2,"0")+"-"+
            String(day).padStart(2,"0");

        let selectedDateObj=
            new Date(currentYear,currentMonth,day);

        selectedDateObj.setHours(0,0,0,0);

        // Future date
        let isFutureDate =
            selectedDateObj > today;

        let box=document.createElement("div");

        box.className="calendar-day";

        // --------------------------------
        // Future date = completely blank
        // --------------------------------
        if(isFutureDate){

            box.innerHTML="<div>"+day+"</div>";

            box.style.background="";
            box.style.color="";

            box.onclick=null;

            grid.appendChild(box);

            continue;

        }

        // --------------------------------
        // Past / Today attendance
        // --------------------------------

        let item=attendanceData[dateKey];

let futureDate = new Date(currentYear,currentMonth,day);
futureDate.setHours(0,0,0,0);

if(futureDate > today){

    let box=document.createElement("div");

    box.className="calendar-day";

    box.style.background="#f5f5f5";
    box.style.color="#c8c8c8";
    box.style.opacity="0.45";
    box.style.cursor="not-allowed";
    box.style.pointerEvents="none";

    box.innerHTML="<div>"+day+"</div>";

    grid.appendChild(box);

    continue;
}

        if(item){

            if(item.status==="present"){

                box.style.background="#4CAF50";
                box.style.color="#fff";

            }

            if(item.status==="absent"){

                box.style.background="#F44336";
                box.style.color="#fff";

            }

            if(item.status==="half"){

                box.style.background="#FFD54F";
                box.style.color="#000";

            }

        }

        let html="<div>"+day+"</div>";

        if(item){

            if(item.status==="present")
                html+="<small>P</small>";

            if(item.status==="absent")
                html+="<small>A</small>";

            if(item.status==="half")
                html+="<small>H</small>";

            if(item.ot>0)
                html+="<small>OT:"+item.ot+"h</small>";

        }

        box.innerHTML=html;

        box.onclick=()=>{

            selectedDate=dateKey;

            document.getElementById(
                "selectedDateTitle"
            ).innerHTML=dateKey;

            document.getElementById(
                "dateActionModal"
            ).style.display="flex";

        };

        grid.appendChild(box);

    }

}

// ===============================
// Part 3B - Attendance Actions
// ===============================

let selectedDate = "";

function prevMonth(){

    currentMonth--;

    if(currentMonth<0){
        currentMonth=11;
        currentYear--;
    }

    renderCalendar();
}

function nextMonth(){

    let today=new Date();

    let todayYear=today.getFullYear();
    let todayMonth=today.getMonth();

    // Future month me jane se roko
    if(
        currentYear > todayYear ||
        (
            currentYear === todayYear &&
            currentMonth >= todayMonth
        )
    ){

        return;

    }

    currentMonth++;

    if(currentMonth>11){

        currentMonth=0;
        currentYear++;

    }

    renderCalendar();

}

function openDateAction(dateKey){

    selectedDate = dateKey;

    let item = attendanceData[dateKey];

    if(!item){
        item = {
            status:"",
            ot:0
        };
    }

    let parts = dateKey.split("-");

    let monthNames = [
        "January","February","March","April",
        "May","June","July","August",
        "September","October","November","December"
    ];

    let displayDate =
        Number(parts[2]) + " " +
        monthNames[Number(parts[1])-1] + " " +
        parts[0];

    document.getElementById(
        "selectedDateTitle"
    ).innerHTML = displayDate;

    let input =
        document.getElementById("dateOTInput");

    if(input){
        input.value =
            item.ot !== undefined && item.ot !== null
                ? Number(item.ot)
                : 0;
    }

    updateModernAttendanceStatus(
        item.status || ""
    );

    updateModernOTHint();

    document.getElementById(
        "dateActionModal"
    ).style.display = "flex";

}

function updateModernAttendanceStatus(status){

    [
        "statusPresentBtn",
        "statusHalfBtn",
        "statusAbsentBtn"
    ].forEach(function(id){

        let btn = document.getElementById(id);

        if(btn){
            btn.classList.remove("modern-status-selected");
        }

    });

    let selectedId = "";

    if(status === "present"){
        selectedId = "statusPresentBtn";
    }

    if(status === "half"){
        selectedId = "statusHalfBtn";
    }

    if(status === "absent"){
        selectedId = "statusAbsentBtn";
    }

    if(selectedId){

        let btn = document.getElementById(selectedId);

        if(btn){
            btn.classList.add("modern-status-selected");
        }

    }
}


function markDatePresent(){

    attendanceData[selectedDate] =
        attendanceData[selectedDate] || {
            status:"present",
            ot:0
        };

    attendanceData[selectedDate].status = "present";

    updateModernAttendanceStatus("present");
}


function markDateAbsent(){

    attendanceData[selectedDate] =
        attendanceData[selectedDate] || {
            status:"absent",
            ot:0
        };

    attendanceData[selectedDate].status = "absent";

    updateModernAttendanceStatus("absent");
}


function markDateHalfDay(){

    attendanceData[selectedDate] =
        attendanceData[selectedDate] || {
            status:"half",
            ot:0
        };

    attendanceData[selectedDate].status = "half";

    updateModernAttendanceStatus("half");
}


function changeDateOT(step){

    let input = document.getElementById("dateOTInput");

    if(!input){
        return;
    }

    let value = Number(input.value || 0);

    value += Number(step || 0);

    if(value < 0){
        value = 0;
    }

    value = Math.round(value * 2) / 2;

    input.value = value;

    updateModernOTHint();
}


function updateModernOTHint(){

    let input = document.getElementById("dateOTInput");
    let hint = document.getElementById("modernOTHint");

    if(!input || !hint){
        return;
    }

    let value = Number(input.value || 0);

    hint.innerHTML =
        "OT: " +
        value +
        (value === 1 ? " hour" : " hours");
}


function saveDateOT(){

    let input = document.getElementById("dateOTInput");

    if(!input){
        return;
    }

    let ot = Number(input.value || 0);

    if(isNaN(ot) || ot < 0){
        alert("Invalid OT Hours");
        return;
    }

    ot = Math.round(ot * 2) / 2;

    attendanceData[selectedDate] =
        attendanceData[selectedDate] || {
            status:"present",
            ot:0
        };

    attendanceData[selectedDate].ot = ot;

    if(!attendanceData[selectedDate].status){
        attendanceData[selectedDate].status = "present";
    }

    updateAttendance();
}


function addDateOT(){

    let input = document.getElementById("dateOTInput");

    if(input){
        input.focus();
        input.select();
    }
}


function updateAttendance(){

    workers[selectedAttendanceWorker].attendance =
        attendanceData;

    let present = 0;
    let halfDays = 0;
    let totalOT = 0;

    Object.values(attendanceData).forEach(item=>{

        if(item.status==="present"){
            present++;
        }

        if(item.status==="half"){
            halfDays++;
        }

        totalOT += Number(item.ot || 0);

    });

    workers[selectedAttendanceWorker].presentDays =
        present + (halfDays * 0.5);

    workers[selectedAttendanceWorker].halfDays =
        halfDays;

    workers[selectedAttendanceWorker].totalOT =
        totalOT;

    saveWorkers();

    renderCalendar();

    closeDateAction();

    closeAttendance();

    renderAttendanceWorkers();

}

function closeDateAction(){

    document.getElementById(
        "dateActionModal"
    ).style.display="none";

}

// ===============================
// Part 4A - Edit / Delete / History
// ===============================

function editWorker(index){

    let name = prompt(
        "Worker Name",
        workers[index].name
    );

    if(name===null || name.trim()==="") return;

    let wage = prompt(
        "Daily Wage",
        workers[index].wage
    );

    if(wage===null) return;

    wage = Number(wage);

    if(isNaN(wage) || wage<=0){

        alert("Invalid wage");

        return;

    }

    workers[index].name = name.trim();
    workers[index].wage = wage;

    saveWorkers();

    renderWorkers();

}

function deleteWorker(index){

    if(!confirm("Delete this worker?")) return;

    workers.splice(index,1);

    saveWorkers();

    document.getElementById(
        "singleWorkerView"
    ).style.display = "none";

    document.querySelector(
        ".container"
    ).style.display = "block";

    document.getElementById(
        "dashboardView"
    ).style.display = "block";

    renderWorkers();

}

function menuDelete(){

    document.getElementById(
        "popupMenu"
    ).style.display="none";

    deleteWorker(selectedWorker);

}

function menuHistory(){

    document.getElementById(
        "popupMenu"
    ).style.display="none";

    showPaymentMonthSelector(selectedWorker);

}

function showPaymentMonthSelector(index){

    let worker = workers[index];
    let months = {};

    (worker.paymentHistory || []).forEach(function(item){
        let key = item.date.substring(0,7);
        months[key] = true;
    });

    let html = "";

    const monthNames = [
        "January","February","March","April",
        "May","June","July","August",
        "September","October","November","December"
    ];

    Object.keys(months).sort().reverse().forEach(function(key){

        let p = key.split("-");

        let title =
            monthNames[Number(p[1]) - 1] +
            " " +
            p[0];

        html += `
<button class="modern-month-card"
        onclick="showPaymentHistory(${index},'${key}')">
    <span class="modern-month-icon">📜</span>
    <span class="modern-month-info">
        <strong>${title}</strong>
        <small>Payment History</small>
    </span>
    <span class="modern-month-arrow">›</span>
</button>`;

    });

    if(html === ""){
        html = `
<div class="modern-month-empty">
    <div>📜</div>
    <strong>No payment history</strong>
    <span>No payment records are available yet.</span>
</div>`;
    }

    document.getElementById("paymentMonthList").innerHTML = html;

    document.getElementById("paymentMonthModal").style.display = "flex";
}

function showPaymentHistory(index, selectedMonth){

    let worker = workers[index];

    let payments = (worker.paymentHistory || [])
        .map(function(item, originalIndex){
            return {
                ...item,
                originalIndex: originalIndex
            };
        })
        .filter(function(item){
            return item.date.substring(0,7) === selectedMonth;
        });

    let monthParts = selectedMonth.split("-");

    const monthNames = [
        "January","February","March","April",
        "May","June","July","August",
        "September","October","November","December"
    ];

    let monthTitle =
        monthNames[Number(monthParts[1]) - 1] +
        " " +
        monthParts[0];

    let html = `
        <div class="modern-payment-header">
            <div class="modern-payment-icon">💵</div>
            <div>
                <h2>Payment History</h2>
                <span>${monthTitle}</span>
            </div>
        </div>
    `;

    if(payments.length === 0){

        html += `
            <div class="modern-payment-empty">
                <div>💵</div>
                <strong>No payment found</strong>
                <span>No payment records are available for this month.</span>
            </div>
        `;

    }else{

        payments.forEach(function(item){

            let parts = item.date.split("-");

            let showDate =
                parts[2] +
                " " +
                [
                    "Jan","Feb","Mar","Apr",
                    "May","Jun","Jul","Aug",
                    "Sep","Oct","Nov","Dec"
                ][Number(parts[1]) - 1] +
                " " +
                parts[0];

            html += `
                <div class="modern-payment-card">

                    <div class="modern-payment-date">
                        <div class="modern-payment-date-icon">
                            📅
                        </div>

                        <div class="modern-payment-date-info">
                            <strong>${showDate}</strong>
                            <small>Payment received</small>
                        </div>
                    </div>

                    <div class="modern-payment-amount">
                        ₹${Number(item.amount || 0)}
                    </div>

                    <div class="modern-payment-actions">

                        <button
                            class="modern-payment-edit"
                            onclick="editPayment(${index},${item.originalIndex},'${selectedMonth}')">
                            ✏️ Edit
                        </button>

                        <button
                            class="modern-payment-delete"
                            onclick="deletePayment(${index},${item.originalIndex},'${selectedMonth}')">
                            🗑 Delete
                        </button>

                    </div>

                </div>
            `;

        });

    }

    html += `
        <button
            class="modern-payment-close"
            onclick="closePaymentHistory()">
            Close
        </button>
    `;

    document.getElementById(
        "paymentMonthModal"
    ).style.display = "none";

    document.getElementById(
        "paymentHistoryContent"
    ).innerHTML = html;

    document.getElementById(
        "paymentHistoryModal"
    ).style.display = "flex";

}

function closePaymentHistory(){

    document.getElementById(
        "paymentHistoryModal"
    ).style.display = "none";

}

function editPayment(workerIndex, paymentIndex, selectedMonth){

    let worker = workers[workerIndex];

    let payment = worker.paymentHistory[paymentIndex];

    let amount = prompt(
        "Enter new payment amount",
        payment.amount
    );

    if(amount === null){
        return;
    }

    amount = Number(amount);

    if(amount <= 0){

        alert("Enter valid amount");
        return;

    }

    let parts = payment.date.split("-");

    let day = parts[2];
    let month = parts[1];
    let year = parts[0];

    let newDate = prompt(
        "Enter date DD/MM/YYYY",
        day + "/" + month + "/" + year
    );

    if(newDate === null){
        return;
    }

    let dateParts = newDate.split("/");

    if(dateParts.length !== 3){

        alert("Use DD/MM/YYYY format");
        return;

    }

    let newDay = Number(dateParts[0]);
    let newMonth = Number(dateParts[1]);
    let newYear = Number(dateParts[2]);

    let checkDate =
        new Date(newYear, newMonth - 1, newDay);

    if(
        checkDate.getFullYear() !== newYear ||
        checkDate.getMonth() !== newMonth - 1 ||
        checkDate.getDate() !== newDay
    ){

        alert("Please enter a valid date");
        return;

    }

    let newPaid =
        (worker.paid || 0) -
        Number(payment.amount) +
        amount;

    let hourlyRate = worker.wage / 8;

    let salary =
        (worker.presentDays * worker.wage) +
        (worker.totalOT * hourlyRate);

    if(newPaid > salary){

        alert(
            "Payment cannot be greater than Salary"
        );

        return;

    }

    payment.amount = amount;

    payment.date =
        newYear + "-" +
        String(newMonth).padStart(2,"0") + "-" +
        String(newDay).padStart(2,"0");

    worker.paid = newPaid;

saveWorkers();

document.getElementById(
    "paymentHistoryModal"
).style.display = "none";

refreshWorkerCard(workerIndex);

alert("Payment Updated Successfully");

}

function deletePayment(workerIndex, paymentIndex, selectedMonth){

    let worker =
        workers[workerIndex];

    let payment =
        worker.paymentHistory[paymentIndex];

    if(!payment){
        return;
    }

    let confirmDelete = confirm(
        "Delete payment of ₹" +
        payment.amount +
        "?"
    );

    if(!confirmDelete){
        return;
    }

    worker.paid =
        (worker.paid || 0) -
        Number(payment.amount);

    if(worker.paid < 0){
        worker.paid = 0;
    }

    worker.paymentHistory.splice(
        paymentIndex,
        1
    );

saveWorkers();

document.getElementById(
    "paymentHistoryModal"
).style.display = "none";

refreshWorkerCard(workerIndex);

alert("Payment Deleted Successfully");

}

function closePaymentMonthSelector(){

    document.getElementById(
        "paymentMonthModal"
    ).style.display = "none";

}

function showHistory(index){

    let worker = workers[index];

    let dates = Object.keys(
        worker.attendance || {}
    );

    if(dates.length===0){

        alert("No attendance found.");

        return;

    }

    dates.sort();

    let text =
        worker.name +
        "\n\nAttendance History\n\n";

    dates.forEach(date=>{

let item =
    worker.attendance[date];

let d = new Date(date);

let showDate =
    d.toLocaleDateString("en-GB",{
        day:"2-digit",
        month:"short",
        year:"numeric"
    });

let status = item.status.toUpperCase();

if(status=="PRESENT") status="P";
if(status=="ABSENT") status="A";
if(status=="HALF") status="H";

text +=
    showDate +
    " : " +
    status;

        if(item.ot>0){

            text +=
            " | OT " +
            item.ot +
            "h";

        }

        text += "\n";

    });

if(worker.paymentHistory && worker.paymentHistory.length){

    text += "\n\n💵 Payment History\n\n";

    worker.paymentHistory.forEach(function(item){

let d = new Date(item.date);

let showDate = d.toLocaleDateString("en-GB",{
    day:"2-digit",
    month:"short",
    year:"numeric"
});

let showTime = d.toLocaleTimeString("en-US",{
    hour:"2-digit",
    minute:"2-digit",
    hour12:true
});

text +=
    showDate + " " +
    showTime +
    "  ₹" +
    item.amount +
    "\n";

    });

}

    alert(text);

}

// ===============================
// Part 4B - PDF Report
// ===============================

function menuPDF(){

    document.getElementById("popupMenu").style.display="none";

    showMonthSelector(selectedWorker);

}

function showMonthSelector(index){

    let worker = workers[index];
    let months = {};

    Object.keys(worker.attendance || {}).forEach(function(date){

        let key = date.substring(0,7);
        months[key] = true;

    });

    let html = "";

    const monthNames = [
        "January","February","March","April",
        "May","June","July","August",
        "September","October","November","December"
    ];

    Object.keys(months).sort().reverse().forEach(function(key){

        let p = key.split("-");

        let title =
            monthNames[Number(p[1]) - 1] +
            " " +
            p[0];

        html += `
<button class="modern-month-card"
        onclick="downloadWorkerPDF(${index},'${key}')">

    <span class="modern-month-icon">📄</span>

    <span class="modern-month-info">
        <strong>${title}</strong>
        <small>Attendance Report PDF</small>
    </span>

    <span class="modern-month-arrow">›</span>

</button>`;

    });

    if(html === ""){

        html = `
<div class="modern-month-empty">
    <div>📄</div>
    <strong>No attendance found</strong>
    <span>No attendance records are available yet.</span>
</div>`;

    }

    document.getElementById("monthList").innerHTML = html;

    document.getElementById(
        "monthSelectorModal"
    ).style.display = "flex";

}


function closeMonthSelector(){

    document.getElementById(
        "monthSelectorModal"
    ).style.display = "none";

}


function closePinManager(){

    document.getElementById("pinManagerModal").style.display = "none";

    let input = document.getElementById("pinManagerInput");

    input.blur();

    input.value = "";

    if(window.Keyboard && Keyboard.hide){

        Keyboard.hide();

    }

}

let selectedPaidWorker = -1;

function openPaidDialog(index){

    selectedPaidWorker = index;

    document.getElementById("paidInput").value = "";

let today = new Date();

document.getElementById("paidDay").value =
    String(today.getDate()).padStart(2,"0");

document.getElementById("paidMonth").value =
    String(today.getMonth() + 1).padStart(2,"0");

document.getElementById("paidYear").value =
    today.getFullYear();

    document.getElementById("paidModal").style.display = "flex";

    setTimeout(function(){

        document.getElementById("paidInput").focus();

    },100);

}

function closePaidDialog(){

    document.getElementById("paidModal").style.display = "none";

    document.getElementById("paidInput").value = "";

    if(window.Keyboard && Keyboard.hide){

        Keyboard.hide();

    }

}

function savePaidAmount(){

    let amount = Number(
        document.getElementById("paidInput").value
    );

    if(amount <= 0){

        alert("Enter valid amount");
        return;

    }

    let day =
        document.getElementById("paidDay").value;

    let month =
        document.getElementById("paidMonth").value;

    let year =
        document.getElementById("paidYear").value;

    if(day === "" || month === "" || year === ""){

        alert("Please enter payment date");
        return;

    }

    day = Number(day);
    month = Number(month);
    year = Number(year);

    let selectedDate =
        new Date(year, month - 1, day);

    if(
        selectedDate.getFullYear() !== year ||
        selectedDate.getMonth() !== month - 1 ||
        selectedDate.getDate() !== day
    ){

        alert("Please enter a valid date");
        return;

    }

    let paidDate =
        year + "-" +
        String(month).padStart(2,"0") + "-" +
        String(day).padStart(2,"0");

    let worker =
        workers[selectedPaidWorker];

    let salary =
        getCompletedSalary(worker);

    let balance =
        salary - (worker.paid || 0);

    if(amount > balance){

        alert(
            "Amount cannot be greater than completed Salary Balance"
        );

        return;

    }

    worker.paid =
        (worker.paid || 0) + amount;

    if(!worker.paymentHistory){

        worker.paymentHistory = [];

    }

    worker.paymentHistory.push({

        amount: amount,

        date: paidDate

    });

    saveWorkers();

    refreshWorkerCard(
        selectedPaidWorker
    );

    closePaidDialog();

}


function changePin(){

    let oldPin = localStorage.getItem("appPin") || "";

    openPinManager("Enter Current PIN", function(current){

        if(current !== oldPin){

            alert("Wrong PIN");
            return;

        }

        closePinManager();

        openPinManager("Enter New PIN", function(newPin){

            if(newPin.length !== 4){

                alert("PIN must be exactly 4 digits");
                return;

            }

            localStorage.setItem("appPin", newPin);

            savedPin = newPin;

            alert("PIN Changed Successfully");

            closePinManager();

            closeSettings();

        });

    });

}

function removePin(){

    let saved = localStorage.getItem("appPin") || "";

    openPinManager("Enter Current PIN", function(pin){

        if(pin !== saved){

            alert("Wrong PIN");
            return;

        }

        if(confirm("Remove PIN Lock?")){

            localStorage.removeItem("appPin");

            savedPin = "";

            alert("PIN Removed Successfully");

            closePinManager();

            closeSettings();

        }

    });

}

async function backupData(){

    let backup = {

        workers: workers,

        pin: localStorage.getItem("appPin") || ""

    };

    let text =
        JSON.stringify(backup, null, 2);

    let fileName =
        "WorkerAttendance_Backup.json";

    // Android APK
    if(
        window.cordova &&
        cordova.plugins &&
        cordova.plugins.safMediastore
    ){

        try{

            let bytes =
                new TextEncoder().encode(text);

            let binary = "";

            for(let i = 0; i < bytes.length; i++){

                binary +=
                    String.fromCharCode(bytes[i]);

            }

            let base64Data =
                btoa(binary);

            await cordova.plugins.safMediastore.writeFile({

                data: base64Data,

                filename: fileName

            });

            alert(
                "Backup saved successfully in Downloads"
            );

            closeSettings();

        }
        catch(error){

            alert(
                "Backup Save Error\n" +
                JSON.stringify(error)
            );

        }

        return;

    }

    // Browser
    let blob =
        new Blob(
            [text],
            {
                type:"application/json"
            }
        );

    let link =
        document.createElement("a");

    link.href =
        URL.createObjectURL(blob);

    link.download =
        fileName;

    link.click();

    URL.revokeObjectURL(
        link.href
    );

}

function restoreData(){

    document.getElementById(
        "restoreFile"
    ).click();

}

function restoreFileSelected(event){

    let file = event.target.files[0];

    if(!file) return;

    let reader = new FileReader();

    reader.onload = function(e){

        try{

            let backup =
                JSON.parse(e.target.result);

            if(backup.workers){

                workers = backup.workers;

                localStorage.setItem(
                    "workers",
                    JSON.stringify(workers)
                );

            }

            if(backup.pin){

                localStorage.setItem(
                    "appPin",
                    backup.pin
                );

                savedPin = backup.pin;

            }

            saveWorkers();

            renderWorkers();

            alert("Backup Restored Successfully");

            closeSettings();

        }catch(err){

            alert("Invalid Backup File");

        }

    };

    reader.readAsText(file);

}

function aboutApp(){

    alert(
        "👷 Worker Attendance App\n\n" +
        "Version : 1.0.18\n\n" +
        "Developer : Safaul Ansari\n\n" +
        "Features:\n" +
        "✔ Worker Management\n" +
        "✔ Attendance Calendar\n" +
        "✔ Salary Calculation\n" +
        "✔ Half Day\n" +
        "✔ Overtime\n" +
        "✔ PDF Report\n" +
        "✔ Excel Export\n" +
        "✔ PIN Lock\n" +
        "✔ Backup & Restore\n\n" +
        "© 2026"
    );

}

function enablePinLock(){

    if(localStorage.getItem("appPin")){

        alert("PIN Lock is already enabled");
        return;

    }

    openPinManager("Create 4 Digit PIN", function(pin){

        if(pin.length !== 4){

            alert("PIN must be exactly 4 digits");
            return;

        }

        localStorage.setItem("appPin", pin);

        savedPin = pin;

        alert("PIN Lock Enabled Successfully");

        closePinManager();

        closeSettings();

    });

}

function toggleFingerprint(){

    if(!window.Fingerprint){

        alert("Fingerprint is available only in Android App");
        return;

    }

    let enabled =
        localStorage.getItem("fingerprintEnabled") === "true";

    // OFF → ON
    if(!enabled){

        Fingerprint.isAvailable(function(){

            Fingerprint.show({

                title:"Enable Fingerprint",
                subtitle:"Worker Attendance",
                description:"Touch fingerprint sensor",
                disableBackup:true

            },function(){

                localStorage.setItem(
                    "fingerprintEnabled",
                    "true"
                );

                document.getElementById("fingerprintBtn").innerHTML =
                    "👆 Fingerprint Lock : ON";

                alert("Fingerprint Enabled");

                closeSettings();

            },function(error){

                alert("Fingerprint Failed\n"+error);

            });

        },function(){

            alert("Fingerprint not available");

        });

    }

    // ON → OFF
    else{

        if(confirm("Disable Fingerprint Lock?")){

            localStorage.removeItem("fingerprintEnabled");

            document.getElementById("fingerprintBtn").innerHTML =
                "👆 Fingerprint Lock : OFF";

            alert("Fingerprint Disabled");

            closeSettings();

        }

    }

}

function openSettings(event){

    if(event){
        event.stopPropagation();
    }

    let modal = document.getElementById("settingsModal");

    if(!modal){
        return;
    }

    modal.style.display = "flex";

    let fingerprintBtn =
        document.getElementById("fingerprintBtn");

    if(fingerprintBtn){

        let enabled =
            localStorage.getItem("fingerprintEnabled") === "true";

        fingerprintBtn.innerHTML =
            enabled
                ? "👆 Fingerprint Lock : ON"
                : "👆 Fingerprint Lock : OFF";
    }
}

function closeSettings(){

    let modal = document.getElementById("settingsModal");

    if(!modal){
        return;
    }

    modal.style.display = "none";
}

function downloadWorkerPDF(index, selectedMonth){

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    let worker = workers[index];

    let attendance = {};

    Object.keys(worker.attendance || {}).forEach(date=>{

        if(date.startsWith(selectedMonth)){
            attendance[date]=worker.attendance[date];
        }

    });

let presentDays = 0;
let halfDays = 0;
let totalOT = 0;

Object.values(attendance).forEach(item=>{

    if(item.status==="present"){
        presentDays++;
    }

    if(item.status==="half"){
        halfDays++;
    }

    totalOT += item.ot || 0;

});

let hourlyRate = worker.wage / 8;

let salary =
    ((presentDays + (halfDays * 0.5)) * worker.wage) +
    (totalOT * hourlyRate);

let absentDays =
    new Date(
        parseInt(selectedMonth.split("-")[0]),
        parseInt(selectedMonth.split("-")[1]),
        0
    ).getDate() - presentDays - halfDays;

const monthNames = [
"January","February","March","April",
"May","June","July","August",
"September","October","November","December"
];

let monthTitle = selectedMonth;

if(selectedMonth){

    let p = selectedMonth.split("-");

    monthTitle =
        monthNames[parseInt(p[1])-1] +
        " " +
        p[0];

}
doc.setFillColor(16,72,138);
doc.rect(0,0,210,30,"F");

doc.setTextColor(255,255,255);
doc.setFont("helvetica","bold");
doc.setFontSize(22);
doc.text("WORKER ATTENDANCE REPORT",18,18);

doc.setTextColor(0,0,0);

doc.setFont("helvetica","normal");
doc.setFontSize(11);

doc.text("Report Month : " + monthTitle,150,12);

let today=new Date();

const months = [
"Jan","Feb","Mar","Apr","May","Jun",
"Jul","Aug","Sep","Oct","Nov","Dec"
];

let reportDate =
String(today.getDate()).padStart(2,"0") +
" " +
months[today.getMonth()] +
" " +
today.getFullYear();

doc.text("Report Date : " + reportDate,150,20);

doc.setDrawColor(16,72,138);
doc.line(15,35,195,35);

doc.setFont("helvetica","normal");
doc.setFontSize(11);
doc.setDrawColor(16,72,138);
doc.roundedRect(15,50,180,45,3,3);

doc.setFont("helvetica","bold");
doc.setFontSize(13);
doc.text("WORKER DETAILS",20,58);

doc.setFont("helvetica","normal");
doc.setFontSize(11);

doc.text("Worker Name : " + worker.name,20,68);
doc.text("Daily Rate  : Rs." + worker.wage,20,76);

doc.text("Present Days : " + presentDays,110,68);
doc.text("Half Days : " + halfDays,110,76);

doc.text("Absent Days : " + absentDays,20,84);
doc.text("Total OT : " + totalOT + "h",110,84);

doc.text("Total Salary : Rs." + Math.round(salary),20,92);

doc.line(20,100,190,100);

    let y=109;

doc.setFont("helvetica","bold");
doc.setFontSize(14);
doc.text("ATTENDANCE CALENDAR",20,y);

y += 8;

doc.setFillColor(16,72,138);

const headers = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

doc.setFont("helvetica","bold");
doc.setFontSize(9);

for(let i=0;i<7;i++){

    let hx = 15 + (i * 26);

    doc.setFillColor(16,72,138);
    doc.rect(hx, y, 26, 10, "F");

    doc.setTextColor(255,255,255);
    doc.text(headers[i], hx + 13, y + 6, {
        align: "center"
    });

}

doc.setTextColor(0,0,0);
y += 15;
// Calendar Border

doc.setDrawColor(180);

for(let i=0;i<=7;i++){

    doc.line(
        15,
        y + (i*18),
        197,
        y + (i*18)
    );

}

for(let i=0;i<=7;i++){

    doc.line(
        15 + (i*26),
        y,
        15 + (i*26),
        y + 126
    );

}
const firstDay =
new Date(selectedMonth + "-01").getDay();

const daysInMonth =
new Date(
parseInt(selectedMonth.split("-")[0]),
parseInt(selectedMonth.split("-")[1]),
0
).getDate();

let startX = 15;
let cellW = 26;
let cellH = 18;

let row = 0;
let col = firstDay;

for(let day=1; day<=daysInMonth; day++){

    let x = startX + (col * cellW);
    let yy = y + (row * cellH);

    doc.setFont("helvetica","bold");
    doc.setFontSize(18);

    doc.text(
        String(day),
        x + 3,
        yy + 6
    );
let dateKey =
    selectedMonth + "-" +
    String(day).padStart(2,"0");

let item = attendance[dateKey];

if(item){

    doc.setFont("helvetica","normal");
doc.setFontSize(17);
doc.setFont("helvetica","bold");

if(item.status==="present"){

    doc.setTextColor(0,130,0);
    doc.text("P", x+18, yy+6);

}else if(item.status==="half"){

    doc.setTextColor(255,170,0);
    doc.text("H", x+18, yy+6);

}else{

    doc.setTextColor(220,0,0);
    doc.text("A", x+18, yy+6);

}

    if(item.ot>0){

        doc.setTextColor(255,140,0);
doc.setFontSize(13);
doc.setFont("helvetica","bold");

        doc.text(
            "+"+item.ot+"h",
            x+2,
            yy+15
        );

    }

    doc.setTextColor(0,0,0);

}
    col++;

    if(col>6){

        col = 0;
        row++;

    }

}
// SUMMARY BOX

let summaryY = 255;

doc.setDrawColor(180);
doc.roundedRect(15, summaryY, 180, 24, 3, 3);

doc.setFont("helvetica","bold");
doc.setFontSize(11);

doc.setTextColor(0,130,0);
doc.text("Present : " + presentDays, 22, summaryY + 10);

doc.setTextColor(220,0,0);
doc.text("Absent : " + absentDays, 70, summaryY + 10);

doc.setTextColor(0,90,180);
doc.text("OT : " + totalOT + "h", 118, summaryY + 10);

doc.setTextColor(0,0,0);
doc.text("Salary : Rs." + Math.round(salary), 150, summaryY + 10);

doc.setFont("helvetica","normal");
doc.setFontSize(9);
doc.text(
    "Generated by Worker Attendance App",
    65,
    summaryY + 20
);

doc.setTextColor(0,0,0);
// Create PDF Blob
const fileName =
    worker.name + "_" + selectedMonth + ".pdf";

// Browser
if(!window.cordova){

    doc.save(fileName);

    closeMonthSelector();

    return;

}

// Android
const pdfBlob = doc.output("blob");

window.resolveLocalFileSystemURL(
    cordova.file.cacheDirectory,
    function(dir){

        dir.getFile(fileName,{create:true},function(file){

            file.createWriter(function(writer){

                writer.onwriteend=function(){

                    cordova.plugins.fileOpener2.open(
                        file.nativeURL,
                        "application/pdf",
                        {
                            error:function(e){
                                alert("Open Error : " + JSON.stringify(e));
                            },
                            success:function(){
                                closeMonthSelector();
                            }
                        }
                    );

                };

                writer.onerror=function(e){
                    alert("PDF Save Error");
                };

                writer.write(pdfBlob);

            });

        });

    }
);
closeMonthSelector();

}

document.addEventListener("deviceready", function () {

    document.addEventListener("backbutton", function () {

        let popup = document.getElementById("popupMenu");

        if(
            popup &&
            popup.style.display !== "none" &&
            popup.style.display !== ""
        ){
            popup.style.display = "none";
            return;
        }

        let modals = [
            "pinManagerModal",
            "pinModal",
            "paidModal",
            "paymentHistoryModal",
            "paymentMonthModal",
            "monthSelectorModal",
            "attendanceModal",
            "dateActionModal",
            "addWorkerModal",
            "workerNameModal",
            "workerWageModal",
            "settingsModal"
        ];

        for(let i = 0; i < modals.length; i++){

            let modal = document.getElementById(modals[i]);

            if(
                modal &&
                modal.style.display !== "none" &&
                modal.style.display !== ""
            ){

                if(
                    modals[i] === "paymentHistoryModal" &&
                    typeof closePaymentHistory === "function"
                ){
                    closePaymentHistory();
                }
                else if(
                    modals[i] === "paymentMonthModal" &&
                    typeof closePaymentMonthSelector === "function"
                ){
                    closePaymentMonthSelector();
                }
                else if(
                    modals[i] === "monthSelectorModal" &&
                    typeof closeMonthSelector === "function"
                ){
                    closeMonthSelector();
                }
                else if(
                    modals[i] === "attendanceModal" &&
                    typeof closeAttendance === "function"
                ){
                    closeAttendance();
                }
                else if(
                    modals[i] === "dateActionModal" &&
                    typeof closeDateAction === "function"
                ){
                    closeDateAction();
                }
                else if(
                    modals[i] === "addWorkerModal" &&
                    typeof closeAddWorkerModal === "function"
                ){
                    closeAddWorkerModal();
                }
                else if(
                    modals[i] === "settingsModal" &&
                    typeof closeSettings === "function"
                ){
                    closeSettings();
                }
                else if(
                    modals[i] === "pinManagerModal" &&
                    typeof closePinManager === "function"
                ){
                    closePinManager();
                }
                else if(
                    modals[i] === "paidModal" &&
                    typeof closePaidDialog === "function"
                ){
                    closePaidDialog();
                }
                else{
                    modal.style.display = "none";
                }

                return;
            }
        }

        let workerView =
            document.getElementById("singleWorkerView");

        if(
            workerView &&
            workerView.style.display !== "none" &&
            workerView.style.display !== ""
        ){

            if(typeof closeWorkerCard === "function"){
                closeWorkerCard();
            }else{
                workerView.style.display = "none";
            }

            return;
        }

        let workersView =
            document.getElementById("workersView");

        let attendanceView =
            document.getElementById("attendanceView");

        let salaryView =
            document.getElementById("salaryView");

        if(
            (workersView &&
             workersView.style.display !== "none" &&
             workersView.style.display !== "") ||

            (attendanceView &&
             attendanceView.style.display !== "none" &&
             attendanceView.style.display !== "") ||

            (salaryView &&
             salaryView.style.display !== "none" &&
             salaryView.style.display !== "")
        ){

            if(typeof showDashboard === "function"){
                showDashboard();
            }else{

                if(workersView)
                    workersView.style.display = "none";

                if(attendanceView)
                    attendanceView.style.display = "none";

                if(salaryView)
                    salaryView.style.display = "none";

                let dashboard =
                    document.getElementById("dashboardView");

                if(dashboard){
                    dashboard.style.display = "block";
                }
            }

            return;
        }

        if(
            navigator.app &&
            navigator.app.exitApp
        ){
            navigator.app.exitApp();
        }

    }, false);

});

/* ================================
   MODERN BOTTOM NAVIGATION
================================ */

function hideMainViews(){

    let dashboard = document.getElementById("dashboardView");
    let workerView = document.getElementById("singleWorkerView");
    let salaryView = document.getElementById("salaryView");
    let workersView = document.getElementById("workersView");
    let attendanceView = document.getElementById("attendanceView");

    if(dashboard){
        dashboard.style.display = "none";
    }

    if(workerView){
        workerView.style.display = "none";
    }

    if(salaryView){
        salaryView.style.display = "none";
    }

    if(workersView){
        workersView.style.display = "none";
    }

    if(attendanceView){
        attendanceView.style.display = "none";
    }
}

function showHome(){
    setActiveNav("navHome");

    hideMainViews();

    let dashboard = document.getElementById("dashboardView");

    if(dashboard){
        dashboard.style.display = "block";
    }

    window.scrollTo(0,0);
}

function showWorkers(){
    setActiveNav("navWorkers");

    hideMainViews();

    let workersView =
        document.getElementById("workersView");

    if(workersView){
        workersView.style.display = "block";
    }

    renderWorkersScreen();

    window.scrollTo(0,0);
}

function showAttendance(){
    setActiveNav("navAttendance");

    hideMainViews();

    let attendanceView =
        document.getElementById("attendanceView");

    if(attendanceView){
        attendanceView.style.display = "block";
    }

    renderAttendanceScreen();

    window.scrollTo(0,0);
}

function showSalary(){
    setActiveNav("navSalary");

    hideMainViews();

    let salaryView =
        document.getElementById("salaryView");

    if(!salaryView){
        return;
    }

    salaryView.style.display = "block";

    let list =
        document.getElementById("salaryWorkerList");

    if(!list){
        return;
    }

    list.innerHTML = "";

    if(typeof workers === "undefined" || workers.length === 0){

        list.innerHTML = `
            <div class="salary-empty">
                👷 No workers added yet
            </div>
        `;

        return;
    }

    workers.forEach(function(worker){

        let salary = 0;

        if(typeof getCompletedSalary === "function"){
            salary = getCompletedSalary(worker);
        }

        let currentEarnings = 0;

        if(typeof getCurrentMonthEarnings === "function"){
            currentEarnings =
                getCurrentMonthEarnings(worker);
        }

        let paid = Number(worker.paid || 0);

        let balance = salary - paid;

        list.innerHTML += `
            <div class="salary-worker-card">

                <div class="salary-worker-top">
                    <div class="salary-worker-name">
                        👷 ${worker.name}
                    </div>

                    <div class="salary-worker-wage">
                        Daily Wage: ₹${Number(worker.wage || 0)}
                    </div>
                </div>

                <div class="salary-row">
                    <span>💰 Salary</span>
                    <strong>
                        ₹ ${Math.round(salary)}
                    </strong>
                </div>

                <div class="salary-row">
                    <span>💵 Paid</span>
                    <strong>
                        ₹ ${Math.round(paid)}
                    </strong>
                </div>

                <div class="salary-row salary-balance">
                    <span>🔵 Balance</span>
                    <strong>
                        ₹ ${Math.round(balance)}
                    </strong>
                </div>

                <div class="salary-row salary-current">
                    <span>📅 ${getCurrentMonthName()} Earnings</span>
                    <strong>
                        ₹ ${Math.round(currentEarnings)}
                    </strong>
                </div>

            </div>
        `;
    });
}

/* ================================
   WORKERS SCREEN
================================ */

function addWorkerFromWorkers(){

    let nameInput = document.getElementById("workerName2");
    let wageInput = document.getElementById("workerWage2");

    let name = nameInput.value.trim();
    let wage = Number(wageInput.value);

    if(!name){
        alert("Worker Name डालें");
        return;
    }

    if(!wage || wage <= 0){
        alert("Daily Wage डालें");
        return;
    }

    document.getElementById("name").value = name;
    document.getElementById("wage").value = wage;

    addWorker();

    nameInput.value = "";
    wageInput.value = "";

    renderWorkersScreen();
}

function openAddWorkerModal(){

    let modal =
        document.getElementById("addWorkerModal");

    if(!modal){
        return;
    }

    modal.style.display = "flex";

    let nameInput =
        document.getElementById("workerNameModal");

    if(nameInput){
        nameInput.value = "";
        setTimeout(function(){
            nameInput.focus();
        },100);
    }

    let wageInput =
        document.getElementById("workerWageModal");

    if(wageInput){
        wageInput.value = "";
    }
}

function closeAddWorkerModal(){

    let modal =
        document.getElementById("addWorkerModal");

    if(modal){
        modal.style.display = "none";
    }
}

function saveWorkerFromModal(){

    let nameInput =
        document.getElementById("workerNameModal");

    let wageInput =
        document.getElementById("workerWageModal");

    let name =
        String(nameInput ? nameInput.value : "")
        .trim();

    let wage =
        Number(wageInput ? wageInput.value : 0);

    if(!name){
        alert("Please enter worker name");
        if(nameInput){
            nameInput.focus();
        }
        return;
    }

    if(!wage || wage <= 0){
        alert("Please enter a valid daily wage");
        if(wageInput){
            wageInput.focus();
        }
        return;
    }

    let nameField =
        document.getElementById("name");

    let wageField =
        document.getElementById("wage");

    if(!nameField || !wageField){
        alert("Unable to add worker");
        return;
    }

    nameField.value = name;
    wageField.value = wage;

    addWorker();

    closeAddWorkerModal();

    renderWorkersScreen();

    if(typeof renderDashboard === "function"){
        renderDashboard();
    }
}

function renderWorkersScreen(){

    let target =
        document.getElementById("workersScreenList");

    if(!target){
        return;
    }

    target.innerHTML = "";

    if(typeof workers === "undefined" || workers.length === 0){

        target.innerHTML = `
            <div class="workers-empty">
                <div style="font-size:48px;">👷</div>
                <h3>No workers yet</h3>
                <p>Add your first worker to start tracking attendance.</p>
            </div>
        `;

        return;
    }

    workers.forEach(function(worker,index){

        if(!worker.attendance){
            worker.attendance = {};
        }

        let present = 0;
        let half = 0;
        let ot = 0;

        Object.keys(worker.attendance).forEach(function(dateKey){

            let item =
                worker.attendance[dateKey] || {};

            if(item.status === "present"){
                present++;
            }

            if(item.status === "half"){
                half++;
            }

            ot += Number(item.ot || 0);
        });

        let salary =
            typeof getCompletedSalary === "function"
                ? getCompletedSalary(worker)
                : 0;

        let paid =
            Number(worker.paid || 0);

        let balance =
            salary - paid;

        let initials =
            String(worker.name || "?")
            .trim()
            .charAt(0)
            .toUpperCase();

        target.innerHTML += `
            <div class="modern-worker-card"
                 onclick="openWorkerCard(${index})">

                <div class="worker-avatar">
                    ${initials}
                </div>

                <div class="modern-worker-info">

                    <div class="modern-worker-name">
                        ${worker.name || "Unnamed Worker"}
                    </div>

                    <div class="modern-worker-stats">
                        ${present} Present
                        ${half ? " · " + half + " Half" : ""}
                        · ${ot} OT
                    </div>

                </div>

                <div class="modern-worker-balance">
                    ₹${Math.round(balance)}
                </div>

                <div class="modern-worker-arrow">
                    ›
                </div>

            </div>
        `;
    });
}

function renderAttendanceScreen(){

    let list =
        document.getElementById("attendanceWorkerList");

    if(!list){
        return;
    }

    list.innerHTML = "";

    if(typeof workers === "undefined" || workers.length === 0){

        list.innerHTML = `
            <div class="salary-empty">
                👷 No workers added yet
            </div>
        `;

        return;
    }

    workers.forEach(function(worker,index){

        list.innerHTML += `
            <div class="attendance-worker-card">

                <div>
                    <div class="attendance-worker-name">
                        👷 ${worker.name}
                    </div>

                    <div class="attendance-worker-wage">
                        Daily Wage: ₹${Number(worker.wage || 0)}
                    </div>
                </div>

                <button
                    class="attendance-open-btn"
                    onclick="openAttendance(${index})">
                    Open
                </button>

            </div>
        `;

    });

}

function setActiveNav(id){

    let buttons = document.querySelectorAll(".bottom-nav button");

    buttons.forEach(function(button){
        button.classList.remove("active");
    });

    let activeButton = document.getElementById(id);

    if(activeButton){
        activeButton.classList.add("active");
    }
}

