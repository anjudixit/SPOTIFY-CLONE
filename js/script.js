console.log("Let's write javascript")
let currentSong= new Audio();
let songs;
let curFolder;


// Function to convert seconds to minutes seconds
function formatTime(seconds) {
    seconds = Math.floor(seconds); // Remove decimal part
    let minutes = Math.floor(seconds / 60);
    let secs = seconds % 60;

    // Ensure two-digit format
    minutes = String(minutes).padStart(2, "0");
    secs = String(secs).padStart(2, "0");

    return `${minutes}:${secs}`;
}

async function getSongs(folder) {
    curFolder= folder;
    let a = await fetch(`http://127.0.0.1:5500/${folder}`);
    console.log("Fetching from:", `http://127.0.0.1:5500/${folder}`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");

    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
            console.log(songs);
        }
    }


    // Show all the song in the Playlsit
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    console.log(songUL);
    songUL.innerHTML= "";
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li> 
                                                    <img class="invert" src="images/music.svg" alt="">
                                                    <div class="info">
                                                        <div>${song.replaceAll("%20", " ")}</div>
                                                        <div>Anju</div>
                                                    </div>
                                                    <div class="playNow">
                                                        <span>Play Now</span>
                                                        <img class="invert" src="images/play.svg" alt="">
                                                    </div> 
                                                </li>`;
    }

    // Attach an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach((e)=>{
        e.addEventListener("click", (element)=>{
            let songName= e.querySelector(".info").firstElementChild.innerHTML.trim();
            console.log("Playing:",songName);
            playMusic(`songs/${songName}`);
        })
    })
    return songs;
}


const playMusic = (track, pause = false) => {
    currentSong.src= `/${curFolder}/` + (track.replace("songs/", ""));
    console.log("Attempting to play:", currentSong.src); // Debugging

    // Check if the audio element is ready to play
    if(!pause){
        currentSong.play();
        play.src= "pause.svg";
    }

    document.querySelector(".songInfo").innerHTML = decodeURIComponent(track.split("/").pop());
    document.querySelector(".songTime").innerHTML = "00:00 / 00:00";
};

async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:5500/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors= div.getElementsByTagName("a");
    let cardContainer= document.querySelector(".cardContainer");
    let array= Array.from(anchors);
        for(let index= 0; index< array.length; index++){
            const e= array[index];
            // console.log(e);

            if (e.href.includes("/songs/")){
                let folder= e.href.split("/").slice(-1)[0];
                console.log(folder);
            // Get the metadata of the folder
            let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);
            console.log(a);
            let response = await a.json();
            console.log(response);
            cardContainer.innerHTML= cardContainer.innerHTML + `<div class="card" data-folder="${folder}">
                        <div class="play">
                            <svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="23" cy="23" r="23" fill="lightgreen" />
                                <path
                                    d="M17.05 13.606L30.54 21.394a.7.7 0 0 1 0 1.212L17.05 30.394A.7.7 0 0 1 16 29.788V14.212a.7.7 0 0 1 1.05-.606z"
                                    fill="black" />
                            </svg>

                        </div>
                        <img src="songs/${folder}/cover.jpg" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`
        }
    }


    // Load the playlist whenver card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        console.log(e);
        e.addEventListener("click", async (item) => {
            console.log("Dataset:", item.currentTarget.dataset); // Debugging dataset
            
            let folder = item.currentTarget.dataset.folder;
            songs = await getSongs(`songs/${folder}`);
            playMusic(songs[0]);
        });
    });
}

async function main() {
    // Get the list of all songs
    songs = await getSongs("songs/Bollywood");
    playMusic(songs[0],true);

    
    // Display all the albums on the page
    displayAlbums();


    // Attach an event listener to play, next and previous
    play.addEventListener("click",()=>{  
        console.log(currentSong)      
        if(currentSong.paused){
            currentSong.play();
            play.src= "pause.svg";
        }
        else{
            currentSong.pause();
            play.src="play.svg";
        }
    })
    // Listen for timeupdate event
    currentSong.addEventListener("timeupdate",()=>{
        console.log(currentSong.currentTime, currentSong.duration);
        document.querySelector(".songTime").innerHTML= `${formatTime(currentSong.currentTime)} / ${
            formatTime(currentSong.duration)}`;
        //Move the circle bar
        document.querySelector(".circle").style.left= (currentSong.currentTime/ currentSong.duration)*100 + "%";

    })
    // Add an event listener to seek bar
    document.querySelector(".seekbar").addEventListener("click",e=>{
        let percent= (e.offsetX/e.target.getBoundingClientRect().width)*100;
        document.querySelector(".circle").style.left= percent + "%";
        currentSong.currentTime= (currentSong.duration)*percent/100;
    })

    // Add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click",()=>{
        document.querySelector(".left").style.left= "0";
    })

    // Add an event listener to close icon
    document.querySelector(".close").addEventListener("click",()=>{
        document.querySelector(".left").style.left= "-110%";
    })

    // Add an event listener to previous and next
    previous.addEventListener("click", ()=>{
        console.log("Previous is clicked");
        let index= songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if((index-1) >= 0){
            playMusic(songs[index - 1]);
        }
    })
    next.addEventListener("click", ()=>{
        // currentSong.pause();
        console.log("Next is clicked");
        
        let index= songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if (index !== -1 && index + 1 < songs.length) { // Check if next song exists
            playMusic(songs[index + 1]);
        };
    });
    // Add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change",(e)=>{
        console.log("Setting Volume to", e.target.value,"/ 100");
        currentSong.volume= parseInt(e.target.value)/100;
    })

    // Add an event listener to the music track
    document.querySelector(".volume >img").addEventListener("click",e=>{
        console.log(e.target);
        if(e.target.src.includes("volume.svg")){
            e.target.src= e.target.src.replace("volume.svg" ,"mute.svg");
            currentSong.volume= 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value=0;
        }
        else{
            e.target.src= e.target.src.replace("mute.svg" ,"volume.svg");
            currentSong.volume =.10;
            document.querySelector(".range").getElementsByTagName("input")[0].value=10;
        }
    })

}
main()

