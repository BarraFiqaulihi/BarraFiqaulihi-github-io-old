class Mathf {
    static clamp(number, min, max) {
        if(number < min) return min;
        if(number > max) return max;
        return number;
    }

    static lerp(a, b, t) {
        t = this.clamp(t, 0, 1);
        return a * (1- t) + b * t;
    }

    // Kalau min lebih besar dari max gimana?
    static random(min, max) {
        return min + Math.random() * (max - min);
    }
}

class Sound {
    name;
    audio;

    constructor(audio) {
        this.audio = audio;
        this.name = decodeURIComponent(this.audio.dataset["name"]);
    }
}

class AudioManager {
    static link;
    static sounds = [];
    static duplicatedSounds = [];

    static init() {
        this.sounds = [];
        this.duplicatedSounds = [];
        document.querySelectorAll("audio").forEach(e => {
            this.sounds.push(new Sound(e));
        });
        this.#addEventListeners();
    }

    static #addEventListeners() {
        for(let key in this.sounds) {
            if(this.sounds[key].name === "Tarrey Town") this.sounds[key].audio.onended = () => {
                this.playFromBeginning("Tarrey Town - Married");
            }
        }
    }

    static play(audioName) {
        for(let i = 0; i < this.sounds.length; i++) {
            if(this.sounds[i].name === audioName) {
                this.sounds[i].audio.play();
                return;
            }
        }
        throw new Error("Audio not found");
    }

    static playDuplicate(audioName) {
        for(let i = 0; i < this.sounds.length; i++) {
            if(this.sounds[i].name === audioName) {
                console.log(this.sounds[i].name.split("-").pop());
                let key = this.duplicatedSounds.length;
                this.duplicatedSounds[key] = new Sound(this.sounds[i].audio.cloneNode(false));
                this.duplicatedSounds[key].audio.loop = false;
                this.duplicatedSounds[key].audio.addEventListener("ended", () => delete this.duplicatedSounds[key]);
                this.duplicatedSounds[key].audio.play();
                return;
            }
        }
        throw new Error("Audio not found");
    }

    static playFromBeginning(audioName) {
        for(let i = 0; i < this.sounds.length; i++) {
            if(this.sounds[i].name === audioName) {
                this.sounds[i].audio.currentTime = 0;
                this.sounds[i].audio.play();
                return;
            }
        }
        throw new Error("Audio not found");
    }

    static playFrom(audioName, second) {
        for(let i = 0; i < this.sounds.length; i++) {
            if(this.sounds[i].name === audioName) {
                this.sounds[i].audio.currentTime = second;
                this.sounds[i].audio.play();
                return;
            }
        }
    }

    static pause(audioName) {
        for(let i = 0; i < this.sounds.length; i++) {
            if(this.sounds[i].name === audioName) {
                this.sounds[i].audio.pause();
                return;
            }
        }
        throw new Error("Audio not found");
    }

    static stop(audioName) {
        for(let i = 0; i < this.sounds.length; i++) {
            if(this.sounds[i].name === audioName) {
                this.sounds[i].audio.pause();
                this.sounds[i].audio.currentTime = 0;
                return
            }
        }
        throw new Error("Audio not found");
    }
}

class LongPolling {
    client;
    constructor() {
        this.client = new XMLHttpRequest();
    }
}

class WaitScreen {
    static container;

    static enable() {
        if(this.container.classList.contains("d-none")) this.container.classList.remove("d-none");
    }

    static disable() {
        if(!this.container.classList.contains("d-none")) this.container.classList.add("d-none");
    }
}

class ParticleSystem {
    static bubble = [];

    static init() {
        this.#getContainers();
        this.#cleanContainers();
        this.#addParticles();
    }

