// Init Global Variables
var dbOn;
let quill;
let quill2;
let quill3;
window.jsPDF = window.jspdf.jsPDF;

function initPage() {
	displayClock();
	getTaskList();
	loadEvents();
	loadBookmarks();
	fetchJournalDocIds();
	//loadTodaysJournal();  loaded as part of navHome

	document.getElementById("allTab").classList.add("selected");
	navHome();

	var acc = document.getElementsByClassName("accordion");
	for (var i = 0; i < acc.length; i++) {
		acc[i].addEventListener("click", function () {
			/* Toggle between adding and removing the "active" class,
		to highlight the button that controls the panel */
			this.classList.toggle("active");

			/* Toggle between hiding and showing the active panel */
			var panel = this.nextElementSibling;
			if (panel.style.display === "block") {
				panel.style.display = "none";
			} else {
				panel.style.display = "block";
			}

			adjustAccordionHeights(); // Call the function to adjust accordion heights
		});
	}

	quill = new Quill("#journalEditor", {
		modules: {
			toolbar: [
				[{ header: 1 }, { header: 2 }],
				["bold", "italic", "underline"],
				[{ align: "center" }],
				[{ indent: "-1" }, { indent: "+1" }],
				["link", "blockquote", "code-block", "image"],
				[{ color: [] }],
				[{ list: "ordered" }, { list: "bullet" }],
				[{ size: ["small", false, "large"] }], // custom dropdown
				["clean"],
			],
		},
		placeholder: "Add Journal Entries Here...",
		theme: "snow",
	});

	quill2 = new Quill("#taskNotesEditor", {
		modules: {
			toolbar: [
				[{ header: 1 }, { header: 2 }],
				["bold", "italic", "underline"],
				[{ align: "center" }],
				[{ indent: "-1" }, { indent: "+1" }],
				["link", "blockquote", "code-block", "image"],
				[{ color: [] }],
				[{ list: "ordered" }, { list: "bullet" }],
				[{ size: ["small", false, "large"] }], // custom dropdown
				["clean"],
			],
		},
		placeholder: "Add Note Here...",
		theme: "snow",
	});

	quill3 = new Quill("#notebookEditor", {
		modules: {
			toolbar: [
				[{ header: 1 }, { header: 2 }],
				["bold", "italic", "underline"],
				[{ align: "center" }],
				[{ indent: "-1" }, { indent: "+1" }],
				["link", "blockquote", "code-block", "image"],
				[{ color: [] }],
				[{ list: "ordered" }, { list: "bullet" }],
				[{ size: ["small", false, "large"] }], // custom dropdown
				["clean"],
			],
		},
		placeholder: "Add Notebook Entries Here...",
		theme: "snow",
	});

	// Set the Entry Details Accordion as active by default
	// and show the content of the next panel
	var ele = document.getElementById("accEntryDetails");
	ele.classList.add("active");
	var panel = ele.nextElementSibling;
	panel.style.display = "block";

	var ele = document.getElementById("accCalDate");
	ele.classList.add("active");
	var panel = ele.nextElementSibling;
	panel.style.display = "block";
}

function openAccordion(accName) {
	var ele = document.getElementById(accName);
	ele.classList.add("active");
	var panel = ele.nextElementSibling;
	panel.style.display = "block";
}

function closeAccordion(accName) {
	var ele = document.getElementById(accName);
	ele.classList.remove("active");
	var panel = ele.nextElementSibling;
	panel.style.display = "none";
}

function toggleActiveSideBar(element) {
	var links = document.querySelectorAll(".sideIconBar a");
	links.forEach(function (link) {
		link.classList.remove("active");
	});
	element.classList.add("active");
}

// Initialize entryPanelHeight to 46vh
var entryPanelHeight = "46vh";

