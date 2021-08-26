document.getElementById("no_grade_btn").addEventListener("click", no_of_grades);

function no_of_grades()
{
	window.grade_no = document.getElementById("no_grade").value;
    document.querySelector(".initial_grade_input").style.display = "none";
    displaygradeinput(grade_no);
}

function displaygradeinput(grade_no)
{
    document.querySelector(".final_grade_input").style.display = "block";

    var gradecal_par = document.createElement("div");
    gradecal_par.classList.add("row","g-4");

    for(i=0; i<grade_no; i++)
    {
        var sub_name = document.createElement("div");
        sub_name.classList.add("col-auto");
        var grade_sc = document.createElement("input");
        grade_sc.classList.add("form-control", "form-inline", "grade_score");
        grade_sc.setAttribute("style","max-width: 120px;");
        grade_sc.required = true;
        grade_sc.setAttribute("placeholder","Score");
        grade_sc.setAttribute("type","text");
        
        var grade_wt = document.createElement("input");
        grade_wt.classList.add("form-control", "form-inline", "grade_weight");
        grade_wt.setAttribute("style","max-width: 120px; margin-top: 7%; background-color: #faa5adb8 !important;");
        grade_wt.required = true;
        grade_wt.setAttribute("placeholder","Credit");
        grade_wt.setAttribute("type","text");

        sub_name.appendChild(grade_sc);
        sub_name.appendChild(grade_wt);

        gradecal_par.appendChild(sub_name);
    }

    var grade_cal_btn = document.createElement("span");
    grade_cal_btn.innerHTML = '<button class="bigbtn" style="max-width: 250px;">Calculate Grade</button>';
    grade_cal_btn.setAttribute("onclick", "calcgrade(grade_no)");

    gradecal_par.appendChild(grade_cal_btn);

    document.querySelector(".final_grade_input").appendChild(gradecal_par);

    var sc = document.getElementsByClassName(".grade_score").value;
    console.log(sc);
}

function calcgrade(grade_no)
{	
	document.querySelector(".grade-rep").style.display = "block";
    console.log("To");    
    var sctot = 0; var wttot = 0;

    var sc = document.querySelectorAll(".grade_score").value;
    console.log(sc);

    for(i=0; i<grade_no; i++)
    {        
        var sc = document.querySelector(".grade_score").value;
        sctot += sc;
        console.log(sctot);
        
        var wt = document.querySelector(".grade_weight").value;
        wttot += wt;
        console.log(wttot);
    }
    //console.log(sctot + " " +wttot);
    document.querySelector("#grade_span").innerHTML = (sctot/wttot);
}