import myKey from '../ignore/myKey.js'

export default function displayWeather() {
    const form = document.querySelector('form')
    const mainDisplay = document.getElementById('main-display')
    const forecast = document.getElementById('forecast')

    form.addEventListener('submit', (e) => {
        e.preventDefault()
        const formData = new FormData(form)

        const location = formData.get('search-location')
        console.log(location)

        const weatherData = getWeatherData(location)

        weatherData.then((data) => {
            console.log(data)

            const temperature = document.getElementById('temperature')
            temperature.textContent = data.current.temp_c

            const location = document.getElementById('location')
            location.textContent = `${data.location.name}, ${data.location.country}`

            const timeMinMax = document.getElementById('time-max-min')
            timeMinMax.textContent = `H: ${data.forecast.forecastday[0].day.maxtemp_c}   L: ${data.forecast.forecastday[0].day.mintemp_c}`
        })
    })
}

async function getWeatherData(location) {
    const forecastAPI = new URL('http://api.weatherapi.com/v1/forecast.json')

    forecastAPI.searchParams.append('key', myKey)
    forecastAPI.searchParams.append('q', location)
    forecastAPI.searchParams.append('days', 5)

    // Process response here.
    try {
        let forecastResponse = await fetch(forecastAPI)

        if (forecastResponse.ok) {
            let data = await forecastResponse.json()
            return data
        } else {
            let errorMsg = await forecastResponse.json()

            if (errorMsg.error.code === 1006) throw new Error('No location found')
        }
    } catch (err) {
        console.error(err)
    }
}

// Get the following data
// 1. Current temperature
// 2. Current time
// 2. Max and min temperatures
// 3. Location
// 4. Forecast
