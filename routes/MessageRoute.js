const express = require("express")
const auth = require("../middleware/auth")
const { ReceiverMessage, sendMessage } = require("../controller/MessageController")

const MessageRoute = express()
MessageRoute.use(express.json())


MessageRoute.get("/message/get/:receiverId",auth,ReceiverMessage)
MessageRoute.post("/message/send",auth,sendMessage)


module.exports = MessageRoute