function adjustAccordionHeights() {
	// Get the number of active accordions
	var activeAccordions = document.querySelectorAll("#entryPanel2 .accordion.active");
	var accordion1 = document.getElementById("accordion1");
	var accordion2 = document.getElementById("accordion2");
	var accordion1Content = document.getElementById("subTaskArea");
	var accordion2Content = document.getElementById("taskNotesEditor");

	// Check if each accordion has the "active" class
	var isAccordion1Active = accordion1.classList.contains("active");
	var isAccordion2Active = accordion2.classList.contains("active");

	// Determine which accordion is active
	if (isAccordion1Active && !isAccordion2Active) {
		// console.log('Accordion 1 is active');
		accordion1Content.style.maxHeight = 46 + "vh";
	} else if (!isAccordion1Active && isAccordion2Active) {
		// console.log('Accordion 2 is active');
		accordion2Content.style.maxHeight = 46 + "vh";
		// Ensure that both accordions exist
	} else if (activeAccordions.length === 2) {
		// console.log('Accordions 1 & 2 are active');
		var accordion1Height = (accordion1Content.scrollHeight / window.innerHeight) * 100; // Convert to vh units
		var accordion2Height = (accordion2Content.scrollHeight / window.innerHeight) * 100; // Convert to vh units

		//console.log("1-" + accordion1Height + " , 2-" + accordion2Height );

		if (
			(accordion1Height >= 23 && accordion2Height >= 23) ||
			(accordion1Height <= 23 && accordion2Height <= 23)
		) {
			//console.log("Both High or Low");
			accordion1Height = 23;
			accordion2Height = 23;
		} else if (accordion1Height < 23 && accordion2Height > 23) {
			//console.log("Acc2 is High");
			// If accordion1 is less than 23vh, distribute the excess space to accordion2
			//accordion1Height = accordion1Height;
			accordion2Height = 23 + (23 - accordion1Height); // Total height is 46vh
		} else if (accordion1Height > 23 && accordion2Height < 23) {
			//console.log("Acc1 is High");
			// If accordion2 is less than 23vh, distribute the excess space to accordion1
			//accordion2Height = accordion2Height;
			//console.log("Acc2:  " + accordion2Height);
			accordion1Height = 23 + (23 - accordion2Height); // Total height is 46vh
			//console.log("Acc1:  " + accordion1Height);
		}

		var accordionHeight = accordion1Height + "vh " + accordion2Height + "vh"; // Set heights for both accordions

		// Set the height for each active accordion content
		accordion1Content.style.maxHeight = accordion1Height + "vh";
		accordion2Content.style.maxHeight = accordion2Height + "vh";
	}
}

function displayClock() {
	let myDate = new Date();
	let optionA = { hour: "2-digit", minute: "2-digit" };
	let optionB = { weekday: "long" };
	let optionC = { month: "short", day: "2-digit", year: "numeric" };
	document.getElementById("time").innerHTML = myDate.toLocaleTimeString("en", optionA);
	document.getElementById("day").innerHTML = myDate.toLocaleDateString("en", optionB);
	document.getElementById("date").innerHTML = myDate.toLocaleDateString("en", optionC);

	// Date Journal to todays date
	// document.getElementById("journalDateLabel").innerHTML =
	// myDate.toLocaleDateString("en", optionB) + " - " + myDate.toLocaleDateString("en", optionC);

	setTimeout(displayClock, 1000);
}

// *** Event Listeners ***
// navigation that occurs when an image from the sidebar is clicked.
document.querySelector('a[href="#home"]').addEventListener("click", function (event) {
	event.preventDefault();
	navHome();
});

document.querySelector('a[href="#tasks"]').addEventListener("click", function (event) {
	event.preventDefault();
	addNewEntry();
});

document.querySelector('a[href="#notes"]').addEventListener("click", function (event) {
	event.preventDefault();
	document.getElementById("bottomIconBar").style.display = "block";
	document.getElementById("journalPanel").style.display = "none";
	document.getElementById("backupPanel").style.display = "none";
	document.getElementById("entryPanel2").style.display = "none";
	document.getElementById("bookmarkPanel").style.display = "none";
	document.getElementById("calendarPanel").style.display = "none";
	document.getElementById("notesPanel").style.display = "block";

	loadNotebookList();
});
document.querySelector('a[href="#calendar"]').addEventListener("click", function (event) {
	event.preventDefault();
	document.getElementById("bottomIconBar").style.display = "block";
	document.getElementById("journalPanel").style.display = "none";
	document.getElementById("backupPanel").style.display = "none";
	document.getElementById("entryPanel2").style.display = "none";
	document.getElementById("bookmarkPanel").style.display = "none";
	document.getElementById("notesPanel").style.display = "none";
	document.getElementById("calendarPanel").style.display = "block";
});

document.querySelector('a[href="#links"]').addEventListener("click", function (event) {
	event.preventDefault();
	document.getElementById("bottomIconBar").style.display = "block";
	document.getElementById("journalPanel").style.display = "none";
	document.getElementById("backupPanel").style.display = "none";
	document.getElementById("entryPanel2").style.display = "none";
	document.getElementById("calendarPanel").style.display = "none";
	document.getElementById("notesPanel").style.display = "none";
	document.getElementById("bookmarkPanel").style.display = "block";

	setIconsOff();
});

