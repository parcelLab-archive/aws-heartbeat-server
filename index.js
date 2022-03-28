const Cache = require('cache')

const { GraphQLClient, gql } = require('graphql-request')
const graphQlUri = 'https://zelda.parcellab.com/graphql-next'
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
  let thresholdHrs
  if (event.queryStringParameters !== null && event.queryStringParameters !== undefined) {
    if (event.queryStringParameters.host &&
      event.queryStringParameters.category &&
      event.queryStringParameters.type &&
      event.queryStringParameters.name) {
      host = event.queryStringParameters.host
      category = event.queryStringParameters.category
      type = event.queryStringParameters.type
      name = event.queryStringParameters.name
      thresholdHrs = 25
      if (category === "manfred") {
        thresholdHrs = 0
      }
      const ts = cache.get(`${type}-${name}-${category}-${host}`)
      if (!(ts && ts > new Date(new Date() - 15 * 60 * 1000))) {
        cache.put(`${type}-${name}-${category}-${host}`, new Date())
        try {
          const query = gql`
          mutation createHeartbeat($name: String!, $category: String!, $host: String!, $type: String!,$lastSuccessAt: DateTime!, $thresholdHrs: Int!, $status: AlertStatus!){
            updateCreateHeartbeat(input: { hostName: $host, category: $category, type: $type, name: $name ,lastSuccessAt: $lastSuccessAt, thresholdHrs: $thresholdHrs, status: $status}) {
          ... on LegacyHeartbeatType {
                id
                hostName
                category
                type
                name
                lastSuccessAt
                thresholdHrs
                status
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
            status: "CLOSED"
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
