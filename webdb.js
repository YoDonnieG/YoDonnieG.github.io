var db;
var request;

// Define the prefix for each document type
const prefixes = {
	Task: "T-",
	Journal: "J-",
	Link: "L-",
	Event: "E-",
	Notebook: "N-",
};

function initDB() {
    // Initialize PouchDB instance
	 db = new PouchDB("planner");

    // Remote CouchDB URL
    var remoteCouch = "https://admin:admin@192.168.1.40:5984/planner";

    // Replicate data with remote CouchDB
    var replication = PouchDB.sync("planner", remoteCouch, {
        live: true, // Continuous replication
        retry: true, // Retry replication on errors
    });

    // Listen for replication events
    replication.on("change", function (info) {
        console.log("Replication Change:", info);
    });

    replication.on("paused", function (info) {
        console.log("Replication Paused:", info);
    });

    replication.on("active", function (info) {
        console.log("Replication Active:", info);
    });

    replication.on("denied", function (info) {
        console.error("Replication Denied:", info);
    });

    replication.on("error", function (error) {
        console.error("Replication Error:", error);
    });

    // Database information
    db.info()
        .then(function (info) {
            console.log("Database Info:", info);
            // Initialize page
            initPage();
        })
        .catch(function (error) {
            console.error("Database Info Error:", error);
        });
}









// function initDB() {
// 	// Initialize PouchDB instance
// 	db = new PouchDB("planner");

// 	// Remote CouchDB URL
// 	var remoteCouch = "http://admin:admin@127.0.0.1:5984/planner";
// 	//var remoteCouch = "http://127.0.0.1:5984/planner/";

//     // Replicate data with remote CouchDB
//     var replication = db.replicate.sync(remoteCouch, {
//         live: true, // Continuous replication
//         retry: true, // Retry replication on errors
//     });

//     // Listen for replication events
// 	replication.on("paused", function (info) {
// 		if (info) {
// 			console.log("Replication Paused:", info);
// 			if (info.doc_write_failures) {
// 				console.log("Document Write Failures:", info.doc_write_failures);
// 			}
// 			if (info.docs_read) {
// 				console.log("Documents Read:", info.docs_read);
// 			}
// 			if (info.docs_written) {
// 				console.log("Documents Written:", info.docs_written);
// 			}
// 			if (info.pending) {
// 				console.log("Pending Changes:", info.pending);
// 			}
// 			if (info.errors) {
// 				console.log("Errors:", info.errors);
// 			}
// 		} else {
// 			console.log("Replication Paused.");
// 		}
// 	});

//     replication.on("active", function (info) {
//         console.log("Replication Active:", info);
//         // Handle replication active event
//     });

//     replication.on("error", function (error) {
//         console.error("Replication Error:", error);
//         // Handle replication error
//     });

// 	// Database information
// 	db.info()
// 	.then(function (info) {
// 		console.log("Database Info:", info);
// 		// Initialize page
// 		initPage();
// 	})
// 	.catch(function (error) {
// 		console.error("Database Info Error:", error);
// 	});

// }


// Function to retrieve a document by its ID
async function getDocumentById(docId) {
	return await db.get(docId);
}

async function getNextID(type) {
	return new Promise((resolve, reject) => {

		var shortId = '';

		if (type == "Task"){
			const cDT = new Date();
			const year = String(cDT.getFullYear()).slice(-1); // Last digit of the year
			const month = String.fromCharCode('A'.charCodeAt(0) + cDT.getMonth()); // Convert month to letter ('A' for January, 'B' for February, etc.)
		
			const day = cDT.getDate() <= 26 ?
				String.fromCharCode('a'.charCodeAt(0) + 1 + cDT.getDate()) :
				String.fromCharCode('A'.charCodeAt(0) + 1 + (cDT.getDate() - 26));

			shortId = `${prefixes[type]}${year}${month}${day}-`;	

		}else if (type == "Event"){
			shortId = `${prefixes[type]}` + document.getElementById("eventDate").value.replace(/\s+/g, '') + "-";
		} else {
			shortId = `${prefixes[type]}`;		
		}

		console.log(shortId);


		var newID;
		db.allDocs({
			startkey: shortId + "\uffff",
			endkey: shortId,
			descending: true, // Set to true to retrieve the highest number
			include_docs: false, // Do Not Include the full documents in the result
		})
		.then(function (result) {
			console.log(result);

			if (result.rows.length > 0) {
				// Extract the numerical part of the IDs and find the maximum
				const maxNum = Math.max(...result.rows.map(row => {
					const numPart = parseInt(row.id.replace(shortId, ''), 10);
					return isNaN(numPart) ? 0 : numPart;
				}));
				console.log("Max Number Found: " + maxNum);
				newID = maxNum + 1;
			} else {
				// If no documents exist with the specified prefix, start with ID 1
				newID = 1;
			}

			resolve(shortId + newID ) ;
		})
		.catch(function (error) {
			console.error("Error retrieving documents:", error);
		});
	});
}


function genNewID () {

	// Get current date/time components
	const cDT = new Date();
	const year = String(cDT.getFullYear()).slice(-1); // Last digit of the year
	const month = String.fromCharCode('A'.charCodeAt(0) + cDT.getMonth()); // Convert month to letter ('A' for January, 'B' for February, etc.)

	const day = cDT.getDate() < 26 ?
		String.fromCharCode('a'.charCodeAt(0) + cDT.getDate()) :
		String.fromCharCode('A'.charCodeAt(0) + (cDT.getDate() - 26));

	const hour = cDT.getHours() < 26 ?
        String.fromCharCode('a'.charCodeAt(0) + cDT.getHours()) :
        String.fromCharCode('A'.charCodeAt(0) + (cDT.getHours() - 26));
		
		const minute = String(cDT.getMinutes()).padStart(2, '0'); // Minute (zero-padded to 2 digits)

	// Combine components into a short ID
	const shortId = `${year}${month}${day}${hour}${minute}`;

	return shortId;
}

