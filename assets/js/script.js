const baseUrl = "https://elegant-brass-coelurus.glitch.me"; // Base URL for the API
const version = "0.8.0b"
const registerForm = document.getElementById('registerForm');
const loginForm = document.getElementById('loginForm');
const postForm = document.getElementById('postForm');
const postSection = document.getElementById('postSection');
const postsDiv = document.getElementById('postlist');
const postTxtInput = document.getElementById('postinput');
const postBtn = document.getElementsByClassName('postbutton')[0];
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
        const profileBtn = document.getElementById('profileSideBtn');
        loggedas.innerHTML = data.nameofuser;
      postTxtInput.placeholder = "Write your post..."; 
      postTxtInput.disabled = false; 
      postBtn.disabled = false;
      profileBtn.style.display = "block";
        alert('Login successful!');
        loadPosts();
    } else {
        const profileBtn = document.getElementById('profileSideBtn');
      postTxtInput.placeholder = "You must be signed in to write a post."; 
      postTxtInput.disabled = true; 
      postBtn.disabled = true;
      profileBtn.style.display = "none";
        alert('Login failed!');
        loadPosts();
    }
});

var txtarea = document.getElementById("postinput");
txtarea.addEventListener("input", function() {
    txtarea.value = txtarea.value.replaceAll("'", "");
    txtarea.value = txtarea.value.replaceAll('"', "");

  })
postForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent the default form submission
        const post = document.getElementById('postinput').value;
        const timestamp = new Date().toISOString();
        const token = localStorage.getItem('loginToken');
        const postResponse = await fetch(`${baseUrl}/api/post`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify({ userId: currentUserId, post, timestamp })
        });


        if (postResponse.ok) {
            document.getElementById('postinput').value = ''; // Clear the message input
            loadPosts(); // Reload messages after posting
        } else {
            alert('Failed to post!');
        }
});







async function loadPosts() {
    const token = localStorage.getItem('loginToken');
    const postsDiv = document.getElementById('postlist');

    try {
        const response = await fetch(`${baseUrl}/api/posts`);
        if (!response.ok) {
            throw new Error('Failed to fetch posts');
        }
        const data = await response.json();

        if (!data.posts || data.posts.length === 0) {
            postsDiv.innerHTML = `<div class="post"><p>There are currently no posts</p></div>`;
        } else {
            postsDiv.innerHTML = data.posts.map(post => {
                const date = new Date(post.timestamp); 
                const readableDate = date.toLocaleString('en-US', {  
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit', 
                    second: '2-digit' 
                });

                
                return `        
                <div class="post" id="post-${post.id}">
                    <p>
                       <div class="profileInfo">
                        <img class="profilePicture" src="${post.profilePic || "assets/img/defaultPfp.png"}" alt="${post.username}'s profile picture" height="32" width="32">
                        <strong class="username" data-user-id="${post.userId}">${post.username}</strong><br>
                        <span class="bio" data-user-id="${post.userId}">Bio: ${post.bio || "No bio available"}</span><br>
                          </div>
                        <a class="postContent">${post.post}</a>
                        <br>
                        <small class="timestamp">${readableDate}</small>
                    </p>
                    ${(post.userId === currentUserId && token === localStorage.getItem('loginToken')) ? `
                        <div class="button-container">
                            <button class="editBtn" onclick="showEditForm(${post.id}, '${post.post}')">Edit</button>
                            <button class="delBtn" onclick="deletePost(${post.userId}, ${post.id})">Delete</button>
                        </div>
                        <div class="edit-form" id="edit-form-${post.id}" style="display: none;">
                            <input type="text" class="editPostInpt" id="edit-input-${post.id}" value="${post.post}"><br>
                            <button class="updPostBtn" onclick="updatePost(${post.userId}, ${post.id})">Save</button>
                            <button class="cncledtBtn" onclick="cancelEdit(${post.id})">Cancel</button>
                        </div>
                    ` : ''}
                </div>
            `}).join('');
        }
    } catch (error) {
        postsDiv.innerHTML = `<div class="post"><p>Failed to load posts.</p></div>`;
    }
}



// Function to show the edit form
function showEditForm(postId, currentPost) {
    document.getElementById(`edit-form-${postId}`).style.display = 'block';
}

// Function to cancel the edit
function cancelEdit(postId) {
    document.getElementById(`edit-form-${postId}`).style.display = 'none';
}

// Function to update the post
async function updatePost(userId, postId) {
    const editedPost = document.getElementById(`edit-input-${postId}`).value;
    await editPost(userId, postId, editedPost);
}