document.querySelector('a[href="#refresh"]').addEventListener("click", function (event) {
	event.preventDefault();
	location.reload();
});

document.querySelector('a[href="#config"]').addEventListener("click", function (event) {
	event.preventDefault();
	navConfig();
});

async function browseDirectory() {
	const directoryHandle = await window.showDirectoryPicker();
	const dirName = directoryHandle.name;
	let dirPath = "C:\\Goff\\Planner\\DataFolder\\";
	console.log(dirPath + dirName);
	document.getElementById("artifactPath").value = dirPath + dirName;
}

document.querySelector('a[href="#save"]').addEventListener("click", function (event) {
	event.preventDefault();
	if (document.getElementById("entryPanel2").style.display == "block") {
		buildTaskDoc();
	}

	if (document.getElementById("journalPanel").style.display == "block") {
		saveJournal(true);
	}

	if (document.getElementById("notesPanel").style.display == "block") {
		saveNotebook();
	}
});

document.querySelector('a[href="#pdf"]').addEventListener("click", function (event) {
	event.preventDefault();

	const date = new Date();
	const options = { year: "numeric", month: "2-digit", day: "2-digit" };
	const formattedDate = date.toLocaleDateString("en-US", options);

	if (document.getElementById("entryPanel2").style.display == "block") {
		//write Task Details to PDF

		var doc = new jsPDF();
		const maxWidth = 200; // Specify the maximum width of the text

		let pdfHeader =
			"ID " +
			document.getElementById("entryId").value +
			": " +
			document.getElementById("entryName").value;
		let pdfFileName = "Task-" + document.getElementById("entryId").value + ".pdf";
		let taskNotes = quill2.getText();

		doc.setFontSize(14); // Set the font size
		doc.setFont("courier", "bold");
		doc.text(pdfHeader, 20, 20); // Value to write, x, y (in mm)

		doc.setFontSize(12); // Set the font size
		doc.setFont("courier", "normal");
		doc.text("Report Date: " + formattedDate, 20, 26);

		doc.text("Status: " + document.getElementById("entryStatus").value, 20, 40);
		doc.text("Added: " + document.getElementById("dateAdded").value, 120, 40);

		doc.text("Priority: " + document.getElementById("entryPriority").value, 20, 47);
		doc.text("Due: " + document.getElementById("dateDue").value, 120, 47);

		doc.text("Type: " + document.getElementById("entrySubType").value, 20, 54);
		doc.text("Closed: " + document.getElementById("dateClosed").value, 120, 54);

		doc.text("Customer: " + document.getElementById("entryCustomer").value, 20, 61);
		doc.text("Prj Ref: " + document.getElementById("entryProject").value, 20, 68);
		doc.text("Repository: " + document.getElementById("artifactPath").value, 20, 75);

		doc.setFont("courier", "italic");
		doc.text("Notes:", 20, 85);
		doc.setFont("courier", "normal");
		const lines = doc.splitTextToSize(taskNotes, maxWidth);
		for (let i = 0; i < lines.length; i++) {
			doc.text(lines[i], 25, 91 + i * 6); // Print each line of the array
		}

		// Save the PDF
		doc.save(pdfFileName);
	}

	if (document.getElementById("journalPanel").style.display == "block") {
		//write Journal Details to PDF
		var doc = new jsPDF();

		let pdfHeader = "Workday Journal (" + document.getElementById("journalID").value + ")";
		let pdfFileName = "Journal-" + document.getElementById("journalID").value + ".pdf";
		let journalAreaContent = quill.getText();

		doc.setFontSize(14); // Set the font size
		doc.setFont("courier", "bold");
		doc.text(pdfHeader, 20, 20);

		doc.setFontSize(12); // Set the font size
		doc.setFont("courier", "normal");
		doc.text(journalAreaContent, 20, 30);

		// Save the PDF
		doc.save(pdfFileName);
	}
});

document.querySelector('a[href="#edit"]').addEventListener("click", function (event) {
	event.preventDefault();
	const bmPanel = document.getElementById("bookmarkPanel");
	if (bmPanel.style.display == "block") {
		editBookmark();
	}
});

