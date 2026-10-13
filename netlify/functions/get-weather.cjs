import axios from "axios"

export const handler = async function (event, context) {
  try {
    const apiKey = process.env.WEATHER_API_KEY

    const { endpoint, q, days } = event.queryStringParameters

    if (!endpoint) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "The endpoint parameter is required. (forecast.json or search.json)" })
      }
    }

    const response = await axios.get('https://api.weatherapi.com/v1/' + endpoint, {
      params: {
        key: apiKey,
        q: q,
        days: days || 3
      }
    })

    console.log('RESP: ', response)

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=600"
      },
      body: JSON.stringify(response.data)
    }
  } catch (err) {
    return {
      statusCode: err.response ? err.response.status : 500,
      body: JSON.stringify({ error: "The API error of Weather Status", details: err.message })
    }
  }
}