// Function to edit a message
async function editPost(userId, postId, editedPost) {
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
            const editResponse = await fetch(`${baseUrl}/api/post`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
                body: JSON.stringify({ userId, id: postId, post: editedPost })
            });

            if (editResponse.ok) {
                alert('Post updated successfully!');
                loadPosts();
            } else {
                alert('Failed to update Post!');
            }
        } else {
            alert('Invalid user or token!');
        }
    } else {
        alert('Failed to verify token!');
    }
}

async function deletePost(userId, postId) {
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

            const deleteResponse = await fetch(`${baseUrl}/api/post`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
                body: JSON.stringify({ postId, userId: currentUserId })
            });


            if (deleteResponse.ok) {
                alert('Post deleted successfully!');
                loadPosts(); // Reload messages after deletion
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


  document.getElementById('updateProfileForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent the form from submitting the default way
  
    const bio = document.getElementById('bio').value;
    const profilePicInput = document.getElementById('profilePic');
    const userId = currentUserId; // Replace with the actual user ID
    const token = localStorage.getItem('loginToken');
    const defaultImage = `data:image/jpeg;base64,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`; // Replace with your actual default image in base64 format
  
    // Fetch the current profile picture to check if it needs updating
    let currentProfilePic;
    try {
      const response = await fetch(`${baseUrl}/api/profile/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': token
        }
      });
      const data = await response.json();
      currentProfilePic = data.profilePic;
    } catch (error) {
      console.error('Error fetching current profile picture:', error);
    }
  
    // Determine if a new profile picture is provided
    if (profilePicInput.files && profilePicInput.files.length > 0) {
      const file = profilePicInput.files[0];
      const reader = new FileReader();
  
      reader.onloadend = async function() {
        const profilePicBase64 = reader.result;
  
        try {
          const response = await fetch(`${baseUrl}/api/profile`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': token
            },
            body: JSON.stringify({ userId, bio, profilePic: profilePicBase64 })
          });
  
          const data = await response.json();
          if (data.success) {
            alert('Profile updated successfully!');
          } else {
            alert('Failed to update profile.');
          }
        } catch (error) {
          console.error('Error updating profile:', error);
          alert('An error occurred while updating the profile.');
        }
      };
  
      reader.readAsDataURL(file); // Convert the image file to base64
    } else {
      // Use current profile picture if no new file is selected
      
      const profilePicToUpdate = currentProfilePic || defaultImage;
      try {
        const response = await fetch(`${baseUrl}/api/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token
          },
          body: JSON.stringify({ userId, bio, profilePic: profilePicToUpdate })
        });
  
        const data = await response.json();
        if (data.success) {
          alert('Profile updated successfully!');
        } else {
          alert('Failed to update profile.');
        }
      } catch (error) {
        console.error('Error updating profile:', error);
        alert('An error occurred while updating the profile.');
      }
    }
  });
  


  function signOut() {
    const loggedas = document.getElementById('currentuser');
    const profileBtn = document.getElementById('profileSideBtn');
    postTxtInput.placeholder = "You must be signed in to write a post."; 
    postTxtInput.disabled = true; 
    postBtn.disabled = true;
    profileBtn.style.display = "none";
    loggedas.innerHTML = "Guest";
    currentUserId = 0;
    localStorage.setItem("loginToken", "");
    openTab("Home");
    alert("Log out successful")
  }

  //Alerts
window.alert = function(msg){
	$('.alertxt').text(msg);
	$('#alert').css('animation', 'fadeIn 0.3s linear');
	$('#alert').css('display', 'inline');
	setTimeout(function(){
	  $('#alert').css('animation', 'none');
	}, 300);
  }
  
  $(function(){
	
	// add listener for when our confirmation button is clicked
	  $('.confirmAlertButton').click(function(){
	  $('#alert').css('animation', 'fadeOut 0.3s linear');
	  setTimeout(function(){
	  $('#alert').css('animation', 'none');
	  $('#alert').css('display', 'none');
	  }, 300);
	})
  });

  window.onload = function() {
    const profileBtn = document.getElementById('profileSideBtn');
    postTxtInput.placeholder = "You must be signed in to write a post."; 
    postTxtInput.disabled = true; 
    postBtn.disabled = true;
    loadPosts(); // Call loadMessages() every 5 seconds (5000 milliseconds) 
    setInterval(loadPosts, 10000); 
    const versionString = document.getElementById('versionstring');
    versionString.innerHTML = "Version " + version + " - Kit Studios 2025";
}
  








