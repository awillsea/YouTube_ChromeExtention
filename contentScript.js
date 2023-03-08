
(()=>{
    // one is going to be for accessing the player and the other for accessing the controls. and allow me to manipulate each of them
    let youtubeLeftControls, youtubePlayer;
    let currentVideo = "";
    let currentVideoBookmarks = [];
// we are listening for any messages. those msg will contain info. in this ex type (so we can have the if statement) and value(what we want to set info to manipulate the DOM)

chrome.runtime.onMessage.addListener((obj,sender,response)=>{
        // deconstructing the obj that was sent in
        const{type,value,videoId}=obj;
        if(type === "NEW"){
            currentVideo = videoId;
            // newVideoLoaded is a function that will handle incoming new videos
            newVideoLoaded();
        } else if(type === "PLAY"){
            youtubePlayer.currentTime = value;
        }else if(type === "DELETE"){
            console.log("delete")
            currentVideoBookmarks = currentVideoBookmarks.filter((b)=> b.time != value);
            chrome.storage.sync.set({ [currentVideo]: JSON.stringify(currentVideoBookmarks) });
            response(currentVideoBookmarks);
        }
    });

    const fetchBookmarks = ()=>{
        return new Promise((resolve)=>{
            chrome.storage.sync.get([currentVideo],(obj)=>{
                resolve(obj[currentVideo] ? JSON.parse(obj[currentVideo]): []);
            })
        })
    }

    const newVideoLoaded  = async () =>{
        const bookmarkBtnExists = document.getElementsByClassName("bookmark-btn")[0];
        currentVideoBookmarks = await fetchBookmarks();

        if(!bookmarkBtnExists){
            const bookmarkBtn = document.createElement("img");

            bookmarkBtn.src = chrome.runtime.getURL("assets/bookmark.png");
            bookmarkBtn.className = "ytb-btn"+"bookmark-btn";
            bookmarkBtn.title = "Click to bookmark current timestamp";

            youtubeLeftControls = document.getElementsByClassName("ytp-left-controls")[0];
            youtubePlayer = document.getElementsByClassName("video-stream")[0];

            youtubeLeftControls.append(bookmarkBtn);
            bookmarkBtn.addEventListener("click", addNewBookmarkEventHandler);
        }
    }

    const addNewBookmarkEventHandler = async () =>{
        const currentTime = youtubePlayer.currentTime;
        const newBookmark = {
            time:currentTime,
            desc:"Bookmark at " + getTime(currentTime),
        };
        currentVideoBookmarks = await fetchBookmarks();

        chrome.storage.sync.set({
            [currentVideo]: JSON.stringify([...currentVideoBookmarks, newBookmark].sort((a, b) => a.time - b.time))
        });
    }


    let trail="&ytExt=ON";
    if(!window.location.href.includes(trail)&&!window.location.href.includes("ab_channel")&& window.location.href.includes("youtube.com/watch")){
            window.location.href+=trail;
       }
})();



const getTime = (t) => {
    var date = new Date(0);
    date.setSeconds(t);

    return date.toISOString().substring(14,19);
}