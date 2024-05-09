// *** notebooking ***
function loadNotebookList() {
	console.log("Loading notebook list...");
	let type = "Notebook";
	let dropdown = document.getElementById("drpNotebookTopic");

	// Remove all options except the first one
	while (dropdown.options.length > 1) {
		dropdown.remove(1);
	}

	// Retrieve all documents from the database and filter them based on the docType field
	db.allDocs({
		startkey: prefixes[type],
		endkey: prefixes[type] + "\uffff",
		include_docs: true, // Do Not Include the full documents in the result
	})
		.then(function (result) {
			console.log(result);
			// Filter the documents by docType === 'Task'
			const filteredDocs = result.rows.filter((row) => {
				return row.doc;
			});

			// Sort the filtered documents based on the title field
			filteredDocs.sort((a, b) => {
				if (a.doc && b.doc) {
					// Compare the values of the type field for sorting
					return a.doc.title.localeCompare(b.doc.title);
				} else {
					return 0; // Documents without type are considered equal
				}
			});

			// Iterate over the filteredDocs array to access the data for each document
			filteredDocs.forEach((row) => {
				// Check if the document exists and contains data
				var option = document.createElement("option");
				option.value = row.doc._id;
				option.text = row.doc.title;
				dropdown.appendChild(option);
			});
		})
		.catch(function (error) {
			console.error("Error retrieving documents:", error);
		});
}

async function loadNotebook() {
	nbID = document.getElementById("drpNotebookTopic").value;
	console.log("DocumentID: " + nbID);

	try {
		// Try to retrieve the document
		const nbDoc = await db.get(nbID);
		console.log("Document:", nbDoc);

		document.getElementById("noteBookID").value = nbDoc._id;
		document.getElementById("noteBookRev").value = nbDoc._rev;
		quill3.setContents(nbDoc.notes);
	} catch (err) {
		console.log("Error retrieving document:", err);
	}
}

async function addNotebook() {
	if (document.getElementById("noteBookTopic").value == "") {
		alert("Nothing to Add");
		return;
	} else {
		//notebookID = await getNextID("Notebook");
		notebookID = "N-" + document.getElementById("noteBookTopic").value.replace(/\s+/g, '');
		console.log("DocumentID: " + notebookID);

		//Preparing the document
		docNB = {
			_id: notebookID,
			docType: "Notebook",
			title: document.getElementById("noteBookTopic").value,
			notes: quill3.getContents(),
		};

		// Use Post for New Records and Put to update existing
		db.post(docNB, function (err, response) {})
			.then(function (response) {
				// on success
				console.log("Document Created Successfully");
				resetNotebook();
				// getTaskList();
				//navHome();
				loadNotebookList();
				closeAccordion("accNewNotebook");
			})
			.catch(function (err) {
				console.log(err);
			});
	}
}

async function renameNotebook() {
	if (document.getElementById("noteBookTopic").value == "") {
		alert("Nothing to Rename");
		return;
	} else {
		//Preparing the document
		docNB = {
			_id: document.getElementById("noteBookID").value,
			_rev: document.getElementById("noteBookRev").value,
			docType: "Notebook",
			title: document.getElementById("noteBookTopic").value,
			notes: quill3.getContents(),
		};

		// Use Post for New Records and Put to update existing
		db.put(docNB, function (err, response) {})
			.then(function (response) {
				// on success
				console.log("Document Updated Successfully");
				resetNotebook();
				// getTaskList();
				//navHome();
				loadNotebookList();
			})
			.catch(function (err) {
				console.log(err);
			});
	}
}

// Function to save notebook content to IndexedDB
function saveNotebook() {
	var nbID = document.getElementById("noteBookID").value;

	nbDoc = {
		_id: document.getElementById("noteBookID").value,
		_rev: document.getElementById("noteBookRev").value,
		docType: "Notebook",
		docType: "Notebook",
		title: document.getElementById("drpNotebookTopic").value,
		notes: quill3.getContents(),
	};

	db.put(nbDoc, function (err, response) {})
		.then(function (response) {
			// on success
			console.log(response);
			console.log("Document Updated Successfully");
			document.getElementById("noteBookRev").value = response.rev;
		})
		.catch(function (err) {
			console.log(err);
		});
}

async function deleteNotebook(nbID) {
	if (nbID.value == "") {
		alert("Nothing to Delete");
		return;
	} else {
		// Fetch the document you want to delete
		db.get(nbID)
			.then(function (doc) {
				// Delete the document
				return db.remove(doc);
			})
			.then(function (result) {
				console.log("Document deleted successfully:", result);
				resetNotebook();
				loadNotebookList();
			})
			.catch(function (err) {
				console.error("Error deleting document:", err);
			});
	}
}
