const axios = require("axios")
const config = require('../config')
const queries = require('./queries')


exports.getDbValidators = () => {
  return axios({
    url: `${config.hasura_url}`,
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'x-hasura-admin-secret': config.hasura_admin_key
    },
    data: {
      query: queries.allValidators
    }
  })
}


exports.getValidatorsToUpdateObj = (keybaseObject, dbValidators) => {
  let missingValidators = Object.keys(keybaseObject)
  const deleteValidators = []
  const updateValidators = []
  dbValidators.forEach(dbValidatorObj => {
    let indexOfValidator = missingValidators.indexOf(dbValidatorObj.keybaseId)
    if (indexOfValidator >= 0) {
      //check if db entries content is up to date
      let singleKeybaseObj = keybaseObject[dbValidatorObj.keybaseId]
      if (
        !dbValidatorObj.customized && 
        (Object.keys(singleKeybaseObj).length === 5) &&
        (
          dbValidatorObj.avatarUrl !== singleKeybaseObj.avatarUrl ||
          dbValidatorObj.userName !== singleKeybaseObj.userName ||
          dbValidatorObj.profileUrl !== singleKeybaseObj.profileUrl
        )
      ) {
        updateValidators.push(singleKeybaseObj.keybaseId)
      }

      missingValidators.splice(indexOfValidator, 1)
    }
    if (indexOfValidator < 0) {
      deleteValidators.push(dbValidatorObj.keybaseId)
    }
  })

  //Edge case validation for validators that have a non keybase id for their keybase id
  missingValidators = missingValidators.filter(keybaseId => {
    return keybaseId.length === 16 &&
      Object.keys(keybaseObject[keybaseId]).length >= 5
  })
  
  const validatorsToUpdateObj = {
    missingValidators,
    deleteValidators,
    updateValidators
  }

  return validatorsToUpdateObj;
}

exports.addValidatorArray = (missingValidators, keybaseObject) => {
  const postReqArray = []
  missingValidators.forEach(keybaseId => {
    let validator = keybaseObject[keybaseId]
    postReqArray.push(axios({
      url: `${config.hasura_url}`,
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'x-hasura-admin-secret': config.hasura_admin_key
      },
      data: {
        query: `
          mutation {
            insert_validatorList(
              objects: {
                keybaseId: ${JSON.stringify(validator.keybaseId)},
                avatarUrl: ${JSON.stringify(validator.avatarUrl)},
                userName: ${JSON.stringify(validator.userName)},
                profileUrl: ${JSON.stringify(validator.profileUrl)}
              }
            )
            {returning {id}}
          }
        `
      }
    }))
  })
  return postReqArray
}

exports.removeValidatorArray = (deleteValidators, keybaseObject) => {
  const deletionReqArray = []
  deleteValidators.forEach(keybaseId => {
    let validator = keybaseObject[keybaseId]
    deletionReqArray.push(axios({
      url: `${config.hasura_url}`,
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'x-hasura-admin-secret': config.hasura_admin_key
      },
      data: {
        query: `
          mutation {
            delete_validatorList(
              where: {
                keybaseId: {
                  _eq: ${JSON.stringify(validator.keybaseId)}
                }
              }
            )
            {returning {id}}
          }
        `
      }
    }))
  })
  return deletionReqArray
}

exports.updateValidatorArray = (updateValidators, keybaseObject) => {
  const updateReqArray = []
  updateValidators.forEach(keybaseId => {
    let validator = keybaseObject[keybaseId]
    updateReqArray.push(axios({
      url: `${config.hasura_url}`,
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'x-hasura-admin-secret': config.hasura_admin_key
      },
      data: {
        query: `
          mutation {
            update_validatorList(
              where: {
                keybaseId: {
                  _eq: ${JSON.stringify(validator.keybaseId)}
                }
              },
              _set: {
                avatarUrl: ${JSON.stringify(validator.avatarUrl)},
                userName: ${JSON.stringify(validator.userName)},
                profileUrl: ${JSON.stringify(validator.profileUrl)}
              }
            ) {
              returning {
                keybaseId
              }
            }
          }
        `
      }
    }))
  })
  return updateReqArray
}