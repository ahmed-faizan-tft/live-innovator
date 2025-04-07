const Template = require('../model/templates'); 

const getAllTemplates = async (req, res) => {
    try {
        const templates = await Template.find({}).lean();

        return res.status(200).json({
            message: 'Templates fetched successfully',
            data: templates
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};


const getTemplate = async (req, res) => {
    try {
        const {templateId} = req.params;
        if (!templateId) {
            return res.status(400).json({
                message: 'Template ID is required'
            });
        }
        const template = await Template.findById(templateId).lean();

        return res.status(200).json({
            message: 'Templates fetched successfully',
            data: template
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

module.exports = { getAllTemplates, getTemplate };
