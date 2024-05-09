
async function getBookmark() {
	var bmID = document.getElementById("bmID").value;

	try {
		// Try to retrieve the document
		const bmDoc = await db.get(bmID);
		console.log("Document:", bmDoc);

		// document.getElementById("bmID").value = bmDoc._id;
		document.getElementById("bmRev").value = bmDoc._rev;

		document.getElementById("bmUrl").value = bmDoc.url.replace(/'/g, "");
		document.getElementById("bmTitle").value = bmDoc.title;
		document.getElementById("bmCategory").value = bmDoc.category;
	
		// document.getElementById("btnUpdateLink").style.display = "inline-block";
		// document.getElementById("btnDeleteLink").style.display = "inline-block";
		// document.getElementById("btnAddLink").style.display = "none";


	} catch (err) {
		console.log("Error retrieving document:", err);
	}

}

async function loadBookmarks() {
	// Retrieve all documents from the database and filter them based on the docType field
	await db.allDocs({
		startkey: "L-",
		endkey: "L-" + "\uffff",
		include_docs: true, // Do Not Include the full documents in the result
	})
		.then(function (result) {
			console.log(result);
			// Filter the documents by docType === 'Task'
			const filteredDocs = result.rows.filter((row) => {
				return row.doc;
			});

			// Sort the filtered documents based on the category and then by title field
			filteredDocs.sort((a, b) => {
				// Check if both documents have the necessary fields
				if (a.doc && b.doc && a.doc.category && b.doc.category && a.doc.title && b.doc.title) {
					// First, compare the category field
					const categoryComparison = a.doc.category.localeCompare(b.doc.category);
					// If the categories are equal, then compare by title
					if (categoryComparison === 0) {
						return a.doc.title.localeCompare(b.doc.title);
					} else {
						return categoryComparison;
					}
				} else {
					return 0; // Documents without necessary fields are considered equal
				}
			});

			var bmLeftCol = document.getElementById("bmLeftCol");
			var bmRightCol = document.getElementById("bmRightCol");

			// Clear previous content
			bmLeftCol.innerHTML = "";
			bmRightCol.innerHTML = "";
			let currentCategory = null;

			// Iterate over the filteredDocs array to access the data for each document
			filteredDocs.forEach((row) => {

				//console.log( JSON.stringify(row));

				if (row.doc.category.startsWith("General")) {
					if (row.doc.category !== currentCategory) {
						// Add a header for the category
						const categoryHeader = document.createElement("h3");
						categoryHeader.textContent = row.doc.category.substring(
							row.doc.category.indexOf(".") + 1
						);
						categoryHeader.classList.add("listHeader");
						categoryHeader.addEventListener("click", function () {
							// Toggle visibility of bookmark links and line breaks in the left column
							const links = bmLeftCol.querySelectorAll(
								".bmLink." + row.doc.category.substring(row.doc.category.indexOf(".") + 1)
							);
							const breaks = bmLeftCol.querySelectorAll("br");
							links.forEach((link) => {
								link.style.display = link.style.display === "none" ? "block" : "none";
							});
							breaks.forEach((br) => {
								br.style.display = br.style.display === "none" ? "block" : "none";
							});
						});
						bmLeftCol.appendChild(categoryHeader);
						currentCategory = row.doc.category;
					}

					// Add a hyperlink for the title that opens in a new tab
					const bookmarkLink = document.createElement("a");
					bookmarkLink.setAttribute("data-id", row.id);
					bookmarkLink.classList.add("bmLink");
					bookmarkLink.classList.add(
						row.doc.category.substring(row.doc.category.indexOf(".") + 1)
					);
					bookmarkLink.textContent = row.doc.title;
					bookmarkLink.href = row.doc.url;
					bookmarkLink.target = "_blank"; // Open in a new tab
					bmLeftCol.appendChild(bookmarkLink);
					bmLeftCol.appendChild(document.createElement("br")); // Add line break
				} else if (row.doc.category.startsWith("Work")) {
					if (row.doc.category !== currentCategory) {
						// Add a header for the category
						const categoryHeader = document.createElement("h3");
						categoryHeader.textContent = row.doc.category.substring(
							row.doc.category.indexOf(".") + 1
						);
						categoryHeader.classList.add("listHeader");
						categoryHeader.addEventListener("click", function () {
							// Toggle visibility of bookmark links and line breaks in the right column
							const links = bmRightCol.querySelectorAll(
								".bmLink." + row.doc.category.substring(row.doc.category.indexOf(".") + 1)
							);
							const breaks = bmRightCol.querySelectorAll("br");
							links.forEach((link) => {
								link.style.display = link.style.display === "none" ? "block" : "none";
							});
							breaks.forEach((br) => {
								br.style.display = br.style.display === "none" ? "block" : "none";
							});
						});
						bmRightCol.appendChild(categoryHeader);
						currentCategory = row.doc.category;
					}

					// Add a hyperlink for the title that opens in a new tab
					const bookmarkLink = document.createElement("a");
					bookmarkLink.setAttribute("data-id", row.id);
					bookmarkLink.classList.add("bmLink");
					bookmarkLink.classList.add(
						row.doc.category.substring(row.doc.category.indexOf(".") + 1)
					);
					bookmarkLink.textContent = row.doc.title;
					bookmarkLink.href = row.doc.url;
					bookmarkLink.target = "_blank"; // Open in a new tab
					bmRightCol.appendChild(bookmarkLink);
					bmRightCol.appendChild(document.createElement("br")); // Add line break
				}
			});


			const leftTab = document.getElementById("accLeftBookmark");
			leftTab.classList.add("active");
			const leftContent = document.getElementById("bmLeftCol");
			leftContent.style.display = "block";
			const rightTab = document.getElementById("accRightBookmark");
			rightTab.classList.add("active");
			const rightContent = document.getElementById("bmRightCol");
			rightContent.style.display = "block";

			handleBookmarkLinkHover();
		})
		.catch(function (error) {
			console.error("Error retrieving documents:", error);
		});
}


// Create a function to handle the hover behavior
function handleBookmarkLinkHover() {
	const bookmarkLinks = document.querySelectorAll(".bmLink");

	bookmarkLinks.forEach((link) => {
		link.addEventListener("mouseover", function () {
			const dataId = link.getAttribute("data-id");
			const tooltip = document.createElement("span");
			tooltip.textContent = ` - ${dataId}`;
			tooltip.classList.add("tooltip"); // Add a class for styling
			link.appendChild(tooltip);
		});

		link.addEventListener("mouseout", function () {
			const tooltip = link.querySelector(".tooltip");
			if (tooltip) {
				tooltip.remove();
			}
		});
	});
}

async function addBookmark() {

	var newURL = document.getElementById("bmUrl").value;
	var newTitle = document.getElementById("bmTitle").value;
	var newCategory = document.getElementById("bmCategory").value;

	if (newURL === "" || newTitle === "" || newCategory === "") {
		alert("Missing Data");
		return;
	} else {
		bookmarkID = await getNextID("Link");
		console.log("DocumentID: " + bookmarkID);

		//Preparing the document
		docNB = {
			_id: bookmarkID,
			docType: "Link",
			title: newTitle,
			url:  newURL,
			category: newCategory,
		};

		// Use Post for New Records and Put to update existing
		db.post(docNB, function (err, response) {})
			.then(function (response) {
				// on success
				console.log("Document Created Successfully:  " + JSON.stringify(response));
				resetBookmarkInputs();
				loadBookmarks();
			})
			.catch(function (err) {
				console.log(err);
			});
	}
}


async function updateBookmark() {
	var newURL = document.getElementById("bmUrl").value;
	var newTitle = document.getElementById("bmTitle").value;
	var newCategory = document.getElementById("bmCategory").value;

	if (newURL === "" || newTitle === "" || newCategory === "") {
		alert("Missing Data");
		return;
	} else {
		bookmarkID = document.getElementById("bmID").value;
		bookmarkRev = document.getElementById("bmRev").value;
		console.log("DocumentID: " + bookmarkID);

		//Preparing the document
		docNB = {
			_id: bookmarkID,
			_rev:  bookmarkRev,
			docType: "Link",
			title: newTitle,
			url:  newURL,
			category: newCategory,
		};

		// Use Post for New Records and Put to update existing
		db.put(docNB, function (err, response) {})
			.then(function (response) {
				// on success
				console.log("Document Updated Successfully:  " + JSON.stringify(response));
				resetBookmarkInputs();
				loadBookmarks();
			})
			.catch(function (err) {
				console.log(err);
			});
	}
}

async function deleteBookmark() {
	var bmID = document.getElementById("bmID").value;
	if (bmID.value == "") {
		alert("Nothing to Delete");
		return;
	} else {
		// Fetch the document you want to delete
		db.get(bmID)
			.then(function (doc) {
				// Delete the document
				return db.remove(doc);
			})
			.then(function (result) {
				console.log("Document deleted successfully:", result);
				resetBookmarkInputs();
				loadBookmarks();
			})
			.catch(function (err) {
				console.error("Error deleting document:", err);
			});
	}

}