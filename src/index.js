import styles from './styles.css'
import cloudy from '../asset/noaa-99F4mC79j1I-unsplash.jpg'
import displayWeather from './getWeather'

const bodyElem = document.querySelector('body')
bodyElem.style.backgroundImage = `url(${cloudy})`

displayWeather()
