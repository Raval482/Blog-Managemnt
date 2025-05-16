const PostModal = require("../model/PostModal")
const fs = require("fs");
const path = require("path");


const planLimits = {
    free: 2,
    bronze: 4,
    silver: 10,
    gold: 15,
    dimond: Infinity 
  };

const createPost = async (req, res) => {

    try {
        const userData = req.user
        const isAdmin = userData.role === "admin"
        const { title, description } = req.body
        if (isAdmin ) {
            const post = new PostModal({
                title: title,
                description: description,
                userId: userData._id,
                status: isAdmin ? "approved" : "pending",
                postImage: req.file ? req.file.filename : null
            })
            const savePost = await post.save()
            res.status(200).json({ success: true, message: "Post Created Successfully by Admin", savePost })
        } 
        if (userData.status !== "approved") {
            return res.status(403).json({
              success: false,
              message: "Your account is not approved to create a post"
            });
          }

          const currentPlan = userData.postPlane;
          const allowedPosts = planLimits[currentPlan];
          const userPostCount = await PostModal.countDocuments({ userId: userData._id });

          if (userPostCount >= allowedPosts) {
            return res.status(403).json({
              success: false,
              message: `You have reached the limit of ${allowedPosts} posts allowed in your current plan (${currentPlan}). Please upgrade your plan to post more.`
            });
          }

          const post = new PostModal({
            title,
            description,
            userId: userData._id,
            status: "pending", 
            postImage: req.file ? req.file.filename : null
          });

          const savePost = await post.save();

          return res.status(200).json({
            success: true,
            message: "Post Created Successfully",
            savePost
          });
          

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

const givePostPermission = async (req, res) => {
    try {
        const userData = req.user
        const isAdmin = userData.role === "admin"
        if (isAdmin) {
            const postId = req.body.id
            const postStatus = req.body.status
            if (postStatus === "rejected") {
                const comment = req.body.comment
                await PostModal.updateOne({ _id: postId }, { $set: { status: postStatus, comment: comment } })
                return res.status(200).json({ success: true, message: `User Post Status ${postStatus} Successfully` })
            } else {
                await PostModal.updateOne({ _id: postId }, { $set: { status: postStatus, comment: "" } })
                return res.status(200).json({ success: true, message: `User Post Status ${postStatus} Successfully` })
            }

        } else {
            return res.status(403).json({ success: false, message: "You are not allowed to Change a post Status" })
        }

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

const showAllPost = async (req, res) => {
    try {
        const userData = req.user
        const isAdmin = userData.role === "admin"
        if (isAdmin) {
            const allPost = await PostModal.find({})
            const length = allPost.length
            return res.status(200).json({ success: true, data: allPost, length })
        } else {

            const allPost = await PostModal.find({ status: "approved" })
            const length = allPost.length
            return res.status(200).json({ success: true, data: allPost, length })
        }

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

const PersonalPost = async (req, res) => {
    try {
        const userData = req.user
        const post = await PostModal.find({ userId: userData._id })

        const length = post.length
        return res.status(200).json({ success: true, data: post, length })

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

const DeletePost = async (req, res) => {
    try {
        const userData = req.user;
        const id = req.body.id;

        const post = await PostModal.findById(id);

        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }


        if (userData.role === "admin") {
            await PostModal.deleteOne({ _id: id });
            return res.status(200).json({ success: true, message: "Post deleted successfully" });
        }


        if (post.userId.toString() === userData._id.toString()) {
            await PostModal.deleteOne({ _id: id });
            return res.status(200).json({ success: true, message: "Post deleted successfully" });
        } else {
            return res.status(403).json({ success: false, message: "You are not authorized to delete this post" });
        }

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};



const updatePost = async (req, res) => {
    try {
        const userId = req.user._id;
        const { id, title, description } = req.body;

        const blog = await PostModal.findOne({ _id: id });
        if (!blog) {
            return res.status(404).json({ success: false, message: "Blog not found" });
        }

     
        if (blog.userId.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized: You can only update your own blog." });
        }

        let updatedFields = { title, description };

        if (req.file) {
            const oldImagePath = path.join(__dirname, "../public/post", blog.postImage);
            
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }

            updatedFields.postImage = req.file.filename;
        }

        const updatedBlog = await PostModal.findByIdAndUpdate(id, updatedFields, { new: true });

        return res.status(200).json({
            success: true,
            message: "Blog updated successfully",
            data: updatedBlog,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};


module.exports = {
    createPost,
    givePostPermission,
    showAllPost,
    PersonalPost,
    DeletePost,
    updatePost
}