document.querySelector('a[href="#del"]').addEventListener("click", function (event) {
	event.preventDefault();

	const ePanel2 = document.getElementById("entryPanel2");
	if (ePanel2.style.display == "block") {
		deleteTask(document.getElementById("entryId").value);
	}

	if (document.getElementById("journalPanel").style.display == "block") {
		deleteJournalEntry(document.getElementById("journalID").value);
	}

	if (document.getElementById("notesPanel").style.display == "block") {
		deleteNotebook(document.getElementById("noteBookID").value);
	}

});

document.querySelector('a[href="#prev"]').addEventListener("click", function (event) {
	event.preventDefault();
	prevJournal();
});

document.querySelector('a[href="#today"]').addEventListener("click", function (event) {
	event.preventDefault();
	todayJournal();
});

document.querySelector('a[href="#next"]').addEventListener("click", function (event) {
	event.preventDefault();
	nextJournal();
});

document.querySelector('a[href="#remind"]').addEventListener("click", function (event) {
	event.preventDefault();
	var element = document.getElementById("ReminderRow1");

	if (element.style.display === "none") {
		console.log("Element is not displayed.");

		// Get all elements with the class name "ReminderRow"
		var reminderRows = document.getElementsByClassName("ReminderRow");

		// Loop through each element and set its display property to "table-row"
		for (var i = 0; i < reminderRows.length; i++) {
			reminderRows[i].style.display = "table-row";
		}
	} else {
		console.log("Element  is displayed as table row.");
		// Get all elements with the class name "ReminderRow"
		var reminderRows = document.getElementsByClassName("ReminderRow");

		// Loop through each element and set its display property to "table-row"
		for (var i = 0; i < reminderRows.length; i++) {
			reminderRows[i].style.display = "none";
		}
	}
});

// Add an event listener for the 'change' event
document.getElementById("drpNotebookTopic").addEventListener("change", function () {
	// Your code to handle the change event goes here
	console.log("Dropdown value changed to: ", document.getElementById("drpNotebookTopic").value);
	loadNotebook();
});

document.getElementById("submitReminder").addEventListener("click", function () {
	var rID = document.getElementById("entryId").value;
	var rName = document.getElementById("entryName").value;
	var rNewTask = document.getElementById("reminderTitle").value;
	var rDue = document.getElementById("reminderDate").value;
	console.log(rName);

	resetEntryPanel();

	// Get today's date
	var today = new Date();
	// Format the date as yyyy-mm-dd (required by the date input type)
	var formattedDate = today.toISOString().split("T")[0];

	document.getElementById("journalPanel").style.display = "none";
	document.getElementById("backupPanel").style.display = "none";
	document.getElementById("entryPanel2").style.display = "block";
	setEditorIcons();

	//set default values
	populateReferenceOptions(rName);
	document.getElementById("entryName").value = rNewTask;
	document.getElementById("entryType").value = "Reminder";
	document.getElementById("dateAdded").value = formattedDate;
	document.getElementById("dateDue").value = rDue;

	var reminderRows = document.getElementsByClassName("ReminderRow");

	// Loop through each element and set its display property to "table-row"
	for (var i = 0; i < reminderRows.length; i++) {
		reminderRows[i].style.display = "none";
	}
});

// Add entry when form is submitted
document.getElementById("entryName").addEventListener("keydown", function (event) {
	if (event.keyCode === 13) {
		// 13 corresponds to Enter key
		event.preventDefault(); // Prevent default behavior of Enter key (submitting the form)
		saveTask();
	}
});

// Add subtask when enter is presses
document.getElementById("entrySubTask").addEventListener("keydown", function (event) {
	if (event.keyCode === 13) {
		// 13 corresponds to Enter key
		event.preventDefault(); // Prevent default behavior of Enter key (submitting the form)
		addSubTask();
	}
});

// Add subtask when enter is presses
// document.getElementById("newEntryNote").addEventListener("keydown", function (event) {
// 	if (event.keyCode === 13) {
// 		// 13 corresponds to Enter key
// 		event.preventDefault(); // Prevent default behavior of Enter key (submitting the form)
// 		addEntryNote();
// 	}
// });

// Add change event listener
chkComplete.addEventListener("change", function () {
	markTrackedEntryComplete();
});

// Add event listener to checkboxes of subtasks
subTaskList.addEventListener("change", function (event) {
	if (event.target.matches("input[type='checkbox']")) {
		const checkbox = event.target; // Get the checkbox element that triggered the event
		const listItem = checkbox.closest("li"); // Get the parent <li> element
		const entryName = listItem.querySelector("span").textContent; // Get the text content of the subtask
		const entryDetails = {
			id: document.getElementById("entryId").value, // Get the ID of the entry
			name: document.getElementById("entryName").value, // Get the name of the entry
			// Add other entry details as needed
			completedSubtask: entryName, // Store the name of the completed subtask
		};

		if (checkbox.checked) {
			writeSubTaskToEntryNotes(entryDetails); // Write the entry details to the journal log
		}
	}
});