function addRowHeaderClickListener() {
	let entryHeaderRows = document.querySelectorAll("#entryTable tbody tr.entryHeader");

	entryHeaderRows.forEach(function (entryHeaderRow) {
		entryHeaderRow.addEventListener("click", function (event) {
			if (entryHeaderRow.classList.contains("show")) {
				entryHeaderRow.classList.remove("show");
			} else {
				entryHeaderRow.classList.add("show");
			}

			let rowType = event.target.closest("tr").textContent;

			//Toggle visibility of entries matching the clicked header
			const rows = document.querySelectorAll("." + rowType);
			rows.forEach((row) => {
				if (entryHeaderRow.classList.contains("show")) {
					row.classList.remove("hidden");
				} else {
					row.classList.add("hidden");
				}
			});
		});
	});
}

function hideEntryHeaderRows() {
	// Select all rows with the class "entryHeader"
	const entryHeaderRows = document.querySelectorAll("#entryTable tbody tr.entryHeader");

	// Hide each row with the class "entryHeader"
	entryHeaderRows.forEach((row) => {
		row.classList.add("hidden");
	});
}

function showEntryHeaderRows() {
	// Select all rows with the class "entryHeader"
	const entryHeaderRows = document.querySelectorAll("#entryTable tbody tr.entryHeader");

	// Hide each row with the class "entryHeader"
	entryHeaderRows.forEach((row) => {
		row.classList.remove("hidden");
	});
}

function hideColumn(columnIndex) {
	const table = document.getElementById("entryTable");
	const columns = table.querySelectorAll(".col" + columnIndex);

	columns.forEach(function (column) {
		column.classList.add("hidden");
	});
}

function showColumn(columnIndex) {
	const table = document.getElementById("entryTable");
	const columns = table.querySelectorAll(".col" + columnIndex);

	columns.forEach(function (column) {
		column.classList.remove("hidden");
	});
}

function unSelectTableRow() {
	// Select all rows in the table body
	const rows = document.querySelectorAll("#entryTable tbody tr");

	// Loop through each row and remove the class
	rows.forEach(function (row) {
		row.classList.remove("rowSelect"); // Replace 'yourClassName' with the class you want to remove
	});
}

function addRowClickListener() {
	// Select all rows in the table body
	const rows = document.querySelectorAll("#entryTable tbody tr");

	// Add click event listener to each row
	rows.forEach((row) => {
		row.addEventListener("click", function () {
			unSelectTableRow();

			// Get the entry ID from the second column (index 1)

			if (row.cells.length > 1) {
				const entryId = row.cells[1].textContent;
				//console.log(entryId);

				row.classList.add("rowSelect");

				// Call a function and pass the entry ID
				editTask(entryId);
			} else {
				navHome();
			}
		});
	});
}


// Backup database to JSON file
function backupDB() {
    var backup = {};
    var dbName = "planner";

    // Initialize PouchDB
    var db = new PouchDB(dbName);

    // Get all documents from the database
    db.allDocs({ include_docs: true })
        .then(function (result) {
            result.rows.forEach(function (row) {
                var doc = row.doc;
                var docType = doc._id.split(':')[0]; // Assuming document type is indicated by a prefix before ':'

                if (!backup[docType]) {
                    backup[docType] = [];
                }

                backup[docType].push(doc);
            });

            // Convert backup to JSON and save to file
            var jsonBackup = JSON.stringify(backup);
            saveToFile(jsonBackup, dbName + "_backup.json");
        })
        .catch(function (err) {
            console.error("Error backing up database:", err);
        });
}

// Function to save data to file
function saveToFile(data, fileName) {
    var blob = new Blob([data], { type: "application/json" });
    var url = URL.createObjectURL(blob);

    var a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}


// Restore PouchDB from backup file
async function restoreDBFromFile(dbName, backupFileInput) {
    var backupFile = backupFileInput.files[0];
    var reader = new FileReader();

    reader.onload = async function (event) {
        var backupData = JSON.parse(event.target.result);
        
        try {
            // Open PouchDB
            var db = new PouchDB(dbName);
            console.log("Database opened successfully.");

            // Check for existing documents
            const existingDocs = await db.allDocs({ include_docs: false });
            if (existingDocs.total_rows > 0) {
                console.warn("Warning: Existing documents found in the database.");
                console.log("Existing documents:", existingDocs.rows.map(row => row.id));
            }

            // Iterate through backupData
            for (let docType of Object.keys(backupData)) {
                // Bulk insert documents into PouchDB
                await Promise.all(backupData[docType].map(async function(doc) {
                    try {
                        // Omit the _rev field to ensure new document insertion
                        delete doc._rev;
                        await db.put(doc);
                        console.log("Document inserted:", doc);
                    } catch (err) {
                        console.error("Error inserting document:", err);
                        console.log("Document causing conflict:", doc);
                    }
                }));
                console.log("Data of type", docType, "restored successfully.");
            }

            console.log("Data restored successfully.");
            //location.reload(); // Refresh page after restore is complete
        } catch (err) {
            console.error("Error restoring data:", err);
        }
    };

    reader.readAsText(backupFile); // Read the file as text
}




// Restore PouchDB from backup file
async function restoreDB() {
    var backupFileInput = document.getElementById("backupFile");

    try {
        // Destroy existing database
        await db.destroy();
        console.log("Database destroyed successfully.");

        // Restore database from backup file
        await restoreDBFromFile("planner", backupFileInput);
    } catch (err) {
        console.error("Error restoring database:", err);
    }
}
