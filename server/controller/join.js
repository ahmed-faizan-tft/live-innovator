const Join = require("../model/join");

const create = async (req, res) => {
    try {
        const { sessionId, code } = req.body;
        if (!sessionId || !code) {
            return res.status(400).json({ error: 'sessionId and code are required' });
        }
        
        const join = await Join.create({ sessionId, code });
        return res.status(200).json({ message: 'Authentication successful', data: join });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const getCode = async (req, res) => {
    try {
        const { sessionId, code } = req.params;
        
        if (!sessionId ||!code) {
            return res.status(400).json({ error: 'sessionId and code are required' });
        }
        const data = await Join.findOne({ sessionId, code}).lean()
        if(data)
            return res.status(200).json({ message: 'Authentication successful', data: {...data, isPresent:true} });
        return res.status(200).json({ message: 'Authentication successful', data: {isPresent:false} });
    } catch (error) {
        return res.status(500).json({ message: error.message });
        
    }
}

module.exports = { create, getCode };