// Navigation
function addNewEntry() {
	resetEntryPanel();

	// Get today's date
	var today = new Date();
	// Format the date as yyyy-mm-dd (required by the date input type)
	var formattedDate = today.toISOString().split("T")[0];

	document.getElementById("journalPanel").style.display = "none";
	document.getElementById("backupPanel").style.display = "none";
	document.getElementById("entryPanel2").style.display = "block";
	document.getElementById("bookmarkPanel").style.display = "none";
	document.getElementById("calendarPanel").style.display = "none";
	document.getElementById("notesPanel").style.display = "none";
	setEditorIcons();
	document.getElementById("dateAdded").value = formattedDate;
	populateReferenceOptions();
}

function navHome() {
	console.log("nav home");
	loadJournalByDate(getDateAsId()); // load with todays date
	resetEntryPanel();
	resetNotebook();
	unSelectTableRow();

	// left Panel:
	document.getElementById("entryPanel").style.display = "block";
	document.getElementById("tab1").style.display = "block";
	document.getElementById("tab2").style.display = "none";
	document.getElementById("allTab").classList.add("selected");

	// right Panel:
	document.getElementById("backupPanel").style.display = "none";
	document.getElementById("entryPanel2").style.display = "none";
	document.getElementById("journalPanel").style.display = "block";
	document.getElementById("bookmarkPanel").style.display = "none";
	document.getElementById("notesPanel").style.display = "none";
	document.getElementById("calendarPanel").style.display = "none";
	setJournalIcons();
}

function addNewLink() {}

function setJournalIcons() {
	document.getElementById("bottomIconBar").style.display = "block";
	document.getElementById("saveIcon").style.display = "inline-block";
	document.getElementById("editIcon").style.display = "none";
	document.getElementById("delIcon").style.display = "inline-block";
	document.getElementById("remindIcon").style.display = "none";
	document.getElementById("prevIcon").style.display = "inline-block";
	document.getElementById("todayIcon").style.display = "inline-block";
	document.getElementById("nextIcon").style.display = "inline-block";
}

function setEditorIcons() {
	// Hide the button when the div gets focus
	document.getElementById("bottomIconBar").style.display = "block";
	document.getElementById("saveIcon").style.display = "inline-block";
	document.getElementById("editIcon").style.display = "inline-block";
	document.getElementById("delIcon").style.display = "inline-block";
	document.getElementById("remindIcon").style.display = "inline-block";
	document.getElementById("prevIcon").style.display = "none";
	document.getElementById("todayIcon").style.display = "none";
	document.getElementById("nextIcon").style.display = "none";
}

function setIconsOff() {
	// Hide all the buttons on the bottomIconBar
	document.getElementById("bottomIconBar").style.display = "none";
}

function navConfig() {
	resetEntryPanel();
	// left Panel:
	document.getElementById("entryPanel").style.display = "block";

	// right Panel:
	document.getElementById("entryPanel2").style.display = "none";
	document.getElementById("journalPanel").style.display = "none";
	document.getElementById("backupPanel").style.display = "block";
	document.getElementById("calendarPanel").style.display = "none";
	document.getElementById("bookmarkPanel").style.display = "none";
	document.getElementById("notesPanel").style.display = "none";
	
}

document.getElementById("allTab").addEventListener("click", function () {
	filterTaskByType("All");
});

document.getElementById("projectTab").addEventListener("click", function () {
	filterTaskByType("Project");
});

document.getElementById("taskTab").addEventListener("click", function () {
	filterTaskByType("Task");
});

document.getElementById("featureTab").addEventListener("click", function () {
	filterTaskByType("Feature");
});

document.getElementById("reminderTab").addEventListener("click", function () {
	filterTaskByType("Reminder");
});

document.getElementById("personalTab").addEventListener("click", function () {
	filterTaskByType("Personal");
});

document.getElementById("completedTab").addEventListener("click", function () {
	filterTaskByType("Completed");
});

// document.getElementById("relatedTab").addEventListener("click", function () {
// 	filterTaskByType("Related");
// });

async function showTab1() {
	document.getElementById("tab1").style.display = "block";
	document.getElementById("tab2").style.display = "none";
}

