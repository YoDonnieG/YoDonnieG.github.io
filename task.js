// Get task entries from database and display in a single table with a common type class for each row
function getTaskList() {
	let type = "Task";

	// Retrieve all documents from the database and filter them based on the docType field
	db.allDocs({
		startkey: prefixes[type],
		endkey: prefixes[type] + "\uffff",
		include_docs: true, // Include the full documents in the result
	})
		.then(function (result) {
			// Filter the documents by docType === 'Task'
			const filteredDocs = result.rows.filter((row) => {
				return row.doc && row.doc.docType === "Task";
			});

			// Sort the filtered documents based on the type field
			filteredDocs.sort((a, b) => {
				if (a.doc && b.doc) {
					// Compare the values of the type field for sorting
					return a.doc.type.localeCompare(b.doc.type);
				} else {
					return 0; // Documents without type are considered equal
				}
			});

			// Handle the sorted and filtered documents
			//console.log('Sorted and filtered documents:', filteredDocs);
			const tbody = document.getElementById("entryTableBody"); // Assuming the table body has the ID "entryTableBody"
			tbody.innerHTML = ""; // Set innerHTML to an empty string to remove all child elements
			let currentType = null;

			// Iterate over the filteredDocs array to access the data for each document
			filteredDocs.forEach((rs) => {
				// Check if the document exists and contains data
				if (rs.doc) {
					// Access and parse the data fields within the document
					const docId = rs.id; // Get the document ID
					const docType = rs.doc.docType; // Get the docType field
					const type = rs.doc.type; // Get the type field
					// Access other fields as needed

					if (type !== currentType) {
						// Add a row for the type with type class
						const typeRow = document.createElement("tr");
						typeRow.classList.add("entryHeader");
						typeRow.innerHTML = `<td colspan="6"><strong>${type}</strong></td>`;
						tbody.appendChild(typeRow);
						currentType = type;
					}

					// Add entry row with type class
					const row = document.createElement("tr");
					dueDate = formatDate(new Date(rs.doc.dateDue));
					closedDate = formatDate(new Date(rs.doc.dateClosed));

					row.innerHTML = `
					<td class="col0">${rs.doc.type}</td>
					<td class="col1">${rs.id}</td>
					<td class="col2">${rs.doc.title}</td>
					<td class="col3">${closedDate}</td>
					<td class="col4">${dueDate}</td>
					<td class="col5">${rs.doc.completed}</td>
					<!-- Add more cells as needed -->
				`;
					tbody.appendChild(row);
				}
			});

			filterTaskByType("All");
		})
		.catch(function (error) {
			console.error("Error retrieving documents:", error);
		});
}

function filterTaskByType(filtType) {
	const rows = document.querySelectorAll("#entryTable tbody tr");
	const allTypes = ["Project", "Task", "Reminder", "Feature"];

	rows.forEach((row) => {
		const type = row.cells[0].textContent;
		const isEntryHeader = row.classList.contains("entryHeader");

		if (isEntryHeader) {
			return; // Skip to the next row
		} else {
			const done = row.cells[5].textContent;

			if (filtType === "All") {
				if (allTypes.includes(type) && done !== "true") {
					row.classList.add(type);
					row.classList.remove("hidden");
				} else {
					row.classList.add("hidden");
				}
			} else if (filtType === "Completed") {
				if (allTypes.includes(type) && done === "true") {
					//if (done === 'true') {
					row.classList.add(type);
					row.classList.remove("hidden");
				} else {
					row.classList.add("hidden");
				}
			} else {
				if (filtType === type && done !== "true") {
					row.classList.remove("hidden");
				} else {
					row.classList.add("hidden");
				}
			}
		}
	});

	// Show or hide entry header rows based on whether they have entries
	const entryHeaderRows = document.querySelectorAll("#entryTable tbody tr.entryHeader");
	entryHeaderRows.forEach((row) => {
		const type = row.cells[0].textContent;
		if ((filtType === "All" || filtType === "Completed") && allTypes.includes(type)) {
			row.classList.add("show");
			row.classList.remove("hidden");
		} else {
			row.classList.add("hidden");
		}
	});

	addRowClickListener();

	if (filtType === "All") {
		addRowHeaderClickListener();
	}
	// Update tab text
	const tabs = document.querySelectorAll(".cnt");
	tabs.forEach((tab) => {
		const tabTypeContent = tab.textContent.split(" ");
		const tabType = tabTypeContent[0];
		const tblEntries = document.querySelectorAll(`td.col0`);

		// Initialize count variable
		var typeCnt = 0;

		// Iterate through selected elements
		tblEntries.forEach(function (tblEntry) {
			// Check if element's content matches the variable
			done = tblEntry.parentElement.lastElementChild.textContent;
			if (allTypes.includes(tblEntry.textContent) && tabType === "All" && done === "false") {
				typeCnt++;
			}

			if (done === "true" && tabType === "Complete") {
				typeCnt++;
			}

			if (tblEntry.textContent === tabType && done === "false") {
				// If yes, increment the count
				typeCnt++;
			}
		});

		// Update the tab text with the number of entries
		tab.textContent = tabType + " (" + typeCnt + ")";
	});

	if (filtType === "All") {
		hideColumn(0); // Type
		showColumn(1); // ID
		showColumn(2); // Name
		hideColumn(3); // Date Closed
		showColumn(4); // Date Due
		hideColumn(5); // Completed
	} else if (filtType === "Completed") {
		hideColumn(0); // Type
		showColumn(1); // ID
		showColumn(2); // Name
		showColumn(3); // Date Closed
		hideColumn(4); // Date Due
		hideColumn(5); // Completed
	} else if (filtType === "Reminder") {
		hideColumn(0); // Type
		hideColumn(1); // ID
		showColumn(2); // Name
		hideColumn(3); // Date Closed
		showColumn(4); // Date Due
		hideColumn(5); // Completed
	} else {
		hideColumn(0); // Type
		showColumn(1); // ID
		showColumn(2); // Name
		hideColumn(3); // Date Closed
		hideColumn(4); // Date Due
		hideColumn(5); // Completed
	}
}

