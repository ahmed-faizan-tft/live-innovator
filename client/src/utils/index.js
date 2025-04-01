export const isUserOwnerOrFaciliator = (userIdInElement, userId, role) => {
    return userIdInElement === userId || role === 'facilitator';
}