function showTab2() {
	document.getElementById("tab2").style.display = "block";
	document.getElementById("tab1").style.display = "none";
}

async function populateReferenceOptions(rName) {
	const docs = await getTaskTitles();
	console.log(docs.length);

	const projectSelect = document.getElementById("entryProject");
	//const projectSelect2 = document.getElementById("entryProject2");
	projectSelect.innerHTML = ""; // Clear existing options
	// projectSelect2.innerHTML = ""; // Clear existing options

	const option = document.createElement("option");
	option.value = ""; // Or whatever value you want to assign
	option.textContent = "";
	projectSelect.appendChild(option);
	//projectSelect2.appendChild(option);

	// Get all tracked entries of type "Project" that are not completed
	//const projects = entries.filter((entry) => entry.type === "Project" && !entry.completed);

	// Further filter the filteredDocs based on another criteria
	const projects = docs.filter((doc) => {
		return doc.doc.type === "Project" && !doc.doc.completed;
	});

	// Add an option for each project
	projects.forEach((project) => {
		let PrjRef = "PRJ-" + project.id;
		const option = document.createElement("option");
		option.value = project.id; // Or whatever value you want to assign
		option.textContent = PrjRef + ":  " + project.doc.title;
		projectSelect.appendChild(option);
		//projectSelect2.appendChild(option);
	});

	// Add a separator
	const separator = document.createElement("option");
	separator.disabled = true;
	separator.textContent = "- - - - - - - - - - - - - - - - - - - -";
	projectSelect.appendChild(separator);
	//projectSelect2.appendChild(separator);

	// Get all tracked entries of type "Task" that are not completed
	// Further filter the filteredDocs based on another criteria
	const tasks = docs.filter((doc) => {
		return doc.doc.type === "Task" && !doc.doc.completed;
	});

	// Create options for each filtered entry
	tasks.forEach((task) => {
		let TskRef = "TSK-" + task.id;
		const option = document.createElement("option");
		option.value = task.id;
		option.textContent = TskRef + ":  " + task.doc.title;
		projectSelect.appendChild(option);
		//	projectSelect2.appendChild(option);
	});

	// // Add a separator
	// const separator2 = document.createElement("option");
	// separator2.disabled = true;
	// separator2.textContent = "- - - - - - - - - - - - - - - - - - - -";
	// projectSelect.appendChild(separator2);
	// //projectSelect2.appendChild(separator2);

	// // Get all tracked entries of type "Task" that are not completed
	// const features = entries.filter(entry => entry.type === "Feature" && !entry.completed);

	// // Create options for each filtered entry
	// features.forEach(feature => {
	// 	let FeatRef = "OTH" + feature.id;
	//     const option = document.createElement("option");
	//     option.value = feature.name;
	//     option.textContent = FeatRef +  ":   " + feature.name;
	//     projectSelect.appendChild(option);
	// //	projectSelect2.appendChild(option);
	// });

	if (typeof rName !== "undefined") {
		// Iterate through the options and select the matching Ref value
		for (let i = 0; i < projectSelect.options.length; i++) {
			let option = projectSelect.options[i];

			// Check if the option's text contains the value in rName
			if (option.text.includes(rName)) {
				// Set the selected attribute of the matched option
				option.selected = true;
				// Optionally, break the loop if only one match is expected
				break;
			}
		}
	}
}

// Mark entry as complete
function markTrackedEntryComplete() {
	// do nothing if Entry Name Field is blank.
	if (document.getElementById("entryName").value === "") {
		return;
	}

	// Get today's date and Format date as yyyy-mm-dd (required by date input type)
	var today = new Date();
	var formattedDate =
		today.getFullYear() +
		"-" +
		("0" + (today.getMonth() + 1)).slice(-2) +
		"-" +
		("0" + today.getDate()).slice(-2);

	const checked = document.getElementById("chkComplete").checked;
	const entryStatus = document.getElementById("entryStatus");

	if (checked) {
		entryStatus.value = "Closed"; // Set the default value to "Closed"
		document.getElementById("dateClosed").value = formattedDate;
		var entryName = document.getElementById("entryName").value;
		addJournalLog(entryName);
	} else {
		entryStatus.value = "In Progress"; // Set the default value to "In Progress"
		document.getElementById("dateClosed").value = "";
	}

	saveTask();
}

