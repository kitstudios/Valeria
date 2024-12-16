const baseUrl = "YOUR_API_URL_HERE"; // Base URL for the API
const version = "0.2.0c"
const registerForm = document.getElementById('registerForm');
const loginForm = document.getElementById('loginForm');
const postForm = document.getElementById('postForm');
const postSection = document.getElementById('postSection');
const messagesDiv = document.getElementById('postlist');
const postTxtInput = document.getElementById('postinput');
const postBtn = document.getElementsByClassName('postbutton')[0];

let currentUserId = null; // Corrected variable name
// Load messages
async function loadMessages() {
    try {
        const response = await fetch(`${baseUrl}/api/messages`);
        if (!response.ok) {
            throw new Error('Failed to fetch messages');
        }
        const data = await response.json();
        
        if (!data.chat || data.chat.length === 0) {
            messagesDiv.innerHTML = `<div class="post"><p>There are currently no Kits</p></div>`;
        } else {
            messagesDiv.innerHTML = data.chat.reverse().map(msg => `        
                <div class="post">
                    <p><strong>${msg.username}:</strong> ${msg.message}</p>
                    ${msg.userId === currentUserId ? `
                        <div class="button-container">
                            <button class="editBtn" onclick="editMessage(${msg.id}, '${msg.message}')">Edit</button>
                            <button class="delBtn" onclick="deleteMessage(${msg.id})">Delete</button>
                        </div>
                    ` : ''}
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading posts:', error);
        messagesDiv.innerHTML = `<div class="kit"><p>Failed to load posts.</p></div>`;
    }
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

    if (response.ok) {
        alert('Registration successful!');
    } else {
        alert('Registration failed!');
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
        console.log(data);
        currentUserId = data.userId; // Store the user ID
        const loggedas = document.getElementById('currentuser');
        loggedas.innerHTML = data.nameofuser;
      postTxtInput.placeholder = "Write your post..."; 
      postTxtInput.disabled = false; 
      postBtn.disabled = false;
        alert('Login successful!');
        loadMessages();
    } else {
        alert('Login failed!');
        loadMessages();
    }
});


// Post a message
postForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = document.getElementById('postinput').value;

    const response = await fetch(`${baseUrl}/api/message`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: currentUserId, message })
    });

    if (response.ok) {
        document.getElementById('postinput').value = ''; // Clear the message input
        loadMessages(); // Reload messages after posting
    } else {
        alert('Failed to post message!');
    }
});



// Edit a message
async function editMessage(id, oldMessage) {
    const newMessage = prompt('Edit your message:', oldMessage);
    if (newMessage) {
        const response = await fetch(`${baseUrl}/api/message`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id, userId: currentUserId, message: newMessage })
        });
        if (response.ok) {
            loadMessages();
        } else {
            alert('Failed to edit message.');
        }
    }
}

// Delete a message
async function deleteMessage(id) {
    const response = await fetch(`${baseUrl}/api/message`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id, userId: currentUserId })
    });
    if (response.ok) {
        loadMessages();
    } else {
        const errorData = await response.json();
        alert(`Failed to delete message: ${errorData.error}`);
    }
}
window.onload = function() { // Call loadMessages() every 5 seconds (5000 milliseconds) 
  setInterval(loadMessages, 2000); 
    const versionString = document.getElementsByClassName('versionstring')[0];
  versionString.innerHTML = version;
}





