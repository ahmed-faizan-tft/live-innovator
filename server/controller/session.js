const Session = require("../model/session");
const  {get:getCache, set:setCache}= require("../cache")

const create = async (req, res) => {
    try {
        const { sessionId, name, template, stages, activeStage, currentStage } = req.body;
        if (!sessionId || !name || !stages || !activeStage || !currentStage) {
            return res.status(400).json({ error: 'sessionId and name are required' });
        }
        const session = await Session.create({ sessionId, name });
        setCache(`template-${sessionId}`, template)
        setCache(`stages-${sessionId}`, stages)
        setCache(`activeStage-${sessionId}`, activeStage)
        setCache(`currentStage-${sessionId}`, currentStage)
        
        return res.status(200).json({ message: 'Session successful', sessionId });
    } catch (error) {
        return res.status(500).json({ message: error.message});
    }
  }

  const getSessionData = async (req, res) => {
    const { sessionId} = req.params;
    const data = getCache(sessionId);
    const lockedData = getCache(`locked-session-id-${sessionId}`)
    const templateData = getCache(`template-${sessionId}`)
    const stagesData = getCache(`stages-${sessionId}`)
    const activeStageData = getCache(`activeStage-${sessionId}`)
    const currentStageData = getCache(`currentStage-${sessionId}`)
    const isStageBlockedData = getCache(`isBlocked-${sessionId}`)
    const finalizeStageData = getCache(`finalizeStage-${sessionId}`)
    const commentsData = getCache(`comments-${sessionId}`)
    const stagesPostsData = getCache(`stagesPosts-${sessionId}`)
    const actualDeckElementsData = getCache(`actualDeckElements-${sessionId}`)
    const priorityCombinedPostData = getCache(`priorityCombinedPost-${sessionId}`)
    const priorityPostsEachUserData = getCache(`priorityPostsEachUser-${sessionId}`)
    return res.status(200).json({sessionId, data, lockedData, templateData, stagesData, activeStageData, currentStageData, isStageBlockedData, finalizeStageData, commentsData, stagesPostsData, actualDeckElementsData,
        priorityCombinedPostData,
        priorityPostsEachUserData
    });
  }

  module.exports = {create,getSessionData}