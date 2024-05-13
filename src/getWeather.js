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

                // Setup forecast display
                const forecastData = data.forecast.forecastday
                setupForecastDisplay(data, forecastData, degreeSymbol)
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

    maxTempDiv.textContent = `H: ${data.forecast.forecastday[0].day.maxtemp_c}${degreeSymbol}`
    minTempDiv.textContent = `L: ${data.forecast.forecastday[0].day.mintemp_c}${degreeSymbol}`

    timeMaxMin.append(maxTempDiv)
    timeMaxMin.append(minTempDiv)
}

function setupForecastDisplay(data, forecastData, degreeSymbol) {
    const currentDate = format(new Date(), 'yyyy-MM-dd')
    const weatherIconRegex = /[0-9]+\.png/

    function hourlyIntervalDisplay() {
        // Forecast
        const currentCondition = document.getElementById('current-condition')
        const hourlyInterval = document.getElementById('hourly-interval')

        currentCondition.textContent = `Current weather condition: ${data.current.condition.text}`

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
                    hourTemp.textContent =
                        i === startFromIdx
                            ? data.current.temp_c + degreeSymbol
                            : forecastDayData.hour[i].temp_c + degreeSymbol

                    const hourlyForecastElems = [hour, hourWeatherIcon, hourTemp]
                    hourlyForecastElems.forEach((elem) => {
                        hourlyElem.append(elem)
                    })

                    hourlyInterval.append(hourlyElem)
                }

                // Display horizontal scroll bar in hourly interval display if number of elements is more than 4.
                if (Array.from(hourlyInterval.children).length > 4) {
                    hourlyInterval.className = 'info active'
                }
            }
        })
    }

    hourlyIntervalDisplay()

    // 5-day forecast display
    function fiveDayIntervalDisplay() {
        const fiveDayForecastHeading = document.getElementById('forecast-heading')
        fiveDayForecastHeading.textContent = '5-day Forecast'

        const fiveDayInterval = document.getElementById('day-interval')

        const days = document.createElement('div')
        days.className = 'days'

        const dayIntervalIcons = document.createElement('img')
        dayIntervalIcons.className = 'dayWeatherIcon'

        const minMaxDayTempContainer = document.createElement('div')
        minMaxDayTempContainer.className = 'minMaxDayTemp'

        const minDayTemp = document.createElement('div')
        minDayTemp.className = 'minDayTemp'

        const maxDayTemp = document.createElement('div')
        maxDayTemp.className = 'maxDayTemp'

        const minMaxDayBar = document.createElement('div')
        minMaxDayBar.className = 'minMaxDayBar'

        const minMaxDayRange = document.createElement('div')
        minMaxDayRange.className = 'minMaxDayRange'

        const minMaxDayPlacemark = document.createElement('div')
        minMaxDayPlacemark.className = 'minMaxDayPlacemark'

        minMaxDayBar.append(minMaxDayRange)
        minMaxDayBar.append(minMaxDayPlacemark)

        minMaxDayTempContainer.append(minDayTemp)
        minMaxDayTempContainer.append(minMaxDayBar)
        minMaxDayTempContainer.append(maxDayTemp)

        fiveDayInterval.append(days)
        fiveDayInterval.append(dayIntervalIcons)
        fiveDayInterval.append(minMaxDayTempContainer)

        // 5-day forecast display - set days, weather icon and min max temps.
        const fiveDayMinMaxTemps = []

        forecastData.forEach((forecastDataDay) => {
            fiveDayMinMaxTemps.push(forecastDataDay.day.maxtemp_c)
            fiveDayMinMaxTemps.push(forecastDataDay.day.mintemp_c)
        })

        // Store max and min temps for 5-day interval in the following variables
        const fiveDayMinTemp = Math.min(...fiveDayMinMaxTemps)
        const fiveDayMaxTemp = Math.max(...fiveDayMinMaxTemps)

        forecastData.forEach((forecastDataDay) => {
            if (isEqual(forecastDataDay.date, currentDate)) {
                // Set current day
                days.textContent = 'Today'

                // Set current weather icon
                const iconMatch = forecastDataDay.day.condition.icon.match(weatherIconRegex)[0]
                dayIntervalIcons.src = dayImages[iconMatch]

                // Set min and max temps
                minDayTemp.textContent = forecastDataDay.day.mintemp_c + degreeSymbol
                maxDayTemp.textContent = forecastDataDay.day.maxtemp_c + degreeSymbol

                // Dyanmically set range of minMaxDayRange based on normalized datapoints (e.g on a range of [0,1])

                // The max and min range of the bar is the max and min temps of the whole 5-day forecast
                // where the range of the coloured bar is the max and min temps of the given forecasted day.

                const normMinTemp = normalizeDataPoint(forecastDataDay.day.mintemp_c, fiveDayMaxTemp, fiveDayMinTemp)
                const normMaxTemp = normalizeDataPoint(forecastDataDay.day.maxtemp_c, fiveDayMaxTemp, fiveDayMinTemp)
                const normDataPoint = normalizeDataPoint(data.current.temp_c, fiveDayMaxTemp, fiveDayMinTemp)

                minMaxDayRange.style.width = `${normMaxTemp - normMinTemp}cqw`
                minMaxDayRange.style.marginLeft = `${normMinTemp}cqw`

                minMaxDayPlacemark.style.marginLeft = `${normDataPoint}cqw`
            }
        })
    }

    fiveDayIntervalDisplay()
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

function generateSpan(text) {
    const span = document.createElement('span')
    span.innerHTML = text

    return span
}

function normalizeDataPoint(dataPoint, largestPoint, lowestPoint) {
    const result = ((dataPoint - lowestPoint) / (largestPoint - lowestPoint)) * 100
    console.log(result)
    return result
}

// Get the following data
// 1. Current temperature (done)
// 2. Current time
// 2. Max and min temperatures (done)
// 3. Location (done)
// 4. Forecast (hourly interval, 5-day forecast) (done)

// Blur the different containers only, not the whole container.
