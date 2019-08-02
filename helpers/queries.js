const queries = {
  allValidators: `
    query {
      validatorList {
        avatarUrl
        keybaseId
        lastUpdated
        profileUrl
        userName
        customized
      }
    }
  `
}
module.exports = queries