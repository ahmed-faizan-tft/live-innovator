const User = require("../model/user");

const authentication = async (req, res) => {
    try {
        const { name, role } = req.body;
        if (!name || !role) {
            return res.status(400).json({ error: 'Name and role are required' });
        }
        
        const user = await User.create({ name, role });
        return res.status(200).json({ message: 'Authentication successful', data: user });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports = { authentication };