// Runs when Add SubTask Button is Pressed
function addSubTask() {
	// Select the Sub-Task list
	const subTaskList = document.getElementById("subTaskList");

	// Create a new list item for the sub-task
	const newSubTask = document.createElement("li");

	const subTaskText = document.getElementById("entrySubTask").value;
	document.getElementById("entrySubTask").value = "";

	// If the user entered a sub-task text
	if (subTaskText) {
		// Create a new list item for the sub-task
		const newSubTask = document.createElement("li");
		newSubTask.classList.add("entryItem");

		// Create a checkbox for the completed state of the sub-task
		const subTaskCheckbox = document.createElement("input");
		subTaskCheckbox.type = "checkbox";
		subTaskCheckbox.addEventListener("click", function () {
			// Handle the completion state of the sub-task if needed
		});
		newSubTask.appendChild(subTaskCheckbox);

		// Add the sub-task text
		const subTaskContent = document.createElement("span");
		subTaskContent.textContent = subTaskText;
		newSubTask.appendChild(subTaskContent);

		// Create an edit button for the sub-task
		const editButton = document.createElement("button");
		editButton.textContent = "edit";
		editButton.classList.add("btn3"); // Add btn3 class
		editButton.addEventListener("click", function (event) {
			const listItem = event.target.closest("li");
			const subTaskContent = listItem.querySelector("span");

			// Toggle between editing mode and display mode
			if (listItem.contentEditable === "true") {
				// Save the edited content
				subTaskContent.textContent = subTaskContent.textContent;
				// Change the button text back to 'edit'
				event.target.textContent = "edit";
				// Set contentEditable to false to disable editing
				listItem.contentEditable = "false";
			} else {
				// Change the button text to 'save'
				event.target.textContent = "save";
				// Set contentEditable to true to enable editing
				listItem.contentEditable = "true";
				// Focus on the editable area
				listItem.focus();
			}
		});
		newSubTask.appendChild(editButton);

		// Create a delete button for the sub-task
		const subTaskDeleteBtn = document.createElement("button");
		subTaskDeleteBtn.textContent = "del";
		subTaskDeleteBtn.classList.add("btn3");
		subTaskDeleteBtn.addEventListener("click", function (event) {
			// Handle deletion of the sub-task if needed
			event.target.closest("li").remove();
			//newSubTask.remove();
		});
		newSubTask.appendChild(subTaskDeleteBtn);

		// Prepend the new sub-task list item to the Sub-Task list
		// Get the first child of the Sub-Task list and insert the new sub-task before it
		subTaskList.insertBefore(newSubTask, subTaskList.firstChild);
	}
}

let entries = {}; // Initialize as an empty object
function addJournalLog(entry) {
	todayJournal();
	let logHeader = "\n\nTask Log:\n";
	let newLogEntry = "- " + entry;
	let journalAreaContent = quill.getText();
	const taskLogIndex = journalAreaContent.indexOf("Task Log:");

	if (taskLogIndex !== -1) {
		//is found
		let logContent = journalAreaContent.substring(taskLogIndex);
		if (logContent.includes(newLogEntry)) {
			// return on duplicate entry
			return;
		} else {
			quill.insertText(quill.getLength(), newLogEntry);
			saveJournal(true);
		}
	} else {
		journalAreaContent += logHeader + newLogEntry;
		quill.setText(journalAreaContent);
		saveJournal(true);
	}
}

function resetEntryPanel() {
	const div = document.getElementById("entryPanel2");

	const textFields = div.querySelectorAll('input[type="text"]');
	textFields.forEach(function (textField) {
		textField.value = ""; // Set the value of each text field to an empty string
	});

	const dateFields = div.querySelectorAll('input[type="date"]');
	dateFields.forEach(function (dateField) {
		dateField.value = ""; // Set the value of each text field to an empty string
	});

	const checkboxes = div.querySelectorAll('input[type="checkbox"]');
	checkboxes.forEach(function (checkbox) {
		checkbox.checked = false; // Uncheck each checkbox
	});

	// const dropdowns = div.querySelectorAll('select');
	// dropdowns.forEach(function(dropdown) {
	//     dropdown.selectedIndex = 0; // Reset each dropdown to its first option
	// });

	const entryType = document.getElementById("entryType");
	entryType.value = "Task"; // Set the default value to "task"
	const entrySubType = document.getElementById("entrySubType");
	entrySubType.value = "None"; // Set the default value to "none"
	const entryStatus = document.getElementById("entryStatus");
	entryStatus.value = "Not Started"; // Set the default value to "not started"
	const entryPriority = document.getElementById("entryPriority");
	entryPriority.value = "Low"; // Set the default value to "low"
	const entryProject = document.getElementById("entryProject");
	entryProject.value = "None"; // Set the default value to "low"

	const subTaskList = document.getElementById("subTaskList");
	if (subTaskList) {
		// Check if the subtask list exists
		subTaskList.innerHTML = ""; // Remove all child elements
	}

	if (typeof quill2 !== "undefined") {
		// Quill is defined
		//console.log("Quill is defined");
		quill2.setText(""); // Clearing the editor completely
	} else {
		// Quill is not defined
		console.log("Quill is not defined");
	}
}