async function taskMaint(action, taskDoc) {

    if (action === "add") {
     
        getNextID("Task")
        .then(data => {
            console.log("Data:", data); // Access the resolved data
            console.log('docID: ' + data);
            taskDoc._id = data;
            console.log(taskDoc._id);
    
            // Now you have the ID in docID, use it for further actions
            db.post(taskDoc, function (err, response) {})
            .then(function (resp) {
                // on success
                console.log("Document Updated Successfully: " + JSON.stringify(resp));
                resetEntryPanel();
                getTaskList();
            })
            .catch(function (err) {
                console.log(err);
            });

            })
            .catch(error => {
            console.error("Error:", error); // Handle any errors
            });

        return; 
     
    } else if (action === "update") {
        // Update task in database
        db.put(taskDoc, function (err, response) {})
        .then(function (response) {
            // on success
            console.log("Document Updated Successfully: " + JSON.stringify(response));
            document.getElementById("journalRev").value = response.rev;
        })
        .catch(function (err) {
            console.log(err);
        });
    } 

}


// Add task to database
async function buildTaskDoc() {
  
	let taskCompleted = document.getElementById("chkComplete").checked;

	let subtasks = [];
	// Select the subtask list
	let subTaskList = document.getElementById("subTaskList");
	// Iterate over each list item (subtask)
	let subtaskItems = subTaskList.getElementsByTagName("li");
	for (let i = 0; i < subtaskItems.length; i++) {
		let subtask = subtaskItems[i];
		// Get the subtask name
		let subtaskName = subtask.querySelector("span").textContent.trim();
		// Check if the subtask is completed
		let subtaskCompleted = subtask.querySelector("input[type='checkbox']").checked;
		// Add subtask to the array
		subtasks.push({ name: subtaskName, completed: subtaskCompleted });
	}

	//  Add vs Update
	if (document.getElementById("entryId").value == "") {

            // Prepare the document to be Added
            docTask = {
                _id: 'TBD',
                docType: "Task",
                title: document.getElementById("entryName").value,
                type: document.getElementById("entryType").value,
                subtype: document.getElementById("entrySubType").value,
                customer: document.getElementById("entryCustomer").value,
                notes: quill2.getContents(),
                dateAdded: document.getElementById("dateAdded").value,
                dateDue: document.getElementById("dateDue").value,
                dateClosed: document.getElementById("dateClosed").value,
                status: document.getElementById("entryStatus").value,
                priority: document.getElementById("entryPriority").value,
                repPath: document.getElementById("artifactPath").value,
                subTask: subtasks,
                project: document.getElementById("entryProject").value,
                completed: taskCompleted,
            };

            console.log("Task Doc: " + JSON.stringify(docTask));
            taskMaint('add', docTask);

	} else {
		// Update the existing document
		docTask = {
			_id: document.getElementById("entryId").value,
			_rev: document.getElementById("entryRev").value,
			docType: "Task",
			title: document.getElementById("entryName").value,
			type: document.getElementById("entryType").value,
			subtype: document.getElementById("entrySubType").value,
			customer: document.getElementById("entryCustomer").value,
			notes: quill2.getContents(),
			dateAdded: document.getElementById("dateAdded").value,
			dateDue: document.getElementById("dateDue").value,
			dateClosed: document.getElementById("dateClosed").value,
			status: document.getElementById("entryStatus").value,
			priority: document.getElementById("entryPriority").value,
			repPath: document.getElementById("artifactPath").value,
			subTask: subtasks,
			project: document.getElementById("entryProject").value,
			completed: taskCompleted,
		};

        taskMaint('update', docTask);

	}
}

