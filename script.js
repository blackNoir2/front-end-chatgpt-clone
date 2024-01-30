
const APIKEY              = document.getElementById("API-KEY");
const buttons             = document.querySelector(".buttons");
const cancelPopupBtn      = document.querySelector("#cancel-btn");
const chatHistory         = document.querySelector(".previous-chat"); // Chat history container
const clearChatBtn        = document.querySelector("#clear-chat");
const clearChatPopup      = document.querySelector(".clear-chat-moodle");
const display             = document.getElementById('search-item');
const form                = document.querySelector('form');
const message             = document.getElementById("message");
const previousChat        = document.querySelector(".previous-chat");
const previousChatBtn     = document.querySelector(".previous-chat-btn");
const previousChatTitle   = document.querySelector(".previous-chat-title");
const proceedPopupButton  = document.querySelector("#proceed-btn");
const searchTextArea      = document.querySelector(".searchArea");
const showKey             = document.querySelector(".showKey");
const spinner             = document.querySelector(".spinner-medium");
const systemResponseTitle = document.querySelector(".system-response");


const API_URL             = 'https://api.openai.com/v1/chat/completions';
let conversation          = [];
let hideKey               = true;
let isPreviousChatVisible = true;

/*
 * Handles the submission of a search query by the user.
 * 
 * When invoked, this function retrieves the search query entered by the user from the input field,
 * adds the search query as a message to the conversation history so the user can view it as part of
 * their conversation history
 * 
 * @param {Event} event - The event object representing the form submission event.
 * @returns {void}
 */
function getSearchItem(event) {
    event.preventDefault();

    const searchInput = document.getElementById('search');
    const searchContent = searchInput.value;

    addCurrentMessageToConversation("user", searchContent)

    // clear the text after each submission
    searchInput.value = "";               

    const requestOptions = generateRequestOptions(APIKEY.value);
    toggleSpinner(true);

    getFetch(API_URL, requestOptions);     

}




/**
 * Generates request options object for making a POST request to an API endpoint.
 * 
 * This function constructs and returns an object containing the method, headers, 
 * and body for a POST request. The headers include the content type as JSON and 
 * an authorization token derived from the provided API key. The body of the request 
 * contains details such as the model to be used, the conversation messages, and 
 * the maximum number of tokens for the response.
 * 
 * @param {string} APIKEY - The API key used for authorization.
 * @returns {Object} - The request options object for making a POST request.
 */

