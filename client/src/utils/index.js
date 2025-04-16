export const isUserOwnerOrFaciliator = (userIdInElement, userId, role,ActiveStage) => {
    if(ActiveStage === "prioritize") return true;
    return userIdInElement === userId || role === 'facilitator';
}