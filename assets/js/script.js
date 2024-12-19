const baseUrl = "YOUR_API_URL_HERE"; // Base URL for the API
const version = "0.6.5a"
const registerForm = document.getElementById('registerForm');
const loginForm = document.getElementById('loginForm');
const postForm = document.getElementById('postForm');
const postSection = document.getElementById('postSection');
const messagesDiv = document.getElementById('postlist');
const postTxtInput = document.getElementById('postinput');
const postBtn = document.getElementsByClassName('postbutton')[0];
const profileDisplay = document.getElementById('profileDisplay');
const profileUsername = document.getElementById('profileUsername');
const profileBio = document.getElementById('profileBio');
const profilePic = document.getElementById('profilePic');
const editProfileBtn = document.getElementById('editProfileBtn');
const saveProfileBtn = document.getElementById('saveProfileBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
let currentUserId = 0; // Corrected variable name


function openTab(tabName) {
    var i;
    var x = document.getElementsByClassName("tab");
    for (i = 0; i < x.length; i++) {
    x[i].style.display = "none";
    }
    document.getElementById(tabName).style.display = "block";
    }




// Register new user
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('regUsername').value;
    const password = document.getElementById('regPassword').value;
    const email = document.getElementById('regEmail').value;

    const response = await fetch(`${baseUrl}/api/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password, email })
    });

    const data = await response.json();

    if (response.ok) {
        alert('Registration successful!');
    } else {
        alert(`Registration failed: ${data.message}`);
    }
});


// Login user
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    const response = await fetch(`${baseUrl}/api/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    });

    if (response.ok) {
        const data = await response.json();
        currentUserId = data.userId; // Store the user ID
        localStorage.setItem("loginToken", data.token); // Store the user ID
        const loggedas = document.getElementById('currentuser');
        loggedas.innerHTML = data.nameofuser;
      postTxtInput.placeholder = "Write your post..."; 
      postTxtInput.disabled = false; 
      postBtn.disabled = false;
        alert('Login successful!');
        loadMessages();
    } else {
      postTxtInput.placeholder = "You must be signed in to write a post."; 
      postTxtInput.disabled = true; 
      postBtn.disabled = true;
        alert('Login failed!');
        loadMessages();
    }
});


postForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevent the default form submission

    const token = localStorage.getItem('loginToken');
    const response = await fetch(`${baseUrl}/api/verifyToken`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token
        },
        body: JSON.stringify({ userId: currentUserId, token })
    });

    if (response.ok) {
        const data = await response.json();
        if (data.success) {
            const message = document.getElementById('postinput').value;
            const timestamp = new Date().toISOString();
            const postResponse = await fetch(`${baseUrl}/api/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
                body: JSON.stringify({ userId: currentUserId, message, timestamp })
            });


            if (postResponse.ok) {
                document.getElementById('postinput').value = ''; // Clear the message input
                loadMessages(); // Reload messages after posting
            } else {
                alert('Failed to post message!');
            }
        } else {
            alert('Invalid user or token!');
        }
    } else {
        alert('Failed to verify token!');
    }
});






async function loadMessages() {
    const token = localStorage.getItem('loginToken');
    const messagesDiv = document.getElementById('postlist');

    try {
        const response = await fetch(`${baseUrl}/api/messages`);
        if (!response.ok) {
            throw new Error('Failed to fetch messages');
        }
        const data = await response.json();

        if (!data.chat || data.chat.length === 0) {
            messagesDiv.innerHTML = `<div class="post"><p>There are currently no posts</p></div>`;
        } else {
            messagesDiv.innerHTML = data.chat.map(msg => `        
                <div class="post" id="message-${msg.id}">
                    <p><strong class="username" data-user-id="${msg.userId}">${msg.username}:</strong> ${msg.message}</p>
                    ${(msg.userId === currentUserId && token === localStorage.getItem('loginToken')) ? `
                        <div class="button-container">
                            <button class="editBtn" onclick="showEditForm(${msg.id}, '${msg.message}')">Edit</button>
                            <button class="delBtn" onclick="deleteMessage(${msg.userId}, ${msg.id})">Delete</button>
                        </div>
                        <div class="edit-form" id="edit-form-${msg.id}" style="display: none;">
                            <input type="text" id="edit-input-${msg.id}" value="${msg.message}">
                            <button onclick="updateMessage(${msg.userId}, ${msg.id})">Save</button>
                            <button onclick="cancelEdit(${msg.id})">Cancel</button>
                        </div>
                    ` : ''}
                </div>
            `).join('');
        }
    } catch (error) {
        messagesDiv.innerHTML = `<div class="post"><p>Failed to load posts.</p></div>`;
    }
}

// Function to show the edit form
function showEditForm(messageId, currentMessage) {
    document.getElementById(`edit-form-${messageId}`).style.display = 'block';
}

// Function to cancel the edit
function cancelEdit(messageId) {
    document.getElementById(`edit-form-${messageId}`).style.display = 'none';
}

// Function to update the message
async function updateMessage(userId, messageId) {
    const newMessage = document.getElementById(`edit-input-${messageId}`).value;
    await editMessage(userId, messageId, newMessage);
}


// Function to edit a message
async function editMessage(userId, messageId, newMessage) {
    const token = localStorage.getItem('loginToken');
    const response = await fetch(`${baseUrl}/api/verifyToken`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token
        },
        body: JSON.stringify({ userId, token })
    });
    if (response.ok) {
        const data = await response.json();
        if (data.success === true) {
            const editResponse = await fetch(`${baseUrl}/api/message`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
                body: JSON.stringify({ userId, id: messageId, message: newMessage })
            });

            if (editResponse.ok) {
                alert('Message updated successfully!');
                loadMessages();
            } else {
                alert('Failed to update message!');
            }
        } else {
            alert('Invalid user or token!');
        }
    } else {
        alert('Failed to verify token!');
    }
}

async function deleteMessage(userId, messageId) {
    const token = localStorage.getItem('loginToken');

    const response = await fetch(`${baseUrl}/api/verifyToken`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token
        },
        body: JSON.stringify({ userId, token })
    });


    if (response.ok) {
        const data = await response.json();
        if (data.success === true) {

            const deleteResponse = await fetch(`${baseUrl}/api/message`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
                body: JSON.stringify({ messageId, userId: currentUserId })
            });


            if (deleteResponse.ok) {
                alert('Message deleted successfully!');
                loadMessages(); // Reload messages after deletion
            } else {
                alert('Failed to delete message!');
            }
        } else {
            alert('Invalid user or token!');
        }
    } else {
        alert('Failed to verify token!');
    }
}



document.addEventListener('DOMContentLoaded', () => {
    loadMessages();
});

window.onload = function() {
    loadMessages(); // Call loadMessages() every 5 seconds (5000 milliseconds) 
  setInterval(loadMessages, 10000); 
    const versionString = document.getElementById('versionstring');
  versionString.innerHTML = "Version " + version + " - Kit Studios 2024";
}






