const path = require('path')
const axios = require("axios")
const express = require('express')
var cron = require('node-schedule')
const config = require('./config')
const keybase = require('./helpers/keybase')
const {
  getDbValidators,
  getValidatorsToUpdateObj,
  addValidatorArray,
  removeValidatorArray,
  updateValidatorArray
} = require('./helpers/helpers')

const app = express()
const port = process.env.PORT || '8000'

var rule = new cron.RecurrenceRule();
rule.hours = 24
cron.scheduleJob(rule, async () => {
  console.log('Cronjob started, DB bein updated')
  //get refreshed keybase list of validators
  const keybaseObject = await keybase()
  //get all validators currently stored in DB
  try {
    const dbValidators = await getDbValidators()

    const {
      missingValidators,
      deleteValidators,
      updateValidators
    } = getValidatorsToUpdateObj(keybaseObject, dbValidators.data.data.validatorList)

    let postReqArray = addValidatorArray(missingValidators, keybaseObject)
    let deletionReqArray = removeValidatorArray(deleteValidators, keybaseObject)
    let updatingReqArray = updateValidatorArray(updateValidators, keybaseObject)
    
    Promise.all(postReqArray.concat(deletionReqArray, updatingReqArray))
      .then(response => {
        console.log('Response =', response[0])
      })
      .catch(error => {
        console.log('Error in Promise.all =', error)
      })

  } catch (error) {
    console.log('Error =', error)
    return
  }
  res.status(200).send('Server reached')
    
});


app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`)
})