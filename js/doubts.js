async function getall() {
	const resp = await fetch ('/~/LearnLily/open/doubts?all=true', { 
			method: 'GET',
			headers: { 'Content-Type': 'application/json' }
		})
	const ans = await resp.json();
	
	for(i=0; i<ans.length; i++)
	{
		var check_li = document.createElement('li');

		check_li_text = document.createTextNode(ans[i].data.log);
		check_li_date = document.createTextNode(ans[i].dateCreated);
		
		var date_span = document.createElement("span");
		date_span.appendChild(check_li_date);
		date_span.setAttribute("style","float:right; font-weight: 600;")
		
		var check_but_edit = document.createElement('span');
		check_but_edit.innerHTML = '<button class="small-btn edit-btn" style="margin-right: 2%;">Mark as Answered</button>';
		check_but_edit.setAttribute('onclick', `create({"id": "${ans[i]._id}", "status": "0"})`);
		if(ans[i].data.status == 0)
		{
			check_but_edit.innerHTML = 'Answered';
			check_but_edit.setAttribute("style","color: #20cc20; float: right; font-weight: 600; margin-right: 2%; border-radius: 5px; background: #fff; padding: 3px 5px;");
			check_but_edit.disabled = true;
		}
		
		check_li.appendChild(check_li_text);
		check_li.appendChild(date_span);

		check_li.appendChild(check_but_edit);
		
		document.querySelector("#doubt-ul").appendChild(check_li);
	}
}

getall();

async function create(data) {
	const resp = await fetch ('/~/LearnLily/open/doubts', { 
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(data)
		})
	const ans = await resp.json();
	location.reload();
}