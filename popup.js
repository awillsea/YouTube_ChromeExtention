import { getActiveTabURL } from "./util.js";

// adding a new bookmark row to the popup
const addNewBookmark = (bookmarksElement,bookmark) => {
    const bookmarkTitleElement = document.createElement("div");
    const controlsElement = document.createElement("div");
    const newBookmarkElement = document.createElement("div");
  
    bookmarkTitleElement.textContent = bookmark.desc;
    bookmarkTitleElement.className = "bookmark-title";
    controlsElement.className = "bookmark-controls";
  
    setBookmarkAttributes("play", onPlay, controlsElement);
    setBookmarkAttributes("delete", onDelete, controlsElement);
  
    newBookmarkElement.id = "bookmark-" + bookmark.time;
    newBookmarkElement.className = "bookmark";
    newBookmarkElement.setAttribute("timestamp", bookmark.time);
  
    newBookmarkElement.appendChild(bookmarkTitleElement);
    newBookmarkElement.appendChild(controlsElement);
    bookmarksElement.appendChild(newBookmarkElement);
};

const viewBookmarks = (currentBookmarks=[]) => {
    const bookmarksElement = document.getElementById("bookmarks");
    bookmarksElement.innerHTML = "";
    
  if (currentBookmarks.length > 0) {
    for (let i = 0; i < currentBookmarks.length; i++) {
      const bookmark = currentBookmarks[i];
      addNewBookmark(bookmarksElement, bookmark);
    }
  } else {
    bookmarksElement.innerHTML = '<i class="row">No bookmarks to show</i>';
  }

  
};

const onPlay = async  e => {
    const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp");
    const activeTab = await getActiveTabURL(); 
    //need to send a message to our content script to manipulate the dom in order to play the video from time stamp
    chrome.tabs.sendMessage(activeTab.id,{
        type:"PLAY",
        value: bookmarkTime
    })
};

const onDelete = async e => {
    const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp");
    const activeTab = await getActiveTabURL(); 
    const bookmarkElementToDelete = document.getElementById("bookmark-" + bookmarkTime);
    bookmarkElementToDelete.parentNode.removeChild(bookmarkElementToDelete);
    //need to send a message to our content script to manipulate the dom in order to play the video from time stamp
    chrome.tabs.sendMessage(activeTab.id,{
        type:"DELETE",
        value: bookmarkTime
    },viewBookmarks)
};
const setBookmarkAttributes =  (src,eventListener,controlParentElement) => {
//controlElements are play/delete buttons
const controlElement = document.createElement("img");
// the src will change depending on fi we want play or delete button
controlElement.src = "assets/" + src + ".png";
controlElement.title = src;
controlElement.addEventListener("click",eventListener);
controlParentElement.appendChild(controlElement);
};


// the following is a native event that triggers when an html document has been initially loaded
// document.addEventListener("DOMContentLoaded", async () => {
//     // setting the var active Tab to the function get activeTabUrl function from the util file
//     const activeTab = await getActiveTabURL();
//     //using query params to help identify the video
//     const queryParameters = activeTab.url.split("?")[1];
//     // get the unique identifier for each video
//     const urlParameters = new URLSearchParams(queryParameters);

//     const currentVideo = urlParameters.get("v");
//     if(activeTab.url.includes("youtube.com/watch")&&currentVideo){
//         chrome.storage.sync.get([currentVideo], (data)=>{
//             const currentVideoBookmarks = data[currentVideo] ? JSON.parse(data[currentVideo]):  [];

//             //viewBookMarks
//         })
        
//     }
//     // if we are not on a youtube.com video page
//     else{
//         const container = document.getElementsByClassName("container")[0];
//         container.innerHTML = '<div class="title"> This is not a youtube page.</div>'
//     }

// });
document.addEventListener("DOMContentLoaded", async () => {
//     // setting the var active Tab to the function get activeTabUrl function from the util file
  const activeTab = await getActiveTabURL();
//     //using query params to help identify the video
  const queryParameters = activeTab.url.split("?")[1];
  const urlParameters = new URLSearchParams(queryParameters);

  const currentVideo = urlParameters.get("v");

  if (activeTab.url.includes("youtube.com/watch") && currentVideo) {
    chrome.storage.sync.get([currentVideo], (data) => {
      const currentVideoBookmarks = data[currentVideo] ? JSON.parse(data[currentVideo]) : [];

      viewBookmarks(currentVideoBookmarks);
    });
  } else {
    const container = document.getElementsByClassName("container")[0];

    container.innerHTML = '<div class="title">This is not a youtube video page.</div>';
  }
});
