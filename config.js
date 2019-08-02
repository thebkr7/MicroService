const dotenv = require('dotenv');
dotenv.config()

const config = {
  hasura_admin_key: process.env.hasura_admin_key || '',
  hasura_url: 'https://backend.lunie.io/v1/graphql'
}

module.exports = config