    static #getContainers() {
        this.bubble = [];
        let bubbleContainers = document.querySelectorAll(".particle-effect-bubble");
        bubbleContainers.forEach(e => this.bubble.push(e));
    }

    static #cleanContainers() {
        this.bubble.forEach(e => e.innerHTML = "");
    }

    static #addParticles() {
        this.bubble.forEach(e => {
            e.position = "relative";
            let width = window.getComputedStyle(e).width;
            console.log(width);
            let linecount = (parseInt(width) / 50) * 10;
            console.log(linecount);
            for(let i = 0; i < linecount ; i++) {
                let particle = document.createElement("span");
                particle.classList.add("particle");
                particle.style.top = Mathf.random(1, 10) + "rem";
                particle.style.left = Mathf.random(0, 100) + "%";
                let diameter = Mathf.random(2, 8);
                particle.style.width = diameter + "px";
                particle.style.height = diameter + "px";
                particle.style.boxShadow = `0 0 ${diameter / 2}px ${diameter / 2}px rgba(236, 255, 0, .5)`;
                particle.style.animationDelay = Mathf.random(0, 90) / 10 + "s";
                e.appendChild(particle);
            }
        });
    }
}

class Object {
    container;
    name;
    #isEnabled;

    set isEnabled(bool) {
        if(bool) this.enable();
        else this.disable();
    }

    get isEnabled() {
        return this.#isEnabled;
    }

    constructor (container) {
        this.container = container;
        this.name = "page";
        if(!container.classList.contains("d-none")) this.#isEnabled = true;
        else this.#isEnabled = false;
        // if(this.awake) this.awake();
    }

    enable (data) {
        if(!this.#isEnabled) {
            this.setVisibility(true);
            console.log(this.name);
            if(this.start) this.start(data);
        }
    }

    disable () {
        if(this.#isEnabled) {
            if(this.onDisable) this.onDisable();
            this.setVisibility(false);
        }
    }

    setVisibility (isVisible) {
        this.#isEnabled = isVisible;
        if(isVisible) this.container.classList.remove("d-none");
        else this.container.classList.add("d-none");
    }
}

class Page extends Object{
    constructor(container) {
        super(container)
    }
}

class LoginPage extends Page {
    link;
    usernameInput;
    passwordInput;
    usernameClearBtn;
    passwordClearBtn;
    signInBtn;
    joinRoomAnchor;

    onSignInBtnClicked = [];
    onSignIn = [];
    onJoinRoomAnchorClicked = [];

    constructor(link) {
        super(document.querySelector("#login-page"));
        this.name = "loginPage";
        this.link = link;
        this.#setElements();
        console.log("focus");
    }

    start() {
        this.usernameInput.focus();
    }

    #setElements() {
        this.usernameInput = this.container.querySelector("#username-input");
        this.passwordInput = this.container.querySelector("#password-input");
        this.usernameClearBtn = this.usernameInput.parentNode.querySelector(".clear-btn");
        this.passwordClearBtn = this.passwordInput.parentNode.querySelector(".clear-btn");
        this.signInBtn = this.container.querySelector("#sign-in-btn");
        this.joinRoomAnchor = this.container.querySelector("#join-room-anchor");

