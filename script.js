function fetchData(requestUrl, method, callback) {
  const xhr = new XMLHttpRequest() // конструктор глобального класса

  xhr.open(method, requestUrl)

  xhr.onload = function () {
    if (xhr.status == 200) {
      callback(xhr.response)
    } else {
      console.error(xhr.statusText + ':' + xhr.status)
    }
  }

  xhr.send()
}

// ---------------------------------------------------------------------------

const key = 'c776801ab12832a291a494178fce4a15'
const urlWetherCurrent = `https://api.openweathermap.org/data/2.5/weather?q=Minsk&appid=${key}`
const urlWetherByDays = `https://api.openweathermap.org/data/2.5/forecast?q=Minsk&appid=${key}`

// WIDGET MAIN ----------------------------------------------------------------------------

function widgetTemplateMain(weatherData) {
  const {
    city,
    countryCode,
    time,
    resultTemp,
    description,
    iconSrc,
    dayName,
    date,
  } = weatherData

  return `
    <div class="weather-gradient"></div>
    <div class="date-container">
        <h2 class="date-dayname">${dayName}</h2>
        <span class="date-day">${date}</span>
        <span class="time">${time}</span>
        <i class="fas fa-map-marker-alt location-icon"></i>
        <span class="location">${city}, ${countryCode}</span>
    </div>
    <div class="weather-container">
        <img class="weather-icon" src="${iconSrc}" alt="weather icon">
        <h1 class="weather-temp">${resultTemp}&#8451;</h1>
        <h3 class="weather-desc">${description}</h3>
    </div>
  `
}

function widgetTemplateAside(weatherData) {
  const { windName, windSpeed, humidity, pressure } = weatherData

  return `
    <div class="today-info">
      <div class="pressure">
          <span class="title">PRESSURE</span>
          <span class="value">${pressure} hPa</span>
      </div>
      <div class="humidity">
          <span class="title">HUMIDITY</span>
          <span class="value">${humidity} %</span>
      </div>
      <div class="wind">
          <span class="title">WIND: ${windName}</span>
          <span class="value">${windSpeed} m/s</span>
      </div>            
    </div>
  `
}

function renderMainPart(data) {
  document.querySelector('.weather-side').innerHTML = widgetTemplateMain(data)
  document.querySelector('.today-info-container').innerHTML =
    widgetTemplateAside(data)
}

fetchData(urlWetherCurrent, 'GET', (response) => {
  const data = JSON.parse(response)

  const [
    city,
    windDeg,
    windSpeed,
    countryCode,
    time,
    temp,
    description,
    iconSrc,
    humidity,
    pressure,
    dayName,
    date,
  ] = [
    data.name,
    data.wind.deg,
    Math.round(data.wind.speed),
    data.sys.country,
    (new Date(data.dt * 1000).getHours() < 10 ? '0' : '') +
      new Date(data.dt * 1000).getHours() +
      ':' +
      (new Date(data.dt * 1000).getMinutes() < 10 ? '0' : '') +
      new Date(data.dt * 1000).getMinutes(),
    Math.round(data.main.temp - 273.15),
    data.weather[0].description,
    `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
    data.main.humidity,
    data.main.pressure,
    new Date(data.dt * 1000).toLocaleString('en-us', { weekday: 'long' }),
    new Date(data.dt * 1000).toLocaleString('en-us', {
      day: 'numeric',
    }) +
      ' ' +
      new Date(data.dt * 1000).toLocaleString('en-us', {
        month: 'short',
        year: 'numeric',
      }),
  ]

  const resultTemp = temp == 0 ? '' + temp : temp > 0 ? '+' + temp : temp

  let windName
  switch (true) {
    case windDeg > 337 && windDeg <= 22:
      windName = 'North'
      break
    case windDeg > 22 && windDeg <= 67:
      windName = 'North-East'
      break
    case windDeg > 67 && windDeg <= 112:
      windName = 'East'
      break
    case windDeg > 112 && windDeg <= 157:
      windName = 'East-South'
      break
    case windDeg > 157 && windDeg <= 202:
      windName = 'South'
      break
    case windDeg > 202 && windDeg <= 267:
      windName = 'South-West'
      break
    case windDeg > 267 && windDeg <= 292:
      windName = 'West'
      break
    case windDeg > 292 && windDeg <= 337:
      windName = 'West-North'
      break
  }

  renderMainPart({
    city,
    windName,
    windSpeed,
    countryCode,
    time,
    resultTemp,
    description,
    iconSrc,
    humidity,
    pressure,
    dayName,
    date,
  })
})

// WIDGET ITEMS --------------------------------------------------------------------

function widgetItemTemplate(dayName, date, time, iconSrc, temp) {
  const resultTemp = temp == 0 ? '' + temp : temp > 0 ? '+' + temp : temp
  return `
      <li class="active">
          <span class="day-name">${dayName}</span>
          <span class="month">${date}</span>
          <span class="time">${time}</span>
          <img class="day-icon" src="${iconSrc}" alt="weather icon">
          <span class="day-temp">${resultTemp}&#8451;</span>
      </li>
      `
}

// function buildWidgetItems(data) {}

// запрос widget items ==============================================================

fetchData(urlWetherByDays, 'GET', (response) => {
  const data = JSON.parse(response)

  const someDays = data.list.filter((item, index) => index % 8 == 2)

  const someDaysCurrentAttr = someDays.map((day) =>
    widgetItemTemplate(
      new Date(day.dt * 1000).toLocaleString('en-us', {
        weekday: 'short',
      }),
      new Date(day.dt * 1000).toLocaleString('en-us', {
        day: 'numeric',
      }) +
        ' ' +
        new Date(day.dt * 1000).toLocaleString('en-us', {
          month: 'short',
        }),
      (new Date(day.dt * 1000).getHours() < 10 ? '0' : '') +
        new Date(day.dt * 1000).getHours() +
        ':' +
        (new Date(day.dt * 1000).getMinutes() < 10 ? '0' : '') +
        new Date(day.dt * 1000).getMinutes(),
      `http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`,
      Math.round(day.main.temp - 273.15)
    )
  )

  document.querySelector('.week-list').innerHTML = someDaysCurrentAttr.join('')
})
