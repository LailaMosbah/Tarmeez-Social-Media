
setNavUI();
getUserInfo();
getUserPosts()


function getUserId() {
    const urlParams = new URLSearchParams(window.location.search)
    const userId = urlParams.get("userID")
    return userId
}


function getUserInfo() {
    const id = getUserId();
    toggleLoadingSpinner(true);
    axios.get(`${baseUrl}/users/${id}`)
        .then((response) => {
            const user = response.data.data;
            document.getElementById("main-info-profile-image").src = getProfileImage(user.profile_image);
            document.getElementById("main-info-name").innerHTML = user.name || "Unknown";
            document.getElementById("main-info-username").innerHTML = `@${user.username || "unknown"}`;
            document.getElementById("main-info-posts-count").innerHTML = user.posts_count || 0;
            document.getElementById("main-info-comments-count").innerHTML = user.comments_count || 0;
        })
        .catch((error) => {
            console.error("Error fetching user info:", error);
            showFailureAlert(error.response?.data?.message || "Failed to load user information");
        })
        .finally(() => {
            toggleLoadingSpinner(false);
        });
}


//get Posts
function getUserPosts() {
    const id = getUserId();
    toggleLoadingSpinner(true)
    axios.get(`${baseUrl}/users/${id}/posts`)
        .then((respose) => {
            let posts = respose.data.data
            let postsSection = document.getElementById("posts-user")
            // console.log(posts)
            posts.forEach(post => {
                const author = post.author;
                const profileImage = getProfileImage(author.profile_image);
                const postImage = post.image || "./img/default-post.jpg"; // Fallback image
                const title = post.title ? post.title.replace(/</g, "&lt;") : "No Title"; // Sanitize title
                const body = post.body ? post.body.replace(/</g, "&lt;") : "No Content"; // Sanitize body

                let editBtnContent = ``;
                let deleteBtnContent = ''
                let user = getCurrentUser()
                let isMyPost = (user != null) && (user.id == post.author.id)

                if (isMyPost) {
                    editBtnContent = `<button class="btn btn-secondary" style="float:right;" data-bs-toggle="modal"
                            data-bs-target="#Edit-post-modal" onclick='editPostBtnClicked("${encodeURIComponent(JSON.stringify(post))}")'>Edit</button>`
                    deleteBtnContent = `<button class="btn btn-danger" style="float:right; margin-left:5px;" 
                            onclick='deletePostBtnClicked("${encodeURIComponent(JSON.stringify(post))}")'>Delete</button>`
                }


                let postSection =
                    `
            <div class="card my-5 shadow">
                <div class="card-header">
                    <img src="${profileImage}" alt="Profile picture of ${author.username}"
                        class="profileUserPost rounded-circle border border-2" loading="lazy">
                    <p class="d-inline">${author.username}</p>
                    ${deleteBtnContent}
                    ${editBtnContent}
                </div>
                <div class="card-body" onclick=showPostDetails(${post.id}) style="cursor:pointer">
                    <img src="${postImage}" alt="Post image"  class="img-post">
                    <p class="postedTime">${post.created_at}</p>
                    <h5>${title}</h5>
                    <p>${body}</p>
                    <hr>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pen"
                        viewBox="0 0 16 16">
                        <path
                            d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001m-.644.766a.5.5 0 0 0-.707 0L1.95 11.756l-.764 3.057 3.057-.764L14.44 3.854a.5.5 0 0 0 0-.708z" />
                    </svg>
                    <span>(${post.comments_count}) comments</span>
                </div>
            </div>
        `
                postsSection.innerHTML += postSection
            });
        })
        .catch((error) => {
            console.log(error)
            const errorMessage = error?.response?.data?.message || "Failed to load user posts";
            showFailureAlert(errorMessage);

        })
        .finally(() => {
            toggleLoadingSpinner(false)
        })

}