        this.#addEventListeners();
    }

    #addEventListeners() {
        this.usernameInput.addEventListener("keyup", e => {
            if(e.key !== "Enter") return;
            if(!this.usernameInput.value) return this.#warnInput(this.usernameInput);
            this.passwordInput.focus();
        });
        this.passwordInput.addEventListener("keyup", e => { if(e.key === "Enter") this.#login(); });
        this.usernameInput.addEventListener("input", () => this.#unWarnInput(this.usernameInput));
        this.passwordInput.addEventListener("input", () => this.#unWarnInput(this.passwordInput));
        this.usernameInput.addEventListener("focusout", () => this.#unWarnInput(this.usernameInput));
        this.passwordInput.addEventListener("focusout", () => this.#unWarnInput(this.passwordInput));
        this.usernameClearBtn.addEventListener("click", () => this.#clearInput(this.usernameInput));
        this.passwordClearBtn.addEventListener("click", () => this.#clearInput(this.passwordInput));
        this.signInBtn.addEventListener("click", () => this.#login());
        this.joinRoomAnchor.addEventListener("click", () => {
            if(this.onJoinRoomAnchorClicked.length > 0) this.onJoinRoomAnchorClicked.forEach(e => e());
        });
    }

    #login() {
        if(!this.usernameInput.value) return this.#warnInput(this.usernameInput);
        if(!this.passwordInput.value) return this.#warnInput(this.passwordInput);
        let client = new XMLHttpRequest();
        client.open("POST", this.link + "/arexam/login");
        client.onreadystatechange = () => {
            if(client.readyState === 4 && client.status === 200) {
                console.log(client.responseText);
                let response = JSON.parse(client.responseText);
                if(!response.ok) return;
                if(this.onSignIn.length > 0) this.onSignIn.forEach(e => e(response.result));
            }
        };
        client.send(JSON.stringify({
            username: this.usernameInput.value,
            password: this.passwordInput.value
        }));
    }

    #clearInput(input) {
        input.value = "";
        input.focus();
    }

    #warnInput(input) {
        input.classList.add("border-danger");
        input.classList.add("border-3");
        input.focus();
    }

    #unWarnInput(input) {
        input.classList.remove("border-danger");
        input.classList.remove("border-3");
    }
}

class MainMenuPage extends Page{
    userData;
    startBtn;
    exitBtn;

    onStartBtnClicked = [];

    constructor() {
        super(document.querySelector("#main-menu-page"));
        this.name = "mainMenuPage";
        this.#setElements();
        this.#addEventListeners();
    }

    #setElements() {
        this.startBtn = this.container.querySelector("#main-menu-start-btn");
        this.exitBtn = this.container.querySelector("#main-menu-exit-btn");
    }

    #addEventListeners() {
        this.startBtn.addEventListener("click", () => {
            if(this.onStartBtnClicked.length > 0) this.onStartBtnClicked.forEach(e => e(this.userData));
        });
        this.exitBtn.addEventListener("click", () => window.location.reload(true));
    }

    start(e) {
        if((e && e.from.name === "loginPage")) {
            // setTimeout(() => AudioManager.playFromBeginning("Tarrey Town"), 200);
            setTimeout(() => AudioManager.playFromBeginning("Befriending Spirits"), 200);
            // setTimeout(() => AudioManager.playFromBeginning("RA3 March"), 200);
            this.userData = e.data;
        }
        document.body.style.overflow = "hidden";
        ParticleSystem.init();
    }

    onDisable() {
        document.body.style.overflow = null;
    }
}

class JoinRoomPage extends Page {
    link;
    nameInput;
    roomInput;
    roomClearBtn;
    nameClearBtn;
    joinBtn;
    signInAnchor;

    onJoinRoom = [];
    onSignInAnchorClicked = [];

    constructor(link) {
        super(document.querySelector("#join-room-page"));
        this.name = "joinRoomPage";
        this.link = link;

        this.setElements();
    }

    start(e) {
        // code ...
    }

    setElements() {
        this.nameInput = this.container.querySelector("#name-input");
        this.roomInput = this.container.querySelector("#room-input");
        this.nameClearBtn = this.nameInput.parentNode.querySelector(".clear-btn");
        this.roomClearBtn = this.roomInput.parentNode.querySelector(".clear-btn");
        this.joinBtn = this.container.querySelector("#join-btn");
        this.signInAnchor = this.container.querySelector("#sign-in-anchor");

        this.addEventListeners();
    }

    addEventListeners() {
        this.nameInput.addEventListener("keyup", (e) => {
            if(e.key !== "Enter") return;
            if(!this.nameInput.value) return this.#warnInput(this.nameInput);
            this.roomInput.focus();
        });
        this.roomInput.addEventListener("keyup", (e) => { if(e.key === "Enter") this.joinRoom(); });
        this.nameInput.addEventListener("input", () => this.#unWarnInput(this.nameInput));
        this.roomInput.addEventListener("input", () => this.#unWarnInput(this.nameInput));
        this.nameInput.addEventListener("focusout", () => this.#unWarnInput(this.nameInput));
        this.roomInput.addEventListener("focusout", () => this.#unWarnInput(this.roomInput));
        this.nameClearBtn.addEventListener("click", () => this.#clearInput(this.nameInput));
        this.roomClearBtn.addEventListener("click", () => this.#clearInput(this.roomInput));
        this.joinBtn.addEventListener("click", () => this.joinRoom());
        this.signInAnchor.addEventListener("click", () => {
            if(this.onSignInAnchorClicked.length > 0) this.onSignInAnchorClicked.forEach(e => e());
        });
    }

    joinRoom(){
        if(!this.nameInput.value) return this.#warnInput(this.nameInput);
        if(!this.roomInput.value) return this.#warnInput(this.roomInput);

        let roomId = this.roomInput.value;
        let client = new XMLHttpRequest();
        client.open("GET", this.link + "/arexam/joinRoom/" + encodeURIComponent(roomId));
        client.onreadystatechange = () => {
            if(client.readyState !== 4) return;
            WaitScreen.disable();
            if(!client.status === 200) return alert("Connection to server failed. Please try again");
            let data = JSON.parse(client.responseText);
            if(!data) return this.#roomNotFound();
            this.onJoinRoom.forEach(e => e(data));
        };
        client.send();
        WaitScreen.enable();
    }

    #warnInput(input) {
        input.classList.add("border-danger");
        input.classList.add("border-3");
        input.focus();
    }

    #unWarnInput(input) {
        input.classList.remove("border-danger")
        input.classList.remove("border-3")
    }

    #clearInput(input) {
        input.value = "";
        input.focus();
    }

    #roomNotFound() {
        alert("Room not found");
    }
}

class DashboardPage extends Page {
    link;
    userData;
    roomData;
    roomList;
    roomSelected;
    backBtn;

    onPlayBtnclicked = [];
    onBackBtnClicked = [];

    constructor(link) {
        super(document.querySelector("#dashboard-page"));
        this.name = "dashboardPage";
        this.link = link;
        this.#setElements();
    }

    start(e) {
        if(! (e && e.from.name === "mainMenuPage") ) return;
        this.userData = e.data;
        console.log(this.userData);
        this.#getRooms();
    }

    #setElements() {
        this.roomList = this.container.querySelector("#room-list");
        this.backBtn = this.container.querySelector("#dashboard-page-back-btn");
        this.#addEventListeners();
    }

    #addEventListeners() {
        this.backBtn.addEventListener("click", () => {
            if(this.onBackBtnClicked.length > 0) this.onBackBtnClicked.forEach(e => e());
        });
    }

    #getRooms() {
        let client = new XMLHttpRequest();
        console.log(this.link + "/arexam/getMyRooms/" + this.userData.id);
        client.open("GET", this.link + "/arexam/getMyRooms/" + this.userData.id);
        client.onreadystatechange = () => {
            if(client.readyState === 4 && client.status === 200) {
                this.roomData = JSON.parse(client.responseText);
                this.#setRoomList();
            }
        };
        client.send()
    }

    #setRoomList() {
        this.roomList.innerHTML = "";
        this.roomData.forEach(e => {
            for(let i = 0; i < 10; i++){
                this.roomList.innerHTML += this.#createRoomListItem(e);
            }
        });
        this.#addRoomListListeners();
    }

    #addRoomListListeners() {
        for(let i = 1; i < this.roomList.childNodes.length; i+=2) {
            this.roomList.childNodes[i].onclick = () => {
                if(this.onPlayBtnclicked.length > 0) this.onPlayBtnclicked.forEach(e => e(JSON.parse(decodeURIComponent(this.roomList.childNodes[i].dataset["roomdata"]))));
                // console.log(JSON.parse(decodeURIComponent(this.roomList.childNodes[i].dataset["roomdata"])));
            };
        }
    }

    #createRoomListItem(itemData) {
        return `
            <li
                class="room-list-item list-group-item d-flex justify-content-between align-items-start"
                data-roomdata="${encodeURIComponent(JSON.stringify(itemData))}"
            >
                <div class="ms-2 me-auto">
                    <div class="fw-bold">${itemData.title}</div>
                    ${itemData.description}
                </div>
                <span class="badge bg-primary rounded-pill">${itemData.id}</span>
            </li>
        `;
    }

    // #createRoomListItem(itemData) {
    //     let listItem, listItemClasses = [
    //         document.createElement("li"),
    //         ["list-group-item", "d-flex", "justify-content-between", "align-items-start"]
    //     ]
    //     listItemClasses.forEach(e => listItem.classList.add(e));

    //     let titleContainer, titleContainerClasses = [
    //         document.createElement("div"),
    //         ["ms-2", "me-auto"]
    //     ]
    //     titleContainerClasses.forEach(e => titleContainer.classList.add(e));

    //     let title, titleClasses = [
    //         document.createElement("div"),
    //         ["fw-bold"]
    //     ]
    //     titleClasses.forEach(e => title.classList.add(e));

    //     let badge, badgeClasses = [
    //         document.createElement("span"),
    //         ["badge", "bg-primary", "rounded-pill"]
    //     ]
    //     badgeClasses.forEach(e => badge.classList.add(e));

    //     titleContainer.innerText = itemData.description;
    //     title.innerText = itemData.title;
    //     badge.innerText = itemData.id;

    //     titleContainer.appendChild(title);
    //     listItem.appendChild(titleContainer);
    //     listItem.appendChild(badge);

    //     return listItem;
    // }
}

