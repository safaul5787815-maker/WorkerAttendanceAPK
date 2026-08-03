// ===============================
// Worker Attendance App v2
// Part 1
// ===============================

let workers = JSON.parse(localStorage.getItem("workers")) || [];

let selectedWorker = -1;
let selectedAttendanceWorker = -1;

let attendanceData = {};

let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();

function saveWorkers(){
    localStorage.setItem("workers", JSON.stringify(workers));
}

function renderWorkers(){

    let list = document.getElementById("workerList");

    list.innerHTML = "";

    let totalSalary = 0;

    workers.forEach((worker,index)=>{

        if(!worker.presentDays) worker.presentDays = 0;
        if(!worker.totalOT) worker.totalOT = 0;
        if(!worker.attendance) worker.attendance = {};

        let hourlyRate = worker.wage / 8;

        let salary =
            (worker.presentDays * worker.wage) +
            (worker.totalOT * hourlyRate);

        totalSalary += salary;

        let row = list.insertRow();

        row.insertCell(0).innerHTML = worker.name;
        row.insertCell(1).innerHTML = "₹ " + worker.wage;
        row.insertCell(2).innerHTML = worker.presentDays;
        row.insertCell(3).innerHTML = worker.totalOT + "h";
        row.insertCell(4).innerHTML = "₹ " + salary.toFixed(2);

        row.insertCell(5).innerHTML = `
<div class="action-cell">
<button onclick="openAttendance(${index})">
Attendance
</button>

<button class="menu-btn"
onclick="showMenu(${index},event)">
⋮
</button>

</div>`;
    });

    document.getElementById("totalWorkers").innerHTML =
        workers.length;

    document.getElementById("dashboardSalary").innerHTML =
        totalSalary.toFixed(2);
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

    showHistory(selectedWorker);

}

function showHistory(index){

    let worker=workers[index];

    let text="Attendance History\n\n";

    let keys=Object.keys(worker.attendance);

    if(keys.length===0){

        alert("No attendance found");

        return;

    }

    keys.sort().forEach(date=>{

        let item=worker.attendance[date];

        text+=date+
        "  |  "+
        item.status.toUpperCase();

        if(item.ot>0){

            text+=" | OT: "+item.ot+"h";

        }

        text+="\n";

    });

    alert(text);

}