// Edit tracked entry in database
async function editTask(entryId) {
	closeAccordion("accordion2");
	document.getElementById("journalPanel").style.display = "none";
	document.getElementById("backupPanel").style.display = "none";
	document.getElementById("entryPanel2").style.display = "block";
	setEditorIcons();

	const entry = await db.get(entryId);
	console.log(entry);

	if (entry) {
		document.getElementById("entryRev").value = entry._rev;
		document.getElementById("chkComplete").checked = entry.completed;
		document.getElementById("entryName").value = entry.title;
		document.getElementById("entryType").value = entry.type;
		document.getElementById("entrySubType").value = entry.subtype;

		if (typeof entry.notes === "string") {
			quill2.setText(entry.notes);
		} else {
			quill2.setContents(entry.notes);
		}

		let notes = quill2.getText().trim();
		if (notes.length > 0) {
			document.getElementById("accordion2").style.color = "gold";
		} else {
			document.getElementById("accordion2").style.color = "white";
		}

		document.getElementById("entryId").value = entry._id;
		document.getElementById("dateAdded").value = entry.dateAdded;
		document.getElementById("dateDue").value = entry.dateDue;
		document.getElementById("dateClosed").value = entry.dateClosed;
		document.getElementById("entryStatus").value = entry.status;
		document.getElementById("entryPriority").value = entry.priority;
		document.getElementById("entryProject").value = entry.project;
		document.getElementById("entryCustomer").value = entry.customer;
		document.getElementById("artifactPath").value = entry.repPath;

		// Load subtasks
		loadSubtasks(entry.subTask);
	}
}

// Function to load subtasks into the UI
function loadSubtasks(subtasks) {
	closeAccordion("accordion1");
	const subTaskList = document.getElementById("subTaskList");
	// Clear previous subtasks
	subTaskList.innerHTML = "";
	// Check if subtasks exist
	if (subtasks && Array.isArray(subtasks)) {
		// Sort subtasks by completion status (unchecked first)
		subtasks.sort((a, b) => a.completed - b.completed);

		let totalSTask = subtasks.length;
		let completeSTask = 0;
		if (totalSTask > 0) {
			document.getElementById("accordion1").style.color = "gold";
		} else {
			document.getElementById("accordion1").style.color = "white";
		}

		// Add each subtask to the list
		subtasks.forEach(function (subtask) {
			if (subtask.completed) {
				completeSTask++;
			}

			const listItem = document.createElement("li");
			listItem.classList.add("entryItem"); // Add entryItem class
			const checkbox = document.createElement("input");
			checkbox.type = "checkbox";
			checkbox.checked = subtask.completed;
			listItem.appendChild(checkbox);
			const span = document.createElement("span");
			span.textContent = subtask.name;
			listItem.appendChild(span);

			const editButton = document.createElement("button");
			editButton.textContent = "edit";
			editButton.classList.add("btn3"); // Add btn3 class
			editButton.addEventListener("click", function () {
				// Toggle between editing mode and display mode
				if (listItem.contentEditable === "true") {
					// Save the edited content
					subtask.name = span.textContent;
					// Change the button text back to 'edit'
					editButton.textContent = "edit";
					// Set contentEditable to false to disable editing
					listItem.contentEditable = "false";
				} else {
					// Change the button text to 'save'
					editButton.textContent = "save";
					// Set contentEditable to true to enable editing
					listItem.contentEditable = "true";
					// Focus on the editable area
					listItem.focus();
				}
			});
			listItem.appendChild(editButton);

			const deleteButton = document.createElement("button");
			deleteButton.textContent = "del";
			deleteButton.classList.add("btn3"); // Add btn3 class
			deleteButton.addEventListener("click", function () {
				// Traverse up the DOM to find the parent <li> element (subtask) and remove it
				listItem.remove();
			});
			listItem.appendChild(deleteButton);

			subTaskList.appendChild(listItem);
		});

		document.getElementById("accordion1").textContent =
			"Sub-Tasks (" + completeSTask + " of " + totalSTask + ")";
	} else {
		console.log("No subtasks found or subtasks is not an array.");
	}
}

async function getTaskTitles() {
	try {
		// Fetch all documents from the database
		const result = await db.allDocs({ include_docs: true });

		// Filter documents based on a specific criteria
		const filteredDocs = result.rows.filter((row) => {
			return row.doc && row.doc.docType === "Task" && !row.doc.completed;
		});

		// Sort the filtered documents based on the type field
		filteredDocs.sort((a, b) => {
			if (a.doc && b.doc) {
				// Compare the values of the type field for sorting
				return a.doc.type.localeCompare(b.doc.type);
			} else {
				return 0; // Documents without type are considered equal
			}
		});

		// Extract relevant data from the filtered documents if needed
		// const extractedData = filteredData.map(row => {
		//     return row.doc.dataField; // Extract a specific data field from the document
		// });

		// Return the filtered data
		return filteredDocs;
	} catch (error) {
		// Handle errors
		console.error("Error fetching and filtering data:", error);
		throw error;
	}
}

// Delete tracked entry from database
function deleteTask(docId) {
	// Fetch the document you want to delete
	db.get(docId)
		.then(function (doc) {
			// Delete the document
			return db.remove(doc);
		})
		.then(function (result) {
			console.log("Document deleted successfully:", result);
			resetEntryPanel();
			getTaskList();

		})
		.catch(function (err) {
			console.error("Error deleting document:", err);
		});
}
