// *** Journaling ***
let jDocList = []; // Array to store journal document IDs

// Function to fetch and store journal document IDs
async function fetchJournalDocIds() {
	jDocList = [];
	try {
		// Fetch documents with keys starting from 'J-' (assuming your journal document IDs start with 'J-')
		const result = await db.allDocs({
			include_docs: false,
			startkey: "J-",
			endkey: "J-\uffff", // '\uffff' is the highest possible Unicode character, so it acts as an "infinite" upper bound
		});

		// Filter documents with docType 'Journal' and store their IDs
		jDocList = result.rows.map((row) => row.id).filter((docId) => docId.startsWith("J-")); // Additional filtering based on ID pattern

		// Sort the array
		jDocList.sort();
		console.log("Journal document IDs:", jDocList);
	} catch (err) {
		console.error("Error fetching journal document IDs:", err);
	}
}

async function loadJournalByDate(inDate) {
	const docId = "J-" + inDate;
	console.log("DocumentID: " + docId);

	try {
		// Try to retrieve the document
		const jDoc = await db.get(docId);
		console.log("Document:", jDoc);

		setJournalDateLabel(inDate);

		document.getElementById("journalID").value = jDoc._id;
		document.getElementById("journalRev").value = jDoc._rev;
		quill.setContents(jDoc.notes);
		// if (typeof jDoc.notes === 'string') {
		// 	quill.setText(jDoc.notes);
		// } else {
		// 	quill.setContents(jDoc.notes);
		// }
	} catch (err) {
		if (err.status === 404) {
			// If the document doesn't exist
			saveJournal(true);
			fetchJournalDocIds();
		} else {
			throw err;
		}
	}
}

// Function to save Journal content to IndexedDB
async function saveJournal(reload) {
	var journalID;

	if (document.getElementById("journalRev").value == "") {
		journalID = "J-" + getDateAsId();

		docJournal = {
			_id: journalID,
			docType: "Journal",
			notes: quill.getContents(),
		};

		// Use Post for New Records and Put to update existing
		await db.post(docJournal, function (err, response) {})
			.then(function (response) {
				// on success
				console.log("Document Created Successfully");
				loadJournalByDate(getDateAsId()); // load with todays date
				// resetEntryPanel();
				// getTaskList();
				// navHome();
			})
			.catch(function (err) {
				console.log(err);
			});
	} else {
		journalID = document.getElementById("journalID").value;

		docJournal = {
			_id: journalID,
			_rev: document.getElementById("journalRev").value,
			docType: "Journal",
			notes: quill.getContents(),
		};

		db.put(docJournal, function (err, response) {})
			.then(function (response) {
				// on success
				console.log(response);
				console.log("Document Updated Successfully");
				document.getElementById("journalRev").value = response.rev;
			})
			.catch(function (err) {
				console.log(err);
			});
	}
}

// Function to generate date as ID (formatted as YYYYMMDD)
function getDateAsId() {
	var today = new Date();
	var year = today.getFullYear().toString().slice(-2);
	var month = (today.getMonth() + 1).toString().padStart(2, "0");
	var day = today.getDate().toString().padStart(2, "0");
	return year + month + day;
}

function deleteJournalEntry(docId) {
	// Fetch the document you want to delete
	db.get(docId)
		.then(function (doc) {
			// Delete the document and all revisions
			return db.remove(doc._id, doc._rev);
		})
		.then(function (result) {
			console.log("Document deleted successfully:", result);
			// After the document is successfully deleted, fetch updated journal document IDs
			// Perform compaction to remove all old revisions
			return db.compact();
		})
		.then(function () {
			console.log("Compaction completed successfully");
			// After the compaction is completed, fetch updated journal document IDs
			resetJournal();
			navHome();

			//todayJournal();
		})
		.catch(function (err) {
			console.error("Error deleting document:", err);
		});
}

function getJournalIndex() {
	let currentIndex = document.getElementById("journalID").value;

	let index = jDocList.indexOf(currentIndex);

	if (index !== -1) {
		console.log("Index of", currentIndex, "is", index);
	} else {
		console.log(currentIndex, "not found in array.");
	}

	return index;
}

// Event listener for previous button
function prevJournal() {
	let currentIndex = getJournalIndex();

	if (currentIndex > 0) {
		currentIndex--;
		let prevDate = jDocList[currentIndex].substr(2, 6);
		console.log("Previous Date: " + prevDate);
		loadJournalByDate(prevDate);
	} else {
		alert("Reached Last Available Entry");
	}
}

// Event listener for next button
function nextJournal() {
	let currentIndex = getJournalIndex();

	if (currentIndex >= 0 && currentIndex < jDocList.length - 1) {
		currentIndex++;
		let prevDate = jDocList[currentIndex].substr(2, 6);
		console.log("Previous Date: " + prevDate);
		loadJournalByDate(prevDate);
	} else {
		alert("Reached Last Available Entry");
	}
}

function todayJournal() {
	var today = getDateAsId();
	loadJournalByDate(today);
}

function setJournalDateLabel(entryId) {
	const entryYear = "20" + entryId.substr(0, 2);
	const entryMonth = entryId.substr(2, 2) - 1;
	const entryDay = entryId.substr(4, 2);
	const inDate = new Date(entryYear, entryMonth, entryDay);
	console.log(inDate);

	let optionA = { hour: "2-digit", minute: "2-digit" };
	let optionB = { weekday: "short" };
	let optionC = { month: "short", day: "2-digit", year: "numeric" };
	document.getElementById("time").innerHTML = inDate.toLocaleTimeString("en", optionA);
	document.getElementById("day").innerHTML = inDate.toLocaleDateString("en", optionB);
	document.getElementById("date").innerHTML = inDate.toLocaleDateString("en", optionC);

	document.getElementById("journalDateLabel").innerHTML =
		inDate.toLocaleDateString("en", optionB) + " - " + inDate.toLocaleDateString("en", optionC);
}