class RoomPage extends Page {
    roomData;
    backBtn;
    titleText;
    descriptionText;
    dateCreatedText;
    slideCountText;
    startBtn;

    onBackBtnClicked = [];
    onStartBtnClicked = [];

    constructor() {
        super(document.querySelector("#room-page"));
        this.name = "roomPage";
        this.setElements();
    }

    setElements() {
        this.backBtn = this.container.querySelector("#room-page-back-btn");
        this.titleText = this.container.querySelector("#room-page-title");
        this.descriptionText = this.container.querySelector("#room-page-description");
        this.dateCreatedText = this.container.querySelector("#room-page-date-created")
        this.slideCountText = this.container.querySelector("#room-page-slide-count");
        this.startBtn = this.container.querySelector("#room-page-start-btn");
        this.#addEventListeners();
    }

    #addEventListeners() {
        this.backBtn.addEventListener("click", () => {
            if(this.onBackBtnClicked.length > 0) this.onBackBtnClicked.forEach(e => e());
        });
        this.startBtn.addEventListener("click", () => {
            if(this.onStartBtnClicked.length > 0) this.onStartBtnClicked.forEach(e => e(this.roomData));
        });
    }

    start(e) {
        console.log(e);
        if(e && (e.from.name === "joinRoomPage" || e.from.name === "dashboardPage")) {
            this.#setData(e.data);
        }
    }

    #setData(data) {
        this.roomData = data;
        this.titleText.innerText = data.title;
        this.descriptionText.innerText = data.description;
        this.dateCreatedText.innerText = "Created at: " + new Date(data.date_created * 1000).toLocaleDateString("en-US", {day: "2-digit", month: "long", year: "numeric"});
        this.slideCountText.innerText = "Slide count: " + data.slides.length;

    }
}

