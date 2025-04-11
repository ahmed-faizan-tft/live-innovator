const activeStageEnum = {
    collection:"enrich",
    enrich: "prioritize",
    prioritize: "conclusion"
}

const moveStageEnum = {
    collection: ["collection"],
    enrich: ["collection", "enrich"],
    prioritize: ["collection", "enrich", "prioritize"],
    conclusion: ["collection", "enrich", "prioritize", "conclusion"],
}

export default activeStageEnum
export {
    moveStageEnum
}