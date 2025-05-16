const UserModal = require("../model/UserModal")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { secrateKey } = require("../key/secrate")
const otpMake = require("otp-generator")
const nodemailer = require("nodemailer")

const StrongPassword = async (password) => {
        return await bcrypt.hash(password, 8)
}
const createToken = async (id) => {
        const token = await jwt.sign({ id: id }, secrateKey.key)
        return token
}

const OtpMailService = async (email, subject, html) => {
        try {
                const myEmail = "ravalrudresh482@gmail.com"
                const transporter = nodemailer.createTransport({
                        service: "gmail",
                        auth: {
                                user: myEmail,
                                pass: "zkdw klyo ucss bpdw"
                        }
                })

                const mailOption = {
                        from: myEmail,
                        to: email,
                        subject: subject,
                        html: html
                }
                await transporter.sendMail(mailOption)
                console.log("✅ OTP email sent to:", email);

        } catch (error) {
                console.log("send Mail problem")
        }
}

const Registration = async (req, res) => {
        try {
                const { name, email, password } = req.body
                const ExistUser = await UserModal.findOne({ email: email })
                if (ExistUser) {
                        res.status(409).json({ success: false, message: "User already registered with this email." })
                } else {
                        const securePassword = await StrongPassword(password)
                        const otp = otpMake.generate(6, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false })
                        const createUser = new UserModal({
                                name: name,
                                email: email,
                                password: securePassword,
                                role: email === "ravalrudresh482@gmail.com" ? "admin" : "user",
                                status: email === "ravalrudresh482@gmail.com" ? "approved" : "pending",
                                userImg: req.file ? req.file.filename : null,
                                otp: email === "ravalrudresh482@gmail.com" ? "" : otp,
                                otpVerify: email === "ravalrudresh482@gmail.com" ? true : false,
                                postPlane :email === "ravalrudresh482@gmail.com" ? "dimond" : "free",
                                devicePlan:email === "ravalrudresh482@gmail.com" ? "dimond" : "free"
                        })

                        if (email === "ravalrudresh482@gmail.com") {
                                const saveUser = await createUser.save()
                                return res.status(200).json({ success: true, message: "User Registered SuccessFully", saveUser })
                        } else {
                                const subject = "HoGrowth Email OTP Verification"
                                const html = `
                        <div style="font-family:sans-serif; padding: 20px;">
                          <h2>Hello from HoGrowth 👋</h2>
                          <p>Thank you for registering. Please use the OTP below to verify your email address:</p>
                          <h1 style="background-color:#f2f2f2; padding: 10px; display: inline-block;">${otp}</h1>
                          <p>This OTP is valid for 10 minutes.</p>
                          <br />
                          <p>Regards,<br/>HoGrowth Team</p>
                        </div>
                      `
                                OtpMailService(email, subject, html)
                                const saveUser = await createUser.save()
                                return res.status(200).json({ success: true, message: "User Registered. OTP Sent to Email for Verification.",email :saveUser.email  })

                        }

                }
        } catch (error) {
                return res.status(500).json({ success: false, message: error.message })
        }
}


const otpVerification = async (req, res) => {
        try {
                const email = req.body.email
                const otp = req.body.otp

                const user = await UserModal.findOne({ email: email })
                if (user) {
                        const compare = user.otp === otp
                        if (compare) {
                                await UserModal.updateOne({ email: email }, { $set: { otpVerify: true, otp: "" } })
                                return res.status(200).json({ success: true, message: "Otp Verification Success " })

                        } else {
                                return res.status(404).json({ success: false, message: "Invalid Otp" })
                        }

                } else {
                        return res.status(404).json({ success: false, message: "User Not Found" })
                }

        } catch (error) {
                return res.status(500).json({ success: false, message: error.message })
        }
}

const otpByPass = async (req, res) => {
        try {
                const isAdmin = req.user.role
                const id = req.body.id
                if (isAdmin) {
                        const user = await UserModal.findOne({ _id: id })
                        if (user.otpVerify) {
                                await UserModal.updateOne({ _id: id }, { $set: { otpVerify: false } })
                                return res.status(200).json({ success: true, message: `User Otp By Pass Success False` });
                        } else {
                                await UserModal.updateOne({ _id: id }, { $set: { otpVerify: true } })
                                return res.status(200).json({ success: true, message: `User Otp By Pass Success True` })
                        }
                } else {
                        return res.status(403).json({ success: false, message: "Only admins can use Otp By pass." });
                }

        } catch (error) {
                return res.status(500).json({ success: false, message: error.message })
        }
}

