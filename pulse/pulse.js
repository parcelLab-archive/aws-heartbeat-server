const crypto = require('crypto')
const Cache = require('cache')

const { GraphQLClient, gql } = require('graphql-request')
const graphQlUri = 'https://zelda.parcellab.com/graphql'
const graphQLClient = new GraphQLClient(graphQlUri, {
  headers: {
    Authorization: 'Token ' + process.env.ZELDA_AUTH_TOKEN
  }
})

const cache = new Cache(15 * 60 * 1000)

exports.handler = function (event, context, callback) {
  let host
  let category
  let type
  let name
  let timestamp
  let threshold = '25' // default value - 25 hours

  if (event.queryStringParameters !== null && event.queryStringParameters !== undefined) {
    if (event.queryStringParameters.host &&
      event.queryStringParameters.category &&
      event.queryStringParameters.type &&
      event.queryStringParameters.name) {
      host = event.queryStringParameters.host
      category = event.queryStringParameters.category
      type = event.queryStringParameters.type
      name = event.queryStringParameters.name
      if (event.queryStringParameters.threshold) threshold = event.queryStringParameters.threshold
      timestamp = new Date().toISOString()
      let thresholdHrs = 25
      try {
        thresholdHrs = parseInt(threshold)
        if (isNaN(thresholdHrs)) thresholdHrs = 25
      } catch {
        console.log(`failed to convert thresholdHrs to int for ${type}-${name}-${category}-${host}`)
      }

      const ts = cache.get(`${type}-${name}-${category}-${host}`)
      if (!(ts && ts > new Date(new Date() - 15 * 60 * 1000))) {
        cache.put(`${type}-${name}-${category}-${host}`, new Date())
        try {
          const query = gql`
            mutation createHeartbeat ($name: String!,$category: String!,$host: String!,$type: String!,$thresholdHrs: Int!,$lastSuccessAt: DateTime!,$status: String! ){
            updateCreateHeartbeat(input: {name: $name, category: $category, hostName: $host, type: $type, thresholdHrs: $thresholdHrs, lastSuccessAt: $lastSuccessAt, status: $status}) {
              id
              name
              type
              category
              hostName
              customerId
              snoozedUntil
              thresholdHrs
              errors {
                field
                messages
              }
            }
            }
          `
          const variables = {
            name: name,
            category: category,
            host: host,
            type: type,
            lastSuccessAt: new Date(Date.now()),
            thresholdHrs: thresholdHrs,
            status: 'closed'
          }
          graphQLClient.request(query, variables)
            .then((data) => console.log('debug', 'pulseLegacyHeartbeatZelda', `Zelda replied with: ${JSON.stringify(data)}`))
            .catch((err) => {
              console.log('error', 'pulseLegacyHeartbeatZelda', `Failed call createHeartbeat mutation - ${err}`)
            })
        } catch {
          console.log(`failed to send to zelda for ${type}-${name}-${category}-${host}`)
        }
      }
    }
  }
}
