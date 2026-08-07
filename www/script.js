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

    document.getElementById("pinInput").blur();

    document.getElementById("pinInput").value = "";

    document.getElementById("pinModal").style.display = "none";

    setTimeout(function(){

        document.activeElement.blur();

    },100);

}else{

        alert("Wrong PIN");

        document.getElementById("pinInput").value="";

    }

}

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

        list.innerHTML += `
<div class="worker-card">

    <div class="worker-header">
<span class="worker-name">👷 ${worker.name}</span>

        <button class="menu-btn"
        onclick="showMenu(${index},event)">⋮</button>
    </div>

<div class="worker-info">

    <div>
        <span class="worker-label">💰 Daily Wage</span>
        <span class="worker-value">Rs.${worker.wage}</span>
    </div>

    <div>
        <span class="worker-label">📅 Present</span>
        <span class="worker-value">${worker.presentDays}</span>
    </div>

    <div>
        <span class="worker-label">🕒 OT</span>
        <span class="worker-value">${worker.totalOT}h</span>
    </div>

    <div>
        <span class="worker-label">💵 Salary</span>
        <span class="worker-value">Rs.${Math.round(salary)}</span>
    </div>

</div>

    <button class="attendance-btn"
    onclick="openAttendance(${index})">
        Attendance
    </button>

</div>`;

    });

    document.getElementById("totalWorkers").innerHTML =
        workers.length;

    document.getElementById("dashboardSalary").innerHTML =
        Math.round(totalSalary);

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

    document.getElementById("calendarTitle").textContent=
        monthNames[currentMonth]+" "+currentYear;

    let firstDay=new Date(currentYear,currentMonth,1).getDay();
    let totalDays=new Date(currentYear,currentMonth+1,0).getDate();

    for(let i=0;i<firstDay;i++){
        grid.appendChild(document.createElement("div"));
    }

    let today=new Date();
    today.setHours(0,0,0,0);

    for(let day=1;day<=totalDays;day++){

        let dateKey=
            currentYear+"-"+
            String(currentMonth+1).padStart(2,"0")+"-"+
            String(day).padStart(2,"0");

        let item=attendanceData[dateKey];

        let box=document.createElement("div");
        box.className="calendar-day";

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

            let selected=new Date(dateKey);
            selected.setHours(0,0,0,0);

            if(selected>today){
                return;
            }

            selectedDate=dateKey;

            document.getElementById("selectedDateTitle").innerHTML=dateKey;

            document.getElementById("dateActionModal").style.display="flex";

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

function markDateHalfDay(){

    attendanceData[selectedDate] =
        attendanceData[selectedDate] || {
            status:"half",
            ot:0
        };

    attendanceData[selectedDate].status = "half";

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

    totalOT += item.ot || 0;

});

workers[selectedAttendanceWorker].presentDays =
    present + (halfDays * 0.5);

workers[selectedAttendanceWorker].halfDays =
    halfDays;

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

function openSettings(){

    document.getElementById(
        "settingsModal"
    ).style.display = "flex";

    let btn =
        document.getElementById("fingerprintBtn");

    if(btn){

        if(localStorage.getItem("fingerprintEnabled") === "true"){

            btn.innerHTML =
                "👆 Fingerprint Lock : ON";

        }else{

            btn.innerHTML =
                "👆 Fingerprint Lock : OFF";

        }

    }

}

function closeSettings(){

    document.getElementById(
        "settingsModal"
    ).style.display = "none";

}

function changePin(){

    let oldPin = localStorage.getItem("appPin") || "";

    let current = prompt("Enter Current PIN");

    if(current === null) return;

    if(current !== oldPin){

        alert("Wrong PIN");
        return;

    }

    let newPin = prompt("Enter New PIN");

    if(newPin === null) return;

    if(newPin.length < 4){

        alert("PIN must be at least 4 digits");
        return;

    }

    localStorage.setItem("appPin", newPin);

    alert("PIN Changed Successfully");

    closeSettings();

}

function removePin(){

    let pin = localStorage.getItem("appPin") || "";

    let current = prompt("Enter Current PIN");

    if(current === null) return;

    if(current !== pin){

        alert("Wrong PIN");
        return;

    }

    if(confirm("Remove PIN Lock?")){

        localStorage.removeItem("appPin");

        alert("PIN Removed Successfully");

        closeSettings();

    }

}

function backupData(){

    let backup = {

        workers: workers,

        pin: localStorage.getItem("appPin") || ""

    };

    let text = JSON.stringify(backup, null, 2);

    let blob = new Blob(
        [text],
        {type:"application/json"}
    );

    let link = document.createElement("a");

    link.href = URL.createObjectURL(blob);

    link.download = "WorkerAttendance_Backup.json";

    link.click();

    URL.revokeObjectURL(link.href);

    closeSettings();

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
        "Version : 3.0\n\n" +
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

    let pin = localStorage.getItem("appPin");

    if(pin){

        alert("PIN Lock is already enabled");
        return;

    }

    let newPin = prompt("Create 4 Digit PIN");

    if(newPin === null) return;

    if(newPin.length != 4){

        alert("PIN must be exactly 4 digits");
        return;

    }

    localStorage.setItem("appPin", newPin);

    savedPin = newPin;

    alert("PIN Lock Enabled Successfully");

    closeSettings();

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