class Slide extends Object{
    slideData;

    nextSlideBtn;
    onNextSlideBtnClicked = [];

    constructor(container) {
        super(container);
        this.name = "slide";

        this.#setElements();
    }

    #setElements() {
        this.nextSlideBtn = this.container.querySelector(".next-slide-btn");
        this.#addEventListeners();
    }

    #addEventListeners() {
        this.nextSlideBtn.onclick = () => {
            if(this.onNextSlideBtnClicked.length > 0) this.onNextSlideBtnClicked.forEach(e => e());
        };
    }
}

class ScoredSlide extends Slide {
    titleText;
    questionText;

    constructor(container) {
        super(container);
        this.name = "scoredSlide";
        this.#setElements();
    }

    #setElements() {
        this.titleText = this.container.querySelector(".slide-title");
        this.questionText = this.container.querySelector(".slide-question");
    }
}

class PGSlide extends ScoredSlide {
    choices;

    constructor() {
        super(document.querySelector("#pg-slide"));
        this.name = "pgSlide";
    }

    start(e) {
        this.#setData(e);
    }

    #setData(data) {
        this.slideData = data;
        this.#setElementsData();
    }

    #setElementsData() {
        this.titleText.innerText = this.slideData.title;
        this.questionText.innerText = this.slideData.question;
    }
}

