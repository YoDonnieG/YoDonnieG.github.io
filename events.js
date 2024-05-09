async function addEvent() {

	var eventType = document.getElementById("eventType").value;
	var eventName = document.getElementById("eventName").value;
	var eventDate = document.getElementById("eventDate").value;

	if (eventType === "" || eventName === "" || eventDate === "") {
		alert("Missing Required Entries");
		return;
	} else {
		eventID = await getNextID("Event");
		console.log("DocumentID: " + eventID);

		//Preparing the document
		docCE = {
			_id: eventID,
			docType: "Event",
			type: eventType,
			name: eventName,
			date: eventDate,
		};

		// Use Post for New Records and Put to update existing
		db.post(docCE, function (err, response) {})
		.then(function (response) {
			// on success
			console.log("Document Created Successfully: " + JSON.stringify(response));
			resetEventInputs();
			loadEvents();
		})
		.catch(function (err) {
			console.log(err);
		});
	}
}

function loadEvents() {
	console.log("Loading Events...");
	const tbody = document.getElementById("eventTableBody"); // Assuming the table body has the ID "entryTableBody"
	tbody.innerHTML = ""; // Set innerHTML to an empty string to remove all child elements

	let type = "Event";
	const newDate = new Date();
	const currentMonth = newDate.getMonth() + 1;
	const currentDay = newDate.getDate();
	const currentYear = newDate.getFullYear();
	let nextYearEntries = [];
	let currentType = null;

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

			filteredDocs.sort((a, b) => {
				const aDate = new Date(a.doc.date);
				const bDate = new Date(b.doc.date);
				return aDate.getMonth() - bDate.getMonth() || aDate.getDate() - bDate.getDate();
			});


			// Add a header for next year
			const thisYearHeader = document.createElement("tr");
			thisYearHeader.innerHTML = `<td colspan="4" class="entryHeader"><Strong>${currentYear}</Strong></td>`;
			tbody.appendChild(thisYearHeader);
	
			// Iterate over the filteredDocs array to access the data for each document
			filteredDocs.forEach((row) => {
	
				// Calculate the Number of Years
				const entryDay = new Date(row.doc.date).getDate() + 1;
				const entryMonth = new Date(row.doc.date).getMonth() + 1;
				const entryYear = new Date(row.doc.date).getFullYear();
				const yearDiff = currentYear - entryYear;

				// Reformat the Date Value to be Displayed in the Table
				const formattedDate = `${entryMonth}-${entryDay}-${entryYear}`;

				// Add entry row
				const htmlRow = document.createElement("tr");

				if (entryMonth === currentMonth && entryDay === currentDay) {
					let headsUp = row.doc.name + " (" + row.doc.type + " - " + yearDiff + ")";
					document.getElementById("txtSpecial").innerHTML = headsUp;
				}

				if (entryMonth >= currentMonth) {
					// Add entry row
					htmlRow.innerHTML = `							
						<td class="col1">${row.doc.name}</td>
						<td class="col0">${row.doc.type}</td>
						<td class="col2">${formattedDate}</td>
						<td class="col3">${yearDiff}</td>
						<!-- Add more cells as needed -->
						`;
					tbody.appendChild(htmlRow);
				} else {
					// Add entry row
					htmlRow.innerHTML = `
						<td class="col1">${row.doc.name}</td>	
						<td class="col0">${row.doc.type}</td>
						<td class="col2">${formattedDate}</td>
						<td class="col3">${yearDiff + 1}</td>
						<!-- Add more cells as needed -->
						`;
					nextYearEntries.push(htmlRow);
				}
		
			});		
				// Add a header for next year
				const nextYearHeader = document.createElement("tr");
				nextYearHeader.innerHTML = `<td colspan="4" class="entryHeader"><Strong>${
					currentYear + 1
				}</Strong></td>`;
				tbody.appendChild(nextYearHeader);

				// Append next year entries
				nextYearEntries.forEach((entry) => {
				tbody.appendChild(entry);
				});
		})
		.catch(function (error) {
			console.error("Error retrieving documents:", error);
		});
}