function openAttendance(index){

    selectedAttendanceWorker=index;

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

    days.forEach(d=>{

        let h=document.createElement("div");

        h.className="day-name";

        h.innerHTML=d;

        grid.appendChild(h);

    });

    const monthNames=[
        "January","February","March","April",
        "May","June","July","August",
        "September","October","November","December"
    ];

    document.getElementById("calendarTitle").innerHTML=
        monthNames[currentMonth]+" "+currentYear;

    let firstDay=new Date(currentYear,currentMonth,1).getDay();

    let totalDays=new Date(
        currentYear,
        currentMonth+1,
        0
    ).getDate();

    for(let i=0;i<firstDay;i++){

        grid.appendChild(document.createElement("div"));

    }

    for(let day=1;day<=totalDays;day++){

        let box=document.createElement("div");

        box.className="calendar-day";

        let dateKey=
            currentYear+"-"+
            String(currentMonth+1).padStart(2,"0")+"-"+
            String(day).padStart(2,"0");

        let item=attendanceData[dateKey];

        if(item){

            if(item.status==="present")
                box.classList.add("present-day");

            if(item.status==="absent")
                box.classList.add("absent-day");

        }

        box.innerHTML=day;

        if(item && item.ot>0){

            box.innerHTML+=
            "<small>OT:"+item.ot+"h</small>";

        }

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

    currentMonth++;

    if(currentMonth>11){
        currentMonth=0;
        currentYear++;
    }

    renderCalendar();
}

function markDatePresent(){

    attendanceData[selectedDate] =
        attendanceData[selectedDate] || {
            status:"present",
            ot:0
        };

    attendanceData[selectedDate].status="present";

    updateAttendance();

}

function markDateAbsent(){

    attendanceData[selectedDate] =
        attendanceData[selectedDate] || {
            status:"absent",
            ot:0
        };

    attendanceData[selectedDate].status="absent";

    updateAttendance();

}

function addDateOT(){

    let ot = prompt("Enter OT Hours");

    if(ot===null) return;

    ot = Number(ot);

    if(isNaN(ot) || ot<0){
        alert("Invalid OT");
        return;
    }

    attendanceData[selectedDate] =
        attendanceData[selectedDate] || {
            status:"present",
            ot:0
        };

    attendanceData[selectedDate].status="present";
    attendanceData[selectedDate].ot=ot;

    updateAttendance();

}

function updateAttendance(){

    workers[selectedAttendanceWorker].attendance =
        attendanceData;

    let present=0;
    let totalOT=0;

    Object.values(attendanceData).forEach(item=>{

        if(item.status==="present")
            present++;

        totalOT += item.ot || 0;

    });

    workers[selectedAttendanceWorker].presentDays =
        present;

    workers[selectedAttendanceWorker].totalOT =
        totalOT;

    saveWorkers();

    renderWorkers();

    renderCalendar();

    closeDateAction();

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

    showHistory(selectedWorker);

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

        text +=
            date +
            " : " +
            item.status.toUpperCase();

        if(item.ot>0){

            text +=
            " | OT " +
            item.ot +
            "h";

        }

        text += "\n";

    });

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

    Object.keys(worker.attendance || {}).forEach(date=>{

        let key = date.substring(0,7);

        months[key]=true;

    });

    let html="";

    const monthNames=[
        "January","February","March","April",
        "May","June","July","August",
        "September","October","November","December"
    ];

    Object.keys(months).sort().forEach(key=>{

        let p=key.split("-");

        let title=
            monthNames[Number(p[1])-1]
            +" "+
            p[0];

        html += `
<button onclick="downloadWorkerPDF(${index},'${key}')">
${title}
</button><br><br>`;
    });

    if(html===""){

        html="<p>No attendance found.</p>";

    }

    document.getElementById("monthList").innerHTML=html;

    document.getElementById(
        "monthSelectorModal"
    ).style.display="flex";

}

function closeMonthSelector(){
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

    let presentDays=0;
    let totalOT=0;

    Object.values(attendance).forEach(item=>{

        if(item.status==="present")
            presentDays++;

        totalOT += item.ot || 0;

    });

    let hourlyRate = worker.wage / 8;

    let salary =
        (presentDays * worker.wage) +
        (totalOT * hourlyRate);

    doc.setFontSize(20);
    doc.text("WORKER REPORT",60,20);

    doc.setFontSize(12);

    doc.text("Worker : "+worker.name,20,40);
    doc.text("Month  : "+selectedMonth,20,50);
    doc.text("Daily Rate : ₹"+worker.wage,20,60);
    doc.text("Present : "+presentDays,20,70);
    doc.text("Total OT : "+totalOT+"h",20,80);
    doc.text("Salary : ₹"+salary.toFixed(2),20,90);

    doc.line(20,96,190,96);

    let y=105;

    doc.setFontSize(13);
    doc.text("Attendance",20,y);

    y+=10;

    Object.keys(attendance).sort().forEach(date=>{

        let item=attendance[date];

        let line =
            date+
            "   "+
            item.status.toUpperCase();

        if(item.ot>0){
            line +=
            " | OT "+item.ot+"h";
        }

        doc.text(line,20,y);

        y+=8;

        if(y>280){
            doc.addPage();
            y=20;
        }

    });

    doc.save(
        worker.name+
        "_"+
        selectedMonth+
        ".pdf"
    );

    closeMonthSelector();

}

    document.getElementById(
        "monthSelectorModal"
    ).style.display="none";

}
