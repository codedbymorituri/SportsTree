console.log("SportsTree is running"); //

let indexRazorObject;
let sportsTreeParentElement;
let statusTextElement;

function setIndexRazorObject(value) {
    indexRazorObject = value;
}

function setSportsTreeParentElement(parentElement) {
    sportsTreeParentElement = parentElement;
}

function setStatusTextElement(statusElement) {
    statusTextElement = statusElement;
}

function setOpenLinkButtonElement(openLinkButtonElement) {
    openLinkButtonElement.addEventListener("click", async function (e) {
        if (statusTextElement.innerHTML.startsWith("http")) {
            window.open(statusTextElement.innerHTML, "_blank");
        }
    });
}

function setReloadButtonElement(reloadButtonElement) {
    reloadButtonElement.addEventListener("click", async function (e) {
        location.reload();
    });
}

function createSportsTree(sites) {
    const sportsTreeElement = document.createElement("li");
    sportsTreeElement.className = "sites-list";
    sportsTreeElement.innerHTML = `<span class="root-selector">Sports Tree</span>`;
    sportsTreeParentElement.appendChild(sportsTreeElement);
    const sitesParentElement = document.createElement("ul");
    sitesParentElement.className = "nested active";
    sportsTreeElement.appendChild(sitesParentElement);
    sites.forEach(function (site) {
        addSiteElement(sitesParentElement, site);
    });
}

function addSiteElement(parentElement, site) {
    const childElement = document.createElement("li");
    childElement.innerHTML = `<span class="selector">${site.treeViewText}</span>`;
    parentElement.appendChild(childElement);
    addElementClickedEventHandler(childElement, site.treeViewText, site.treeViewLink, site.treeViewDataType);
    addChildLoadingElement(childElement);
}

function addElementClickedEventHandler(element, siteName, endpoint, dataType) {
    element.addEventListener("click", async function (e) {
        e.stopPropagation();
        removeHighlight();
        if (dataType === "None") {
            return;
        }
        if (dataType === "Link") {
            element.classList.add("highlight");
        }
        else {
            e.target.parentElement.querySelector(".nested").classList.toggle("active");
            const ulElement = e.target.parentElement.querySelector("ul");
            const liElements = ulElement.querySelectorAll("li");
            if (liElements[0].innerHTML === "Loading...") {
                await handleExpand(e.target, siteName, endpoint, dataType);
            }
        }
        e.target.classList.toggle("selector-down");
        updateStatusText(endpoint);
    });
}

async function handleExpand(parentElement, siteName, endpoint, dataType) {
    if (dataType === "Link") {
        return;
    }
    const treeViewItems = await indexRazorObject.invokeMethodAsync("HandleExpand", siteName, endpoint, dataType);
    const ulElement = parentElement.parentElement.querySelector("ul");
    const liElements = ulElement.querySelectorAll("li");
    if (liElements[0].innerHTML === "Loading...") {
        ulElement.removeChild(liElements[0]);
    }
    if (treeViewItems === null || Object.keys(treeViewItems).length === 0) {
        addChildNothingFoundElement(parentElement);
    }
    else {
        addChildElements(parentElement, siteName, treeViewItems); 
    }
}

function addChildElements(parentElement, siteName, childData) {
    const childElement = document.createElement("ul");
    childElement.className = "nested active";
    childData.forEach(function (child) {
        addChildElement(childElement, siteName, child);
    });
    parentElement.appendChild(childElement);
}

function addChildElement(parentElement, siteName, childData) {
    const childElement = document.createElement("li");
    if (childData.treeViewDataType === "Link") {
        childElement.innerHTML = `<span >${childData.treeViewText}</span>`;
    }
    else
    {
        childElement.innerHTML = `<span class="selector">${childData.treeViewText}</span>`;
        addChildLoadingElement(childElement);
    }
    addElementClickedEventHandler(childElement, siteName, childData.treeViewLink, childData.treeViewDataType);
    parentElement.appendChild(childElement);
}

function addChildNothingFoundElement(parentElement) {
    const childElement = document.createElement("ul");
    childElement.className = "nested active";
    childElement.innerHTML = '<li class="nothing-found">Nothing found</li>';
    addElementClickedEventHandler(childElement, "", "", "None");
    parentElement.appendChild(childElement);
}

function addChildLoadingElement(parentElement) {
    const childElement = document.createElement("ul");
    childElement.className = "nested";
    childElement.innerHTML = '<li class="loading">Loading...</li>';
    addElementClickedEventHandler(childElement, "", "", "Link");
    parentElement.appendChild(childElement);
}

function removeHighlight() {
    const treeviewContainer = document.querySelector(".treeview-container");
    const highlightElements = treeviewContainer.querySelectorAll(".highlight");
    highlightElements.forEach(element => {
        element.classList.remove("highlight");
    });
}

function updateStatusText(text) {
    statusTextElement.innerHTML = text;
}
