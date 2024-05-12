import myKey from '../ignore/myKey.js'
import { format, isEqual, getHours } from 'date-fns'
import { dayImages, nightImages } from './importWeatherIcons.js'

export default function displayWeather() {
    const form = document.querySelector('form')

    form.addEventListener('submit', (e) => {
        e.preventDefault()
        const formData = new FormData(form)

        const location = formData.get('search-location')
        console.log(location)

        const weatherData = getWeatherData(location)

        weatherData
            .then((data) => {
                console.log(data)

                const degreeSymbol = '\u2103'

                // Clear existing data
                const infoElems = Array.from(document.getElementsByClassName('info'))

                infoElems.forEach((elem) => {
                    if (elem.hasChildNodes()) {
                        const elemChildren = Array.from(elem.children)

                        elemChildren.forEach((child) => {
                            child.remove()
                        })
                    }
                })

                // Setup main display
                setupMainDisplay(data, degreeSymbol)

                // Forecast
                const currentCondition = document.getElementById('current-condition')
                const hourlyInterval = document.getElementById('hourly-interval')

                currentCondition.textContent = `Current weather condition: ${data.current.condition.text}`

                const forecastData = data.forecast.forecastday

                const currentDate = format(new Date(), 'yyyy-MM-dd')

                const weatherIconRegex = /[0-9]+\.png/

                // Generate hourly forecast for current day/date
                forecastData.forEach((forecastDayData) => {
                    if (isEqual(forecastDayData.date, currentDate)) {
                        // Set hour
                        const [startFromIdx] = forecastDayData.hour
                            .filter((hour) => {
                                return getHours(hour.time) === getHours(new Date())
                            })
                            .map((value) => {
                                return getHours(value.time)
                            })

                        for (let i = startFromIdx; i < forecastDayData.hour.length; i++) {
                            console.log(forecastDayData.hour[i])

                            const hourlyElem = document.createElement('div')
                            hourlyElem.className = 'hourlyElem'

                            const hour = document.createElement('div')
                            hour.className = 'hour'
                            hour.textContent = i === startFromIdx ? 'Now' : `${getHours(forecastDayData.hour[i].time)}`

                            const hourWeatherIcon = document.createElement('img')
                            hourWeatherIcon.className = 'hourWeatherIcon'

                            const iconMatch = forecastDayData.day.condition.icon.match(weatherIconRegex)[0]

                            if (forecastDayData.hour[i].is_day === 1) {
                                // Day time
                                hourWeatherIcon.src = dayImages[iconMatch]
                            } else if (forecastDayData.hour[i].is_day === 0) {
                                // Night time
                                hourWeatherIcon.src = nightImages[iconMatch]
                            }

                            const hourTemp = document.createElement('div')
                            hourTemp.className = 'hourTemp'
                            hourTemp.textContent = data.current.temp_c + degreeSymbol

                            const hourlyForecastElems = [hour, hourWeatherIcon, hourTemp]
                            hourlyForecastElems.forEach((elem) => {
                                hourlyElem.append(elem)
                            })

                            hourlyInterval.append(hourlyElem)
                        }
                    }
                })
            })
            .catch((err) => {
                console.error(err)
            })
    })
}

function setupMainDisplay(data, degreeSymbol) {
    // Main display
    const temperature = document.getElementById('temperature')
    const location = document.getElementById('location')
    const timeMaxMin = document.getElementById('time-max-min')

    // Populate main display
    const tempReading = document.createElement('h1')
    tempReading.textContent = data.current.temp_c

    const tempReadingSpan = generateSpan(degreeSymbol)
    tempReading.append(tempReadingSpan)

    temperature.append(tempReading)

    location.textContent = `${data.location.name}, ${data.location.country}`

    const maxTempDiv = document.createElement('div')
    const minTempDiv = document.createElement('div')

    const maxTempSpan = generateSpan(degreeSymbol)
    const minTempSpan = generateSpan(degreeSymbol)

    maxTempDiv.textContent = `H: ${data.forecast.forecastday[0].day.maxtemp_c}`
    minTempDiv.textContent = `L: ${data.forecast.forecastday[0].day.mintemp_c}`

    maxTempDiv.append(maxTempSpan)
    minTempDiv.append(minTempSpan)

    timeMaxMin.append(maxTempDiv)
    timeMaxMin.append(minTempDiv)
}

function setupForecastDisplay() {}

async function getWeatherData(location) {
    const forecastAPI = new URL('http://api.weatherapi.com/v1/forecast.json')

    forecastAPI.searchParams.append('key', myKey)
    forecastAPI.searchParams.append('q', location)
    forecastAPI.searchParams.append('days', 3)

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

function generateSpan(text) {
    const span = document.createElement('span')
    span.innerHTML = text

    return span
}

// Get the following data
// 1. Current temperature (done)
// 2. Current time
// 2. Max and min temperatures (done)
// 3. Location (done)
// 4. Forecast (hourly interval, 5-day forecast)

// Blur the different containers only, not the whole container.