function resetJournal() {
	document.getElementById("journalID").value = "";
	document.getElementById("journalRev").value = "";
	quill.setText(""); // Clearing the editor completely
}

function resetNotebook() {
	// Reset dropdown to its first option
	document.getElementById("drpNotebookTopic").selectedIndex = 0;

	document.getElementById("noteBookID").value = "";
	document.getElementById("noteBookRev").value = "";
	document.getElementById("noteBookTopic").value = "";

	if (typeof quill3 !== "undefined") {
		// Quill is defined
		//console.log("Quill is defined");
		quill3.setText(""); // Clearing the editor completely
	} else {
		// Quill is not defined
		console.log("Quill3 is not defined");
	}
}

function writeSubTaskToEntryNotes(entry) {
	const currentDate = new Date().toLocaleDateString();
	let entryNotesContent = quill2.getText();
	let logHeader = "\nTask Log:\n";
	let newLogEntry = "- " + currentDate + ": " + entry.completedSubtask;

	// Get the index of "Task Log: " in the textarea's content
	const taskLogIndex = entryNotesContent.indexOf("Task Log:");

	// Does Task Log Header Exist
	if (taskLogIndex !== -1) {
		// is Found
		let logContent = entryNotesContent.substring(taskLogIndex);

		// check for duplicate records
		if (logContent.includes(entry.completedSubtask)) {
			// return on duplicate Entry
			return;
		} else {
			quill2.insertText(quill2.getLength(), newLogEntry);
		}
	} else {
		entryNotesContent += logHeader + newLogEntry;
		quill2.setText(entryNotesContent);
	}
}

document.getElementById("journalDateLabel").addEventListener("dblclick", function () {
	journalDateLabel = document.getElementById("journalDateLabel");

	// Parse the date string into a Date object
	const lblDate = new Date(document.getElementById("journalDateLabel").innerHTML);

	// Get the day of the week (e.g., "Thu")
	const dayOfWeek = lblDate.toLocaleDateString("en-US", { weekday: "short" });

	// Get the month and day (e.g., "May 30")
	const monthAndDay = lblDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });

	// Get the year (e.g., "2024")
	const year = lblDate.getFullYear();

	// Concatenate the formatted strings
	const formattedDate = `${monthAndDay}, ${year} (${dayOfWeek})\n`;

	quill.insertText(0, formattedDate, "bold", true);
	saveJournal(false);
});

function resetEventInputs() {
	document.getElementById("eventType").value = "";
	document.getElementById("eventName").value = "";
	document.getElementById("eventDate").value = "";
	//document.getElementById("accNewEvent").classList.remove('active');
}

function editBookmark() {
	document.getElementById("bmIdHidden").style.display = "inline";
}


function resetBookmarkInputs() {
	document.getElementById("bmID").value = "";
	document.getElementById("bmUrl").value = "";
	document.getElementById("bmTitle").value = "";
	document.getElementById("bmCategory").value = "";
	// document.getElementById("btnUpdateLink").style.display = "none";
	// document.getElementById("btnDeleteLink").style.display = "none";
	document.getElementById("btnAddLink").style.display = "block";
	// document.getElementById("bmIdHidden").style.display = "none";
	document.getElementById("accNewBookmark").classList.remove("active");
    document.getElementById("newLinkArea").style.display = "none";
}

// Get all buttons
const leftPanel = document.getElementById("leftPanel");
let leftButtons = leftPanel.querySelectorAll(".btn1");

// Add click event listeners to each button
leftButtons.forEach((leftButton) => {
	leftButton.addEventListener("click", () => {
		// Remove Selected from all buttons
		leftButtons.forEach((btn) => {
			btn.classList.remove("selected");
		});
		// Select the clicked button
		leftButton.classList.add("selected");
	});
});

function formatDate(date) {
	if (isNaN(date)) {
		return "";
	} else {
		const options = { month: "2-digit", day: "2-digit" };
		return date.toLocaleDateString("en-US", options).replace(/\//g, "-");
	}
}