function generateRequestOptions(APIKEY) {
    return {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${APIKEY}`
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo-1106",
            messages: conversation,
            max_tokens: 200
        })
    };
}




/**
 * Performs an asynchronous fetch request to the specified endpoint with the provided request options.
 * 
 * This function asynchronously initiates a fetch request using the specified endpoint 
 * and request options. By also utilizing the async syntax, it ensures proper handling
 * of asynchronous operations, particularly when called by other functions,
 * without this when called by other function it doesn't wait for data. 
 
 * @param {string} endPoint - The URL endpoint to send the fetch request to.
 * @param {Object} requestOptions - The options object containing method, headers, and body for the request.
 * @returns {Promise<void>} - A promise that resolves when the fetch request is completed.
 */
async function getFetch(endPoint, requestOptions) {
    fetch(endPoint, requestOptions)
        .then((response) => {
            if (!response.ok) {
                const error = new Error(response.statusText);

                toggleSpinner(false);
                showMessage("Something when wrong !!!", duration=5000, bgColorClass="red-bg");
                throw error;
            }
            return response.json();
        }).then(async (data) => {

            handleData(data);
            toggleSpinner(false);
        })
        .catch(error => {
            console.log('Error:', error);
            showMessage("Something when wrong with your API key - try entering a different one!", 
                          duration=5000, 
                          bgColorClass="red-bg");
            toggleSpinner(false);

        });
};




/**
 * Handles the data received from a fetch request.
 * 
 * This function takes the data received from a fetch request and extracts the
 * content of the message. It then adds this message to the conversation history
 * as a system message and updates the UI to display the message, 
 * 
 * @param {Object} data - The data received from the fetch request, typically in JSON format.
 * @returns {void}
 */
function handleData(data) {
    const botMessage = data.choices[0].message.content;
    addCurrentMessageToConversation("system", botMessage)
    updateUIMessage(botMessage);
}




/**
 * Adds a message to the conversation array.
 * 
 * This function takes the role type and content of a message and adds it to
 * the conversation array. Each message object in the conversation array contains
 * properties for the role type and content of the message.
 * 
 * @param {string} roleType - The role type of the message (e.g., "user", "system").
 * @param {string} contentType - The content of the message.
 * @returns {void}
 */
function addCurrentMessageToConversation(roleType, contentType) {
    conversation.push({ role: roleType, content: contentType });
}



/**
 * Updates the UI with the provided message.
 * 
 * This function displays the provided message in the UI
 * 
 * @param {string} message - The message to display in the UI.
 * @returns {void}
 */
function updateUIMessage(message) {

    if (message) {
        systemResponseTitle.style.display = "block";
        display.textContent = message;
        getChatHistory(conversation);

        window.scrollBy({
            top: 90,
            behavior: 'smooth'
        })
    } else {
        systemResponseTitle.style.display = "none";
    }
}




/**
 * Handles the click event on the "View Previous Chat" button.
 * 
 * @returns {void}
 */
function handlePreviousChatButtonClick() {


    // Toggle spinner to indicate loading
    toggleSpinner(true);

    // Delay adding event listener to ensure spinner visibility
    setTimeout(() => {
        
        previousChatBtn.addEventListener("click", handlePreviousChatBtnEvent);

        toggleSpinner(false);
    }, 2000);
}


// Event handler for previous chat button click
function handlePreviousChatBtnEvent(event) {

    event.preventDefault();

    // checks if there is any previous conversation before anything is handled
    if (!conversation || conversation.length <= 0) {
        showMessage("You don't have any previous chats to view");
        return;
    }

    togglePreviousChatVisibility();
    updatePreviousChatButton();
}





/**
 * Uses an event listener to handle the click event on the clear chat button.
 * When the clear chat button is clicked, the funcion shows a popup box
 * 
 * @function handleClearChatBtnClick
 * @returns {void}
 */
function handleClearChatBtnClick() {
    clearChatBtn.addEventListener("click", (e) => {
        
        e.preventDefault();
        const duration = 2000
        clearChatPopup.classList.add("show-popup");  // reveals a popup box
        toggleSpinner(true);

        setTimeout(() => {
            toggleSpinner(false);
        }, duration);

    })
}


// Handles the popup section


/**
 * Uses an event listener on the cancel button to listen for a click.
 * When the cancel button is clicked it closes the popup 
 */
function handleCancelBtn() {
    cancelPopupBtn.addEventListener("click", (e) => {
        e.preventDefault();
        closePopupBox();
    })
}



/**
 * Uses an event listener on the procced button to listen for a click.
 * When the proceed button is clicked it handles it 
 */
function handleProceedBtn() {
    proceedPopupButton.addEventListener("click", (e) => {
        e.preventDefault();
       
        clearEntireConversation();
        getChatHistory(conversation)
     
        closePopupBox();
        hidePreviousChat();

        isPreviousChatVisible = true;
        updatePreviousChatButton();

        toggleButtons(false);
        window.scrollTo({ top: 0, behavior: 'smooth' }) // scroll to the top of the page

        showMessage("Your chat history has been cleared!!");
        toggleSpinner(true);

        setTimeout(() => {
            toggleSpinner(false);
        }, 3000)
    })
}


// The closePopupBox function is called twiced and so it is placed in a function
function closePopupBox() {
    clearChatPopup.classList.remove("show-popup");
}




/**
 * Toggle the visibility of an API key input field.
 * When the button is clicked, the API key input field is toggled between password and text types,
 * and the button text is updated accordingly.
 * If no API key is found in the input field, a message indicating the absence of the key is displayed.
 * 
 * @returns {void}
 */
function hideAPIKeyWhenClicked() {
  
    showKey.addEventListener("click", (e) => {
        e.preventDefault();
        const duration = 5000;
        let msg;

        if (!APIKEY || APIKEY.value === "") {
            showMessage("No API Key found!!", duration, bgColorClass="red-bg");
            return;
        }

       function hideAPIKey() {
            APIKEY.type         = "password";
            showKey.textContent = "Show key";
            msg = "Key successfully hidden";
       }

       function revealAPIKey() {
            APIKEY.type         =  "text";
            showKey.textContent = "Hide key";
            msg = "Key successfully revealed";
           
       }
       
       hideKey ? hideAPIKey() : revealAPIKey();
       showMessage(msg,  duration);
       hideKey = !hideKey;
        

    })
}


function clearEntireConversation() {
    conversation = [];
}




/**
 * Clears the entire history of any conversation ever made
 * @param {Array} conversation 
 */
function getChatHistory(conversation) {

    // Clear previous messages before adding a new one
    chatHistory.innerHTML = '';
    conversation.forEach(chat => {
        createHistoryElement(chat.role, chat.content)
    }

    )
    
};


/**
 * Creates a new chat history element and appends it to the chat history container.
 * 
 * @param {string} role - The role of the message (e.g., "user" or "system").
 * @param {string} message - The content of the message.
 */
function createHistoryElement(role, message) {

    const previousMessage = document.createElement("div");        // Create a new div for the message
    const pRoleTag = document.createElement("p");                 // Create a paragraph element for the role
    const pMessageTag = document.createElement("p");              // Create a paragraph element for the message

    // Set class names for styling
    pRoleTag.className = "role";
    pMessageTag.className = "content";
    previousMessage.className = "previous-msg";

    // Set text content for role and message
    pRoleTag.textContent = `Role: ${role}`;
    pMessageTag.textContent = message;

    // additional styling for system messages based on conversation length
    if (role === "system" && conversation.length % 2 === 0) {
        previousMessage.classList.add("system-right");
        previousMessage.classList.add("add-line-break")
    }

    // Append role and message paragraphs to the message container
    previousMessage.appendChild(pRoleTag);
    previousMessage.appendChild(pMessageTag);

    // Append the message container to the chat history
    chatHistory.appendChild(previousMessage);


}



// Toggle elements
function toggleSpinner(showSpinner) {
    spinner.style.display = showSpinner ? "block" : "none";
}

function toggleButtons(showButtons) {
    buttons.style.display = showButtons ? "flex" : "none";

}

function togglePreviousChatVisibility() {
    if (isPreviousChatVisible) {
        showPreviousChat();
        toggleButtons(true);
    } else {
        hidePreviousChat();
        toggleButtons(false);
    }
    isPreviousChatVisible = !isPreviousChatVisible;
}





/**
 * Display the previous chat messages 
 * @returns {void}
 */
function showPreviousChat() {
    previousChat.style.display      = "block";
    previousChatTitle.style.display = "block";
    window.scrollTo(0, document.body.scrollHeight);
}


/**
 * Hides the previous chat messages 
 * @returns {void}
 */
function hidePreviousChat() {
    previousChat.style.display = "none";
    previousChatTitle.style.display = "none";

}


/**
 * Updates the button text depending on whether the chat history is open or closed
 * @returns {void}
 */
function updatePreviousChatButton() {
    previousChatBtn.textContent = isPreviousChatVisible ? "View chat history" : "Close";

}


/**
 * Display a message to the user for a specified duration with an optional background color.
 * 
 * @param {string} messageToDisplay - The message to be displayed.
 * @param {number} [duration=5000]  - The duration in milliseconds for which the message will be shown. 
 *                                    Default is 5000 milliseconds (5 seconds).
 * @param {string} [bgColorClass="green-bg"] - The CSS class defining the background color of the message.
 *                                              Default is "green-bg". The classes must be defined in the CSS stylesheet
 * @returns {void}
 */
function showMessage(messageToDisplay, duration = 5000, bgColorClass="green-bg") {

    message.classList.remove("green-bg", "red-bg");
    message.textContent = messageToDisplay;
    message.style.display = "block";

    message.classList.add(bgColorClass);
    
    setTimeout(() => {
        message.style.display = "none";
    }, duration)

}

handlePreviousChatButtonClick();
handleClearChatBtnClick();
handleCancelBtn();
handleProceedBtn();
hideAPIKeyWhenClicked();
form.addEventListener('submit', getSearchItem);