class EssaySlide extends ScoredSlide {
    constructor() {
        super(document.querySelector("#essay-slide"));
        this.name = "essaySlide";
    }

    start(e) {
        this.#setData(e);
    }

    #setData(data) {
        this.slideData = data;
        this.#setElementsData();
    }

    #setElementsData() {
        this.titleText.innerText = this.slideData.title;
        this.questionText.innerText = this.slideData.question;
    }
}

class SlideManager {
    roomData;
    slides = {};
    currentSlideIndex;

    constructor(data) {
        this.#setData(data);
        this.#initSlides();
    }

    #setData(data) {
        this.roomData = data;
    }

    #initSlides() {
        this.slides.pgSlide = new PGSlide();
        this.slides.essaySlide = new EssaySlide();

        this.#addEventHandlers();
        this.#switchSlide(0);
    }

    #addEventHandlers() {
        for(let key in this.slides) {
            this.slides[key].onNextSlideBtnClicked.push(() => this.nextSlide());
        }
    }

    nextSlide() {
        if(this.currentSlideIndex !== this.roomData.slides.length - 1) {
            this.#switchSlide(this.currentSlideIndex + 1);
        } else this.#finish();
    }

    #switchSlide(slideIndex) {
        if(slideIndex !== this.currentSlideIndex) {
            this.currentSlideIndex = slideIndex;
            for(let key in this.slides) {
                this.slides[key].disable();
            }
            switch (this.roomData.slides[this.currentSlideIndex].type) {
                case "PG":
                    this.slides.pgSlide.enable(this.roomData.slides[this.currentSlideIndex]);
                    break;
                case "Essay":
                    this.slides.essaySlide.enable(this.roomData.slides[this.currentSlideIndex]);
                    break;
                default:
                    break;
            }
        }
    }

    #finish() {
        // alert("No slide remains");
        console.log("No slide remains");
    }
}

class ExamPage extends Page {
    roomData;
    slideManager;
    resultPageBtn;

    onResultPageBtnClicked = [];

    constructor() {
        super(document.querySelector("#exam-page"));
        this.name = "examPage";
        this.#setElements();
    }

    #setElements() {
        this.resultPageBtn = this.container.querySelector("#result-page-nya-belum");
        this.#addEventListeners();
    }

    #addEventListeners() {
        this.resultPageBtn.addEventListener("click", () => {
            if(this.onResultPageBtnClicked.length > 0) this.onResultPageBtnClicked.forEach(e => e());
        });
    }

    start(e) {
        if(e && e.from.name === "roomPage") {
            console.log("Start");
            this.#setData(e.data);
            this.slideManager = new SlideManager(e.data);
        }
    }

    #setData(data) {
        this.roomData = data;
    }
}

class ResultPage extends Page {
    constructor() {
        super(document.querySelector("#result-page"));
        this.name = "resultPage";
    }
}

class PageManager {
    link;
    pages = {};
    previousPage;
    currentPage;

    constructor(link){
        this.link = link;
        this.setPages();
    }

    // static getPageByName(pageName) {
    //     for(let key in this.pages) {
    //         if(pageName === key) return this.pages[key];
    //     }
    //     throw new Error("Page not found");
    // }

    setPages() {
        this.pages.loginPage = new LoginPage(this.link);
        this.pages.mainMenuPage = new MainMenuPage();
        this.pages.joinRoomPage = new JoinRoomPage(this.link);
        this.pages.dashboardPage = new DashboardPage(this.link);
        this.pages.roomPage = new RoomPage();
        this.pages.examPage = new ExamPage();
        this.pages.resultPage = new ResultPage();

        this.#setStartingPage();

        this.addEventHandlers();
    }

    #setStartingPage() {
        let startingPage = this.pages.loginPage;