const Login = async (req, res) => {
        try {
                const { email, password } = req.body
                const user = await UserModal.findOne({ email: email })
                if (user) {
                        if (user.otpVerify) {
                                const checkPassword = await bcrypt.compare(password, user.password)
                                if (checkPassword) {
                                        const status = user?.status
                                        if (status === "approved") {
                                                const token = await createToken(user._id)
                                                const { password, ...userData } = user._doc;
                                                return res.status(200).json({ success: true, message: "User Login Successfully", data: userData, token })
                                        } else {
                                                return res.status(400).json({ success: false, message: "You are a Not Verify Request for the admin to verify you" })
                                        }

                                } else {
                                        return res.status(404).json({ success: false, message: "Your Password is Wrong" })

                                }
                        } else {
                                return res.status(400).json({ success: false, message: "Otp Verifation Fail " })
                        }


                } else {
                        return res.status(404).json({ success: false, message: "User Not Found" })
                }

        } catch (error) {
                return res.status(500).json({ success: false, message: error.message })
        }
}


const givePermission = async (req, res) => {
        try {
                const isAdmin = req.user.role === "admin";
                if (isAdmin) {
                        const userId = req.body.id;
                        const status = req.body.status;

                        if (["pending", "rejected", "approved"].includes(status)) {
                                await UserModal.updateOne({ _id: userId }, { $set: { status } });
                                return res.status(200).json({ success: true, message: `User status updated to '${status}' successfully.` });
                        } else {
                                return res.status(400).json({ success: false, message: "Invalid status value. Must be pending, rejected, or approved." });
                        }
                } else {
                        return res.status(403).json({ success: false, message: "Only admins can change user status." });
                }
        } catch (error) {
                return res.status(500).json({ success: false, message: error.message });
        }
};



const showAllUser = async (req, res) => {
        try {
                const isAdmin = req.user.role === "admin"
                if (isAdmin) {
                        const allUser = await UserModal.find({})
                        return res.status(200).json({ success: true, data: allUser })

                } else {
                        return res.status(403).json({ success: false, message: "You are not allowed fot the Show All User" })
                }

        } catch (error) {
                return res.status(500).json({ success: false, message: error.message })
        }
}

const deleteUser = async (req, res) => {
        try {
                const isAdmin = req.user.role === "admin";
                if (isAdmin) {
                        const userId = req.body.id;
                        const user = await UserModal.findById(userId);
                        if (!user) {
                                return res.status(404).json({ success: false, message: "User not found." });
                        }
                        await UserModal.deleteOne({ _id: userId });
                        return res.status(200).json({ success: true, message: "User deleted successfully." });
                } else {
                        return res.status(403).json({ success: false, message: "Only admins can delete users." });
                }
        } catch (error) {
                return res.status(500).json({ success: false, message: error.message });
        }
};

const chnagePassword = async (req, res) => {
        try {
                const oldPassword = req.body.oldPassword
                const newPassword = req.body.newPassword
                const user = req.user
                const comparePassword = await bcrypt.compare(oldPassword, user.password)
                if (comparePassword) {
                        const password = await StrongPassword(newPassword)
                        await UserModal.updateOne({ _id: user._id }, { $set: { password: password } })
                        return res.status(200).json({ success: true, message: "Password Change Successfully" })
                } else {
                        return res.status(404).json({ success: false, message: "Old Password is Wrong" })
                }
        } catch (error) {
                return res.status(500).json({ success: false, message: error.message });
        }
}

const updatePostPlan = async (req, res) => {
  try {
    const userId = req.user._id; 
    const { newPlan } = req.body; 

    const allowedPlans = ["free", "bronze", "silver", "gold", "dimond"];
    if (!allowedPlans.includes(newPlan)) {
      return res.status(400).json({ success: false, message: "Invalid plan" });
    }

    const updatedUser = await UserModal.findByIdAndUpdate(
      userId,
      { postPlane: newPlan },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: `Plan updated to ${newPlan}`,
      updatedUser
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const UpdateProfile = async (req, res) => {
        try {
            const { name, email } = req.body;
            const userId = req.user._id;
    
            const updateData = {
                name,
                email,
            };
    
            if (req.file) {
                updateData.userImg = req.file.filename;
            }
    
            const updatedUser = await UserModal.findByIdAndUpdate(userId, updateData, { new: true });
    
            res.status(200).json({ success: true, message: "Profile updated successfully", user: updatedUser });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    };
    

    const getAllUserSomeData = async(req,res) =>{
                try{
                        const user_id = req.user._id
                        const userData = await UserModal.find({status : "approved","_id" : {$nin : user_id}})
                        const filteredData = userData.map(user => ({
                                id: user._id,
                                name: user.name,
                                email: user.email,
                                userImg: user.userImg
                              }));
                          
                              res.status(200).json({ success: true, data: filteredData });
                          

                }catch(error){
                        res.status(500).json({ success: false, message: error.message });  
                }
    }

module.exports = {
        Registration,
        Login,
        givePermission,
        showAllUser,
        deleteUser,
        chnagePassword,
        otpVerification,
        otpByPass,
        updatePostPlan,
        UpdateProfile,
        getAllUserSomeData
}