console.log("SportsTree is running"); //

let indexRazorObject;
let sportsTreeParentElement;
let statusTextElement;
let openLinkButtonElement;

function setIndexRazorObject(value) {
    indexRazorObject = value;
}

function setSportsTreeParentElement(parentElement) {
    sportsTreeParentElement = parentElement;
}

function setStatusTextElement(statusElement) {
    statusTextElement = statusElement;
}

function setOpenLinkButtonElement(linkButtonElement) {
    openLinkButtonElement = linkButtonElement;
    openLinkButtonElement.addEventListener("click", async function (e) {
        if (statusTextElement.innerHTML.startsWith("http")) {
            window.open(statusTextElement.innerHTML, "_blank");
        }
    });
}

function createSportsTree(sites) {
    const sportsTreeElement = document.createElement("li");
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
}

function addElementClickedEventHandler(element, siteName, endpoint, dataType) {
    element.addEventListener("click", async function (e) {
        e.stopPropagation();
        removeHighlight();
        if (dataType === "Link" && endpoint !== "") {
           element.classList.add("highlight");
        }
        if (e.target.parentElement.querySelector(".nested")) {
            e.target.parentElement.querySelector(".nested").classList.toggle("active");
        } else {
            if (!e.target.parentElement.querySelector(".selector-down")) {
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
    }
    addElementClickedEventHandler(childElement, siteName, childData.treeViewLink, childData.treeViewDataType);
    parentElement.appendChild(childElement);
}

function addChildNothingFoundElement(parentElement) {
    const childElement = document.createElement("ul");
    childElement.className = "nested active";
    childElement.innerHTML = '<li class="nothing-found">Nothing found</li>';
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
