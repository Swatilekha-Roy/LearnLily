/* Checklist Functionality */
async function getLogs() {
	const resp = await fetch('/~/LearnLily/account/checklist?all=true', {
		method: 'GET',
		headers: {'content-Type': 'application/json'}
	})
	const ans = await resp.json();
	
	for(i=0; i<ans.length; i++)
	{
		console.log(ans[i].log + ans[i]._id);
		
		var check_li = document.createElement('li');
		
		check_li_text = document.createTextNode(ans[i].log);
		
		var check_but_del = document.createElement('span');
		check_but_del.innerHTML = '<button class="small-btn del-btn"><i class="fa fa-trash-o" aria-hidden="true"></i></button>'
		check_but_del.setAttribute('onclick', `remove({"id": "${ans[i]._id}"})`);
		
		var check_but_edit = document.createElement('span');
		check_but_edit.innerHTML = '<button class="small-btn edit-btn" style="margin-right: 2%;"><i class="far fa-check-circle"></i></button>';
		check_but_edit.setAttribute('onclick', `edit({"id": "${ans[i]._id}", "status": "0"})`);
		if(ans[i].status == 0)
		{
			check_li.setAttribute("style", "text-decoration: line-through; text-decoration-style: solid; background-color: #e1719370;");
			check_but_edit.innerHTML = '<button class="small-btn edit-btn" style="background-color: #e27e9c; margin-right: 2%; cursor: none;"><i class="far fa-check-circle"></i></button>';
			check_but_edit.disabled = true;
		}
		
		check_li.appendChild(check_li_text);
		
		check_li.appendChild(check_but_del);
		check_li.appendChild(check_but_edit);
		console.log(check_li);
		
		document.querySelector("#ans-ul").appendChild(check_li);
	}
}

getLogs();

// Delete entries
async function remove(data) {
	console.log(data);
	const resp = await fetch('/~/LearnLily/account/checklist', {
		method: 'DELETE',
		headers:  { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	})
	const ans = await resp.json();
	location.reload();
}

// Edit current state of entries
async function edit(data) {
	const resp = await fetch('/~/LearnLily/account/checklist', {
		method: 'PATCH',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	})
	const ans = await resp.json();
	location.reload();
}