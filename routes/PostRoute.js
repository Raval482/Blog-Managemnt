
const express = require("express")
const auth = require("../middleware/auth")
const Post_Route = express()
const bodyParser = require("body-parser")

const { createPost, givePostPermission, showAllPost, PersonalPost, DeletePost,  updatePost } = require("../controller/PostController")


const multer = require("multer")
const path = require("path")

Post_Route.use(express.json())
Post_Route.use(bodyParser.json())
Post_Route.use(bodyParser.urlencoded({extended:true}))



Post_Route.use("/public", express.static(path.join(__dirname, "../public")));

const storage = multer.diskStorage({
    destination : (req,file,cb) =>{
        cb(null, path.join(__dirname,"../public/post",));
    },
    filename : (req,file,cb) =>{
        const ext = path.extname(file.originalname);
        const baseName = path.basename(file.originalname, ext).replace(/\s+/g, "-"); // replace spaces
        const fileName = Date.now() + "-" + baseName + ext;
        cb(null, fileName);
    }

})




const uplode = multer({storage : storage})

Post_Route.post("/create-post" ,auth ,uplode.single("postImage"),createPost)
Post_Route.post("/blog-permission",auth,givePostPermission)
Post_Route.get("/blog-show",auth,showAllPost)
Post_Route.get("/myblog-show",auth,PersonalPost)
Post_Route.post("/delete-post",auth,DeletePost)
Post_Route.post("/update-post",auth,uplode.single("postImage"),updatePost)





module.exports = Post_Route

// Post_Route.post("/permission",auth,givePermission)