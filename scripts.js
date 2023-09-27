function createNode(element){
	return document.createElement(element)
}

function append(parent, el){
	return parent.appendChild(el)
}

function clear(el){
	el.innerHTML = '';
}

const ul = document.getElementById('time')

const form = document.getElementById('form')
const box = document.getElementById('box')

const ctx_pm2_5 = document.getElementById('chart_pm2_5')
const ctx_pm10 = document.getElementById('chart_pm10')

form.addEventListener('submit', function(event){
	const place_name = box.value
	const API_KEY_YANDEX = '85eaff1b-ef9e-4c11-89bc-ca01d1ae43de'
	const API_URL_GEO_DATA = `https://geocode-maps.yandex.ru/1.x/?apikey=${API_KEY_YANDEX}&geocode=${place_name}&format=json`
	fetch(API_URL_GEO_DATA)
		.then(response => response.json())
		.then(data => get_list_from_pos_str(data))
		.then(coordinates =>
			{
				const API_OPEN_METEO = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${coordinates[0]}&longitude=${coordinates[1]}&hourly=pm10,pm2_5`
				fetch(API_OPEN_METEO)
				.then(response => response.json())
				.then(data => {
					render_polution_table(data)
					
					const day_list = get_day_list(data)
					const pm2_5_avg_list = get_avg_list(data, day_list, 'pm2_5')
					const pm10_avg_list = get_avg_list(data, day_list, 'pm10')
					
					render_chart(day_list, pm2_5_avg_list, ctx_pm2_5, 'pm2_5')
					render_chart(day_list, pm10_avg_list, ctx_pm10, 'pm10')
				}).catch(err => render_error_message())
			}
		)
		.catch(err => render_error_message())
	event.preventDefault()
})

function render_chart(day_list, avg_list, ctx, pm){
	const chartStatus = Chart.getChart("chart_" + pm)
	if (chartStatus != undefined) {
		chartStatus.destroy();
	}
	
	const myChart = new Chart(ctx, {
		type: 'bar',
		data: {
		labels: day_list,
		datasets: [{
			label: pm,
			data: avg_list,
			borderWidth: 1
			}]
		},
		options: {
			scales: {
				y: {
				beginAtZero: true
				}
			}
		}
	})
}

function get_avg_list(data, days, pm){
	const dates = data.hourly.time.map((x) => x.slice(0,-6))
	let arr = []
	const pm_list = data.hourly[pm]
	days.forEach((day) => {
		let avg = 0
		let s = 0
		let n = 0
		for (let i = 0; i < pm_list.length ; i++) {
			if (day === dates[i]){
				s = s + pm_list[i]
				n++
			}
		}
		avg = s/n
		arr.push(avg)
	})
		
	return arr
}

function get_day_list(data) {
	const dates = data.hourly.time.map((x) => x.slice(0,-6))
	
	function onlyUnique(value, index, array) {
		return array.indexOf(value) === index;
	}
	
	return dates.filter(onlyUnique)
}

function render_error_message(){
	window.alert('Ошибка получения данных.')
}
function get_list_from_pos_str(data) {
	const pos_str = data.response.GeoObjectCollection.featureMember[0].GeoObject.Point.pos
	return pos_str.split(' ', 2)
}

function render_polution_table(data){
	clear(ul)
	let i = 0
	while(i < data.hourly.time.length){
		let li = createNode('li')
		li.innerHTML = `${data.hourly.time[i]} : ${null_to_emp_str(data.hourly.pm10[i])} : ${null_to_emp_str(data.hourly.pm2_5[i])}`
		append(ul, li)	
		i++ 
		}
}

function null_to_emp_str(x){
	if (x===null){
		x = '-'
	}
	return x
}







