

// Called directly from inline HTML
function createSubViewTopBar(backTarget, text) {
    let div1 = document.createElement("div");
    let div2 = document.createElement("div");
    let img = document.createElement("img");
    let span1 = document.createElement("span");
    let span2 = document.createElement("span");
    let span3 = document.createElement("span");
    let span4 = document.createElement("span");
    div2.className = "LiftKit-menu-button"; div2.style.margin = "0"; div2.style.paddingRight = "5px"; div2.style.position = "absolute"; div2.onclick = () => { switchView(backTarget) };
    img.src = "abb_left_32.png"; img.class = "LiftKit-icon-32";
    span1.className = "LiftKit-sub-view-back";

    span1.textContent = "";
    text = "";
    span2.style.flexGrow = 1;
    span3.className = "LiftKit-sub-view-toptext";
    span3.textContent = text;
    span4.style.flexGrow = 1;

    div1.appendChild(div2);
    div2.appendChild(img);
    div2.appendChild(span1);
    div1.appendChild(span2);
    div1.appendChild(span3);
    div1.appendChild(span4);
    document.currentScript.parentElement.insertBefore(div1, document.currentScript);
}
function switchView(viewId) {


    // Main view properties
    id("LiftKit-main-grid-container").style.display = viewId === "LiftKit-main-grid-container" ? "grid" : "none";

    // Settings view properties
    id("LiftKit-Settings-subview").style.display = viewId === "LiftKit-Settings-subview" ? "grid" : "none";
    // Settings view properties
    id("LiftKit-Settings-subview2").style.display = viewId === "LiftKit-Settings-subview2" ? "grid" : "none";


}

// Helper function for fetching element by id.
function id(name) {
    return document.getElementById(name);
}
