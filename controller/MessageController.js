const MessageModal = require("../model/MessageModal")

const sendMessage = async(req,res) =>{
        try{
            const { receiverId, message } = req.body;
            const newMessage = new MessageModal({
                sender: req.user._id,
                receiver: receiverId,
                message,
              });
              await newMessage.save();
              res.status(200).json({ success: true, data: newMessage });
        }catch(error){
            return res.status(500).json({ success: false, message: error.message })
        }
}   

const ReceiverMessage = async(req,res) =>{
    try{
        const messages = await MessageModal.find({
            $or : [
                { sender: req.user._id, receiver: req.params.receiverId },
                { sender: req.params.receiverId, receiver: req.user._id }
            ]
        }).sort({ createdAt: 1 });

        res.status(200).json({ success: true, data: messages });

    }catch(error){
        return res.status(500).json({ success: false, message: error.message })
    }
}

module.exports = {
    ReceiverMessage,
    sendMessage
}