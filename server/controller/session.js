const Session = require("../model/session");
const  {get:getCache}= require("../cache")

const create = async (req, res) => {
    try {
        const { sessionId, name } = req.body;
        if (!sessionId || !name) {
            return res.status(400).json({ error: 'sessionId and name are required' });
        }
        const session = await Session.create({ sessionId, name });
        return res.status(200).json({ message: 'Session successful', sessionId });
    } catch (error) {
        return res.status(500).json({ message: error.message, data:session });
    }
  }

  const getSessionData = async (req, res) => {
    const { sessionId} = req.params;
    const data = getCache(sessionId);
    return res.status(200).json({sessionId, data});
  }

  module.exports = {create,getSessionData}