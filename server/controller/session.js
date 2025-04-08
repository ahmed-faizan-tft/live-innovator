const Session = require("../model/session");
const  {get:getCache, set:setCache}= require("../cache")

const create = async (req, res) => {
    try {
        const { sessionId, name, template } = req.body;
        if (!sessionId || !name) {
            return res.status(400).json({ error: 'sessionId and name are required' });
        }
        const session = await Session.create({ sessionId, name });
        setCache(`template-${sessionId}`, template)
        
        return res.status(200).json({ message: 'Session successful', sessionId });
    } catch (error) {
        return res.status(500).json({ message: error.message, data:session });
    }
  }

  const getSessionData = async (req, res) => {
    const { sessionId} = req.params;
    const data = getCache(sessionId);
    const lockedData = getCache(`locked-session-id-${sessionId}`)
    const templateData = getCache(`template-${sessionId}`)
    
    return res.status(200).json({sessionId, data, lockedData, templateData});
  }

  module.exports = {create,getSessionData}