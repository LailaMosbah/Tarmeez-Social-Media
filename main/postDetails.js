
const urlParams = new URLSearchParams(window.location.search)
const postId = urlParams.get("postId")
console.log("postId from URL:", postId);
setNavUI()



console.log(postId)
// =========== get Post ===============
function getPost(id) {
    toggleLoadingSpinner(true)
    axios.get(`${baseUrl}/posts/${id}`)
        .then((respose) => {
            let post = respose.data.data
            let comments = post.comments
            console.log(post)
            console.log(comments)

            let postSection = document.getElementById("post-user")
            if (!postSection) {
                console.error("Error: #post-user element not found");
                return;
            }
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
            postSection.innerHTML = ""
            // Proceed with full rendering
            const author = post.author || {};
            const profileImage = getProfileImage(author.profile_image);
            const postImage = post.image && typeof post.image === 'string' ? post.image : "./img/default-post.jpg";
            const title = post.title ? post.title.replace(/</g, "<") : "No Title";
            const body = post.body ? post.body.replace(/</g, "<") : "No Content";
            const username = author.username || "Unknown";
            const name = author.name || "Unknown";
            const createdAt = post.created_at || "Unknown time";
            const commentsCount = post.comments_count || 0;

            let commentsHTML = comments.length > 0 ? comments.map(comment => `
                <div class="comment mt-2 p-1 border rounded" style="background-color:rgb(254 243 255);">
                    <div class="user's-commment">
                        <img src="${getProfileImage(comment.author.profile_image)}" alt="Profile picture of ${comment.author.name}" class="profileUserPost rounded-circle border border-2">                        <b>${comment.author.name}</b>
                    </div>
                        ${comment.body}
                    <div>
                    
                    </div>
                </div>
            `).join("") : "<p>No comments yet</p>";

            postSection.innerHTML =
                `
                <h2><span>${name}</span>'s Post</h2>
                <div class="card my-5 shadow">
                    <div class="card-header">
                        <span onclick="userClicked(${author.id})" style="cursor:pointer">
                            <img src="${profileImage}" alt="Profile picture of ${author.username}"
                                class="profileUserPost rounded-circle border border-2" loading="lazy">
                            <p class="d-inline">${author.username}</p>
                        </span>
                        <div>
                            ${deleteBtnContent}
                            ${editBtnContent}
                        </div>
                    </div>
                    <div class="card-body">
                        <img src="${postImage}" alt="Post image" class="img-post">
                        <p class="postedTime">${createdAt}</p>
                        <h5>${title}</h5>
                        <p>${body}</p>
                        <hr>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                            class="bi bi-pen" viewBox="0 0 16 16">
                            <path d="M13.498.795l.149-.149a1.207 1.207 0 0 1 1.708 1.708l-.149.149-1.708-1.708zM11.354 
                            2.94 1 13.293V15h1.707L13.06 4.646l-1.707-1.707z"/>
                        </svg>
                        <span>(${commentsCount}) comments</span>
                        <div class="comments-section mt-3">
                        <hr>
                        <div class="input-group mb-3">
                            <input type="text" id="input-comment" class="form-control" placeholder="Add Your Comment" aria-label="adding-comment" aria-describedby="button-addon2">
                            <button class="btn btn-outline-primary" type="button" id="button-addon2" onclick="AddCommentBtnClicked()">Add</button>
                        </div>
                            <h6>Comments</h6>
                            ${commentsHTML}
                        </div>
                    </div>
                </div>
            `
        })

        .catch((error => {
            console.log("API Error " + error)
            const errorMessage = error?.response?.data?.message || "Unexpected error";
            showFailureAlert(errorMessage)
        }))
        .finally(() => {
            toggleLoadingSpinner(false)
        })
}


getPost(postId)


function AddCommentBtnClicked() {
    let bodyComment = document.getElementById("input-comment").value;
    if (!bodyComment.trim()) {
        showFailureAlert("Comment cannot be empty");
        return;
    }

    // alert(bodyComment)
    let params = {
        "body": bodyComment
    }
    const token = localStorage.getItem("token")
    const headers = {
        "Authorization": `Bearer ${token}`
    }

    toggleLoadingSpinner(true)
    axios.post(`${baseUrl}/posts/${postId}/comments`, params, { headers: headers })
        .then((respose) => {
            console.log(respose.data)
            document.getElementById("input-comment").value = "";
            getPost(postId)
            showSuccessfulAlert("The comment is added Successfully")
        })
        .catch((error) => {
            // console.log(error)
            const errorMessage = error.response.data.message
            console.log(errorMessage)
            showFailureAlert(errorMessage)
        })
        .finally(() => {
            toggleLoadingSpinner(false)
        })
}
