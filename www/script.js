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
        row.insertCell(1).innerHTML = "Rs." + worker.wage;
        row.insertCell(2).innerHTML = worker.presentDays;
        row.insertCell(3).innerHTML = worker.totalOT + "h";
        row.insertCell(4).innerHTML = "Rs." + Math.round(salary);

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

    document.getElementById(
        "monthSelectorModal"
    ).style.display = "none";

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

let absentDays =
new Date(currentYear,currentMonth+1,0).getDate() - presentDays;

doc.text("Present Days : " + presentDays,110,68);
doc.text("Absent Days : " + absentDays,110,76);

doc.text("Total OT : " + totalOT + "h",20,84);
doc.text("Total Salary : Rs." + Math.round(salary),110,84);


    doc.line(20,96,190,96);

    let y=105;

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
    doc.setFontSize(10);

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
    doc.setFontSize(7);

    if(item.status==="present"){

        doc.setTextColor(0,130,0);
        doc.text("P", x+18, yy+6);

    }else{

        doc.setTextColor(220,0,0);
        doc.text("A", x+18, yy+6);

    }

    if(item.ot>0){

        doc.setTextColor(255,140,0);
        doc.setFontSize(6);

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
    doc.save(
        worker.name+
        "_"+
        selectedMonth+
        ".pdf"
    );

    closeMonthSelector();

}

