import styles from './styles.css'
import background from '../asset/noaa-99F4mC79j1I-unsplash.jpg'
import displayWeather from './getWeather'

const backgroundImg = document.createElement('img')
backgroundImg.id = 'backgroundImg'
backgroundImg.src = background

const body = document.querySelector('body')

body.insertAdjacentElement('afterbegin', backgroundImg)

displayWeather()