        this.switchPage(startingPage, null);
    }

    addEventHandlers() {
        this.pages.loginPage.onSignIn.push((e) => this.switchPage(this.pages.mainMenuPage, e));
        this.pages.loginPage.onJoinRoomAnchorClicked.push(() => this.switchPage(this.pages.joinRoomPage, null));
        this.pages.mainMenuPage.onStartBtnClicked.push((e) => this.switchPage(this.pages.dashboardPage, e));
        this.pages.dashboardPage.onPlayBtnclicked.push((e) => this.switchPage(this.pages.roomPage, e));
        this.pages.dashboardPage.onBackBtnClicked.push(() => this.switchPage(this.pages.mainMenuPage, null));
        this.pages.joinRoomPage.onSignInAnchorClicked.push(() => this.switchPage(this.pages.loginPage, null));
        this.pages.joinRoomPage.onJoinRoom.push((e) => this.switchPage(this.pages.roomPage, e));
        this.pages.roomPage.onBackBtnClicked.push(() => this.switchPage(this.previousPage, null));
        this.pages.roomPage.onStartBtnClicked.push((e) => this.switchPage(this.pages.examPage, e));
        this.pages.examPage.onResultPageBtnClicked.push(() => this.switchPage(this.pages.mainMenuPage, null));
    }

    switchPage(page, data) {
        if(data) {
            data = {
                from: this.currentPage,
                data: data
            };
        }
        if(page !== this.currentPage) {
            for(let key in this.pages) {
                if(this.pages[key] !== page) this.pages[key].disable();
                else {
                    this.previousPage = this.currentPage;
                    this.currentPage = this.pages[key];
                    console.log(this.currentPage);
                    this.pages[key].enable(data);
                }
            }
        } else throw new Error("The target page is the current page");
    }
}

class ExamApp {
    link;
    pageManager;

    constructor(link) {
        this.pageManager = new PageManager(link);
        WaitScreen.container = document.querySelector("#wait-screen");
        AudioManager.init(link + "/audio");
        ParticleSystem.init();
        window.addEventListener("keyup", (e) => {
            console.log(e.key);
            // switch (e.key) {
            //     case "p": AudioManager.play("RA3 March"); break;
            //     case "o": AudioManager.pause("RA3 March"); break;
            //     case "i": AudioManager.stop("RA3 March"); break;
            //     case "u": AudioManager.playFromBeginning("RA3 March"); break;
            //     case "y": AudioManager.playDuplicate("RA3 March"); break;
            //     case "0": AudioManager.play("Surprise"); break;
            //     case "9": AudioManager.pause("Surprise"); break;
            //     case "8": AudioManager.stop("Surprise"); break;
            //     case "7": AudioManager.playFromBeginning("Surprise"); break;
            //     case "6": AudioManager.playDuplicate("Surprise"); break;
            //     default: break;
            // }
        });

        Promise.all([
            document.fonts.load('1em title-font')
        ]).then( () => {
            console.log("Font Loaded");
        } );
    }
}










// --------------- SCRIPT ---------------
var welcomeAlmufasiLogo = document.querySelector("#welcome-almufasi-logo");
setTimeout(() => {
    welcomeAlmufasiLogo.classList.add("start")
}, 1000);

var baseurl = "https://yuurei.000webhostapp.com";

var app = new ExamApp(baseurl);















// var joinBtn = document.querySelector("#join-btn");
// var clearBtn = document.querySelector("#clear-btn");
// var input = document.querySelector("#room-input");

// var baseurl = "http://localhost/barrafiqaulihi/public";

// joinBtn.addEventListener("click", (e) => joinRoom());
// input.addEventListener("keyup", (e) => {
//     if(e.code === "Enter") joinRoom();
// });
// input.addEventListener("input", (e) => {
//     input.classList.remove("border-danger");
//     input.classList.remove("border-3");
// });
// input.addEventListener("focusout", (e) => {
//     input.classList.remove("border-danger");
//     input.classList.remove("border-3");
// });
// clearBtn.addEventListener("click", (e) => {
//     input.value = "";
//     input.focus();
// });

// function joinRoom(){
//     if(input.value) location.href = baseurl + "/arexam/joinRoom/" + encodeURIComponent(input.value);
//     else{
//         input.classList.add("border-danger");
//         input.classList.add("border-3");
//         input.focus();
//     }
// }