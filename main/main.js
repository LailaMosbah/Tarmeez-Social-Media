const baseUrl = "https://tarmeezacademy.com/api/v1"

function setNavUI() {
    const token = localStorage.getItem("token");
    const loginBtns = document.querySelector(".login-btns");
    const logoutBtn = document.querySelector(".logout-btn");
    const createPostBtn = document.getElementById("create-post-btn");
    const profileImgNav = document.getElementById("Profile-img-nav");
    const profileNameNav = document.getElementById("Profile-name-nav");

    let user = getCurrentUser();

    if (token && user) {
        loginBtns.classList.add("d-none");
        logoutBtn.classList.remove("d-none");
        if (createPostBtn) {
            createPostBtn.classList.remove("d-none");
        }
        profileImgNav.src = getProfileImage(user.profile_image);
        console.log(getProfileImage(user.profile_image));
        console.log(profileImgNav)
        profileNameNav.innerHTML = user.name || "Unknown";
    } else {
        loginBtns.classList.remove("d-none");
        logoutBtn.classList.add("d-none");
        if (createPostBtn) {
            createPostBtn.classList.add("d-none");
        }
    }
}



// ============Auth Function ========== //


//Login button Clicked 
function loginBtnClicked() {
    // alert("test")
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    if (!username || !password) {
        showFailureAlert("Please enter both username and password");
        return;
    }
    // console.log(username , password)
    const params = {
        "username": username,
        "password": password
    }
    toggleLoadingSpinner(true)

    axios.post(`${baseUrl}/login`, params)
        .then((response) => {
            // console.log(response.data)
            let token = response.data.token
            let user = response.data.user
            // console.log(token)
            // console.log(user)
            localStorage.setItem("token", token)
            localStorage.setItem("user", JSON.stringify(user))

            //Hide the login modal
            const modal = document.getElementById("login-modal")
            const modalInstant = bootstrap.Modal.getInstance(modal)
            modalInstant.hide()

            showSuccessfulAlert("logged in Succssfully")
            setNavUI()


        })
        .catch((error) => {
            const errorMessage = error.response.data.message
            console.log(error)
            showFailureAlert(errorMessage)
        })
        .finally(() => {
            toggleLoadingSpinner(false)
        })
}

//Log out button Clicked
function logoutClicked() {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setNavUI()
    showSuccessfulAlert("Logged out Sccussfully")
}

//Register button Clicked
function registerBtnClicked() {
    // alert("test")
    const name = document.getElementById("register-name").value;
    const username = document.getElementById("register-username").value;
    const password = document.getElementById("register-password").value;
    const imgProfile = document.getElementById("register-image-profile").files[0]
    //console.log(name,username , password)
    const formData = new FormData();
    formData.append("name", name);
    formData.append("username", username);
    formData.append("password", password);
    formData.append("image", imgProfile)

    const headers = {
        "Content-Type": "multipart/form-data"
    }
    toggleLoadingSpinner(true)
    axios.post(`${baseUrl}/register`, formData, { headers: headers })
        .then((response) => {
            // console.log(response.data)
            let token = response.data.token
            let user = response.data.user
            // console.log(token)
            // console.log(user)
            localStorage.setItem("token", token)
            localStorage.setItem("user", JSON.stringify(user))

            //Hide the Register modal
            const modal = document.getElementById("register-modal")
            const modalInstant = bootstrap.Modal.getInstance(modal)
            modalInstant.hide()

            showSuccessfulAlert("Registered Succssfully")
            setNavUI()


        })
        .catch((error) => {
            //Hide the Register modal
            // const modal = document.getElementById("register-modal")
            // const modalInstant = bootstrap.Modal.getInstance(modal)
            // modalInstant.hide()
            //console.log(error)
            const errorMessage = error.response.data.message
            console.log(errorMessage)
            showFailureAlert(errorMessage)
        })
        .finally(() => {
            toggleLoadingSpinner(false)
        })

}

// Profile button Clicked
function profileClicked() {
    let user = getCurrentUser()
    let userId = user.id
    window.location = `./profile.html?userID=${userId}`
}

// Get User After Login
function getCurrentUser() {
    let currentUser = null;
    currentUser = localStorage.getItem("user");
    if (currentUser)
        return JSON.parse(currentUser);
}

// Show profile of user
function userClicked(id) {
    window.location = `./profile.html?userID=${id}`
}

function getProfileImage(image) {
    return image && typeof image === 'string' ? image : '../img/profile-img.jpg';
}



// ========  Manage Posts ======= //


//Create Post button  Clicked
function createPostBtnClicked() {
    // alert("post crated")
    const title = document.getElementById("title-new-post").value;
    const body = document.getElementById("body-new-post").value;
    const image = document.getElementById("image-new-post").files[0];
    const token = localStorage.getItem("token")
    // console.log(title, body, image, tags)
    //console.log(tags)
    let formData = new FormData()
    formData.append("title", title)
    formData.append("body", body)
    formData.append("image", image)
    //console.log(formData)
    const headers = {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "multipart/form-data"
    }

    toggleLoadingSpinner(true)
    axios.post(`${baseUrl}/posts`, formData, { headers: headers })
        .then((response) => {
            //console.log(response.data)
            //alert("success")
            // for (let pair of formData.entries()) {
            //     console.log(`${pair[0]}: ${pair[1]}`);
            // }

            //Hide the create post modal
            const modal = document.getElementById("create-post-modal")
            const modalInstant = bootstrap.Modal.getInstance(modal)
            modalInstant.hide()

            showSuccessfulAlert("New Post has been Created Succssfully")
            getPosts(true, currentPage)
            setNavUI()



        })
        .catch((error) => {
            console.log(error)
            const errorMessage = error.response.data.message
            console.log(errorMessage)
            showFailureAlert(errorMessage)
        })
        .finally(() => {
            toggleLoadingSpinner(false)
        })

}


//Edit Post
function editPostBtnClicked(postString) {
    const post = JSON.parse(decodeURIComponent(postString));
    console.log(post)

    document.getElementById("edit-post-id-input").value = post.id
    document.getElementById("title-edit-post").value = post.title
    document.getElementById("body-edit-post").value = post.body
    //document.getElementById("image-edit-post").files[0] = post.image
    document.getElementById("tags-edit-post").value = post.tags.join(" ")
    editedPostId = post.id

}

function editPostModelClicked() {

    let editedIdPost = document.getElementById("edit-post-id-input").value
    let editedTitle = document.getElementById("title-edit-post").value
    let editedBody = document.getElementById("body-edit-post").value
    let editedImage = document.getElementById("image-edit-post").files[0]

    let token = localStorage.getItem("token")

    let formData = new FormData()
    formData.append("title", editedTitle)
    formData.append("body", editedBody)
    formData.append("image", editedImage)
    formData.append("_method", "put")
    const headers = {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "multipart/form-data"
    }

    for (let pair of formData.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`);
    }
    toggleLoadingSpinner(true)

    axios.post(`${baseUrl}/posts/${editedIdPost}`, formData, { headers: headers })
        .then((response) => {
            console.log("API Response:", response.data);
            //Hide the create post modal
            const modal = document.getElementById("Edit-post-modal")
            const modalInstant = bootstrap.Modal.getInstance(modal)
            modalInstant.hide()

            showSuccessfulAlert("The Post has been Edited Succssfully")
            getPosts()
            setNavUI()



        })
        .catch((error) => {
            console.log(error)
            const errorMessage = error.response.data.error_message
            console.log(errorMessage)
            showFailureAlert(errorMessage)
        })
        .finally(() => {
            toggleLoadingSpinner(false)
        })
}

// Delete Post
function deletePostBtnClicked(postString) {
    let post = JSON.parse(decodeURIComponent(postString));
    // alert("delete")
    document.getElementById("delete-post-id-input").value = post.id;
    let deleteModal = new bootstrap.Modal((document.getElementById("delete-post-modal")), {})
    deleteModal.toggle()


}

function confirmDeletPost() {
    const deletedIdPost = document.getElementById("delete-post-id-input").value;
    const token = localStorage.getItem("token");
    const headers = {
        "Authorization": `Bearer ${token}`
    }

    toggleLoadingSpinner(true)
    axios.delete(`${baseUrl}/posts/${deletedIdPost}`, { headers: headers })
        .then((response) => {
            console.log(response)
            const modal = document.getElementById("delete-post-modal")
            const modalInstant = bootstrap.Modal.getInstance(modal)
            modalInstant.hide()

            showSuccessfulAlert("The Post has been Deleted Succssfully")
            getPosts(true, currentPage)
        })
        .catch((error) => {
            console.log(error)
            showFailureAlert(error.response.data.message)
        })
        .finally(() => {
            toggleLoadingSpinner(false)
        })
}

// Show Details of Post
function showPostDetails(postId) {
    // alert(postId)
    console.log("Navigating to post ID:", postId);
    window.location = `./postDetails.html?postId=${postId}`
}



// =========== Alerts ============== //
function showSuccessfulAlert(message) {
    // Show alert login
    document.getElementById("alertMessageSuccessful").textContent = message
    const alertBox = document.getElementById("success-alert");
    alertBox.classList.remove("d-none");

    // Automatically fade out after 3 seconds
    setTimeout(() => {
        alertBox.style.opacity = "0";

        // Remove it after fade-out finishes
        setTimeout(() => {
            alertBox.classList.add("d-none");
            alertBox.style.opacity = "1"; // reset for next time
        }, 1000);
    }, 2000);
}

function showFailureAlert(message) {
    document.getElementById("alertMessageUnsuccessful").textContent = message
    const alertBox = document.getElementById("unsuccess-alert");
    alertBox.classList.remove("d-none");

    // Automatically fade out after 3 seconds
    setTimeout(() => {
        alertBox.style.opacity = "0";

        // Remove it after fade-out finishes
        setTimeout(() => {
            alertBox.classList.add("d-none");
            alertBox.style.opacity = "1"; // reset for next time
        }, 1000);
    }, 2000);
}


// ===== Loading Spinner ===== //
function toggleLoadingSpinner(show = true) {
    if (show)
        document.getElementById("spinner-loading").style.visibility = 'visible'
    else
        document.getElementById("spinner-loading").style.visibility = "hidden"
}