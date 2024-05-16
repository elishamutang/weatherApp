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

        // Loading when fetching data
        if (!document.querySelector('.loader')) {
            insertLoader()
        }

        weatherData
            .then((data) => {
                console.log(data)

                const degreeSymbol = '\u2103'

                // Remove loading icon after finished fetching data.
                document.querySelector('.loader').remove()

                // Setup main display
                setupMainDisplay(data, degreeSymbol)

                // Setup forecast display
                const forecastData = data.forecast.forecastday
                setupForecastDisplay(data, forecastData, degreeSymbol)
            })
            .catch((err) => {
                console.error(err)

                document.getElementById('main-display').className = 'panel'
                Array.from(document.getElementsByClassName('forecast-info')).forEach((div) => {
                    div.className = 'forecast-info'
                })
            })
    })
}

function setupMainDisplay(data, degreeSymbol) {
    // Main display
    const temperature = document.getElementById('temperature')
    const location = document.getElementById('location')
    const timeMaxMin = document.getElementById('time-max-min')

    // Show blurred container
    const mainDisplay = document.getElementById('main-display')
    mainDisplay.className = 'panel show'

    // Populate main display
    const tempReading = document.createElement('h1')
    tempReading.textContent = data.current.temp_c

    const tempReadingSpan = generateSpan(degreeSymbol)
    tempReading.append(tempReadingSpan)

    temperature.append(tempReading)

    const locationHeading = document.createElement('p')
    locationHeading.textContent = `${data.location.name}, ${data.location.country}`

    location.append(locationHeading)

    const timeDiv = document.createElement('div')

    const maxTempDiv = document.createElement('div')
    const minTempDiv = document.createElement('div')

    timeDiv.textContent = `${format(data.current.last_updated, 'HH:mm')}`
    maxTempDiv.textContent = `H: ${data.forecast.forecastday[0].day.maxtemp_c}${degreeSymbol}`
    minTempDiv.textContent = `L: ${data.forecast.forecastday[0].day.mintemp_c}${degreeSymbol}`

    timeMaxMin.append(timeDiv)
    timeMaxMin.append(maxTempDiv)
    timeMaxMin.append(minTempDiv)
}

function setupForecastDisplay(data, forecastData, degreeSymbol) {
    const currentDate = format(new Date(), 'yyyy-MM-dd')
    const weatherIconRegex = /[0-9]+\.png/

    // Show blurred containers
    const forecastChildDivs = Array.from(document.getElementById('forecast').children)
    forecastChildDivs.forEach((div) => {
        div.className = 'forecast-info show'
    })

    function hourlyIntervalDisplay() {
        // Forecast
        const currentCondition = document.getElementById('current-condition')
        const hourlyInterval = document.getElementById('hourly-interval')

        currentCondition.textContent = `Current weather condition: ${data.current.condition.text}`
        currentCondition.className = 'info heading active-border'

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
                            ? Math.round(data.current.temp_c) + degreeSymbol
                            : Math.round(forecastDayData.hour[i].temp_c) + degreeSymbol

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
    function dayIntervalDisplay() {
        const dayForecastHeading = document.getElementById('forecast-heading')
        dayForecastHeading.textContent = '5-day Forecast'
        dayForecastHeading.className = 'info heading active-border'

        const dayInterval = document.getElementById('day-interval')

        // 5-day forecast display - set days, weather icon and min max temps.
        const weekMinMaxTemps = []

        forecastData.forEach((forecastDataDay) => {
            weekMinMaxTemps.push(forecastDataDay.day.maxtemp_c)
            weekMinMaxTemps.push(forecastDataDay.day.mintemp_c)
        })

        // Store max and min temps for 5-day interval in the following variables
        const weekMinTemp = Math.min(...weekMinMaxTemps)
        const weekMaxTemp = Math.max(...weekMinMaxTemps)

        forecastData.forEach((forecastDataDay) => {
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

            minMaxDayBar.append(minMaxDayRange)

            minMaxDayTempContainer.append(minDayTemp)
            minMaxDayTempContainer.append(minMaxDayBar)
            minMaxDayTempContainer.append(maxDayTemp)

            dayInterval.append(days)
            dayInterval.append(dayIntervalIcons)
            dayInterval.append(minMaxDayTempContainer)

            // Set current weather icon
            const iconMatch = forecastDataDay.day.condition.icon.match(weatherIconRegex)[0]
            dayIntervalIcons.src = dayImages[iconMatch]

            // Set min and max temps
            minDayTemp.textContent = Math.round(forecastDataDay.day.mintemp_c) + degreeSymbol
            maxDayTemp.textContent = Math.round(forecastDataDay.day.maxtemp_c) + degreeSymbol

            // Dyanmically set range of minMaxDayRange based on normalized datapoints (e.g on a range of [0,1])

            // The max and min range of the bar is the max and min temps of the whole 5-day forecast
            // where the range of the coloured bar is the max and min temps of the given forecasted day.

            const normMinTemp = normalizeDataPoint(forecastDataDay.day.mintemp_c, weekMaxTemp, weekMinTemp)
            const normMaxTemp = normalizeDataPoint(forecastDataDay.day.maxtemp_c, weekMaxTemp, weekMinTemp)

            minMaxDayRange.style.width = `${normMaxTemp - normMinTemp}cqw`
            minMaxDayRange.style.marginLeft = `${normMinTemp}cqw`

            if (isEqual(forecastDataDay.date, currentDate)) {
                // Set current day
                days.textContent = 'Today'

                // Set normalized current temp of the day.
                const normDataPoint = normalizeDataPoint(data.current.temp_c, weekMaxTemp, weekMinTemp)

                const minMaxDayPlacemark = document.createElement('div')
                minMaxDayPlacemark.className = 'minMaxDayPlacemark'

                minMaxDayBar.append(minMaxDayPlacemark)

                minMaxDayPlacemark.style.marginLeft = `${normDataPoint}cqw`
            } else {
                // Format day
                days.textContent = format(forecastDataDay.date, 'EEE')
            }
        })
    }

    dayIntervalDisplay()
}

// Fetch weather data.
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
        alert(err)
    }
}

function generateSpan(text) {
    const span = document.createElement('span')
    span.innerHTML = text

    return span
}

function normalizeDataPoint(dataPoint, largestPoint, lowestPoint) {
    const result = ((dataPoint - lowestPoint) / (largestPoint - lowestPoint)) * 100

    const normalizedResult = result >= 0 ? result : result * -1
    return normalizedResult
}

function insertLoader() {
    const blurSect = document.querySelector('.blur-sect')

    const loader = document.createElement('div')
    loader.className = 'loader'

    blurSect.insertAdjacentElement('afterbegin', loader)

    document.getElementById('main-display').className = 'panel'
    Array.from(document.getElementsByClassName('forecast-info')).forEach((div) => {
        div.className = 'forecast-info'
    })

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

    const headings = Array.from(document.getElementsByClassName('heading'))

    headings.forEach((heading) => {
        heading.textContent = ''

        if (Array.from(heading.classList).includes('active-border')) {
            heading.className = Array.from(heading.classList)
                .filter((className) => {
                    return className !== 'active-border'
                })
                .join(' ')
        }
    })
}
