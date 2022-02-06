// PROVIDED CODE BELOW (LINES 1 - 80) DO NOT REMOVE

// The store will hold all information needed globally
let {setState, getState} = ( () => {
    let store = {
		track_id: undefined,
		player_id: undefined,
		race_id: undefined,
		tracks: [],
		racers: [],
    }

    const getState = () => {
        return store
    }

    const setState = ( newState ) => {
        store = {...store, ...newState}
    }

    return {
        setState: setState,
        getState: getState,
    }
} )()

// We need our javascript to wait until the DOM is loaded
document.addEventListener("DOMContentLoaded", function() {
	onPageLoad()
	setupClickHandlers()
})

async function onPageLoad() {
	try {
		getTracks()
			.then(tracks => {
				setState({tracks})
				const html = renderTrackCards(tracks)
				renderAt('#tracks', html)
			})

		getRacers()
			.then((racers) => {
				setState({racers})
				const html = renderRacerCars(racers)
				renderAt('#racers', html)
			})
	} catch(error) {
		console.log("Problem getting tracks and racers ::", error.message)
		console.error(error)
	}
}

// Check if `child` is a descendant of `parent` to accept entire element as target
// @link https://htmldom.dev/check-if-an-element-is-a-descendant-of-another/
const getParent = function (parent, child) {
    let node = child.parentNode;
    while (node) {
        if (node.matches(parent)) {
            return node;
        }
        // Traverse up to the parent
        node = node.parentNode;

		if(typeof node.matches === `function`){
			return null;
		}
    }

    // Go up until the root but couldn't find the `parent`
    return null;
};

function setupClickHandlers() {
	document.addEventListener('click', function(event) {
		const { target } = event

		let parent;

		// Race track form field
		if (target.matches('.card.track')) {
			handleSelectTrack(target)
		} else if(parent = getParent(`.card.track`, target)) {
			handleSelectTrack(parent)
		}

		// Podracer form field
		if (target.matches('.card.podracer')) {
			handleSelectPodRacer(target)
		} else if(parent = getParent(`.card.podracer`, target)) {
			handleSelectPodRacer(parent)
		}

		// Submit create race form
		if (target.matches('#submit-create-race')) {
			event.preventDefault()

			// start race
			handleCreateRace()
		}

		// Handle acceleration click
		if (target.matches('#gas-peddle')) {
			handleAccelerate(target)
		}

	}, false)
}

async function delay(ms) {
	try {
		return await new Promise(resolve => setTimeout(resolve, ms));
	} catch(error) {
		console.log("an error shouldn't be possible here")
		console.log(error)
	}
}
// ^ PROVIDED CODE ^ DO NOT REMOVE

// Start here until line 91
// This async function controls the flow of the race, add the logic and error handling
async function handleCreateRace() {
	// Get player_id and track_id from the store
	const { player_id, track_id, racers, tracks } = getState();

	const selectedTrack = tracks.filter(track => track.id == track_id)[0]

	// render starting UI
	renderAt('#race', renderRaceStartView(selectedTrack))

	// invoke the API call to create the race, then save the result
	const newRace = createRace(player_id, track_id)
		// update the store with the race id
		.then((race) => {
			setState({race_id: race.ID})
		})

		// For the API to work properly, the race id should be race id - 1

		// The race has been created, now start the countdown
		// call the async function runCountdown
		.then (() => {
			runCountdown()
			// call the async function startRace
			.then((race_id) => startRace(race_id - 1))

			// call the async function runRace
			.then(runRace)
		})
}

function runRace(raceID) {
	return new Promise(resolve => {
		// use Javascript's built in setInterval method to get race info every 500ms
		const intervalID = setInterval(() => {
			const {race_id} = getState();

			const race = getRace(race_id - 1)
				.then((race) => {
					console.log(race)
					if(race.status != `in-progress`){
						// if the countdown is done, clear the interval, resolve the promise, and return
						clearInterval(intervalID);
						renderAt('#race', resultsView(race.positions)) // to render the results view
						resolve(race);
					} else {
						renderAt('#leaderBoard', raceProgress(race.positions))
					}
				})
		}, 500)
	})
	// TODO - remember to add error handling for the Promise
}

async function runCountdown() {
	const {race_id} = getState();

	try {
		// wait for the DOM to load
		await delay(1000)
		let timer = 3

		return new Promise(resolve => {
			// use Javascript's built in setInterval method to count down once per second
			const intervalID = setInterval(() => {
				// run this DOM manipulation to decrement the countdown for the user
				document.getElementById('big-numbers').innerHTML = --timer

			// if the countdown is done, clear the interval, resolve the promise, and return
				if(timer === 0){
					clearInterval(intervalID);
					resolve(race_id);
				}
			}, 1000)
		})
	} catch(error) {
		console.log(error);
	}
}

function handleSelectPodRacer(target) {
	console.log("selected a pod", target.id)

	// remove class selected from all racer options
	const selected = document.querySelector('#racers .selected')
	if(selected) {
		selected.classList.remove('selected')
	}

	// add class selected to current target
	target.classList.add('selected')

	// save the selected racer to the store
	const player_id = target.id;

	setState({player_id});
}

function handleSelectTrack(target) {
	console.log("selected a track", target.id)

	// remove class selected from all track options
	const selected = document.querySelector('#tracks .selected')
	if(selected) {
		selected.classList.remove('selected')
	}

	// add class selected to current target
	target.classList.add('selected')

	// save the selected track id to the store
	const track_id = target.id;

	setState({track_id})
}

function handleAccelerate() {
	console.log("accelerate button clicked")

	const {race_id} = getState();

	accelerate(race_id - 1)
}

// HTML VIEWS ------------------------------------------------
// Provided code - do not remove

function renderRacerCars(racers) {
	if (!racers.length) {
		return `
			<h4>Loading Racers...</4>
		`
	}

	const results = racers.map(renderRacerCard).join('')

	return `
		<ul id="racers">
			${results}
		</ul>
	`
}

function renderRacerCard(racer) {
	const { id, driver_name, top_speed, acceleration, handling } = racer

	return `
		<li class="card podracer" id="${id}">
			<h3>${driver_name}</h3>
			<p>${top_speed}</p>
			<p>${acceleration}</p>
			<p>${handling}</p>
		</li>
	`
}

function renderTrackCards(tracks) {
	if (!tracks.length) {
		return `
			<h4>Loading Tracks...</4>
		`
	}

	const results = tracks.map(renderTrackCard).join('')

	return `
		<ul id="tracks">
			${results}
		</ul>
	`
}

function renderTrackCard(track) {
	const { id, name } = track

	return `
		<li id="${id}" class="card track">
			<h3>${name}</h3>
		</li>
	`
}

function renderCountdown(count) {
	return `
		<h2>Race Starts In...</h2>
		<p id="big-numbers">${count}</p>
	`
}

function renderRaceStartView(track, racers) {
	return `
		<header>
			<h1>Race: ${track.name}</h1>
		</header>
		<main id="two-columns">
			<section id="leaderBoard">
				${renderCountdown(3)}
			</section>

			<section id="accelerate">
				<h2>Directions</h2>
				<p>Click the button as fast as you can to make your racer go faster!</p>
				<button id="gas-peddle">Click Me To Win!</button>
			</section>
		</main>
		<footer></footer>
	`
}

function resultsView(positions) {
	positions.sort((a, b) => (a.final_position > b.final_position) ? 1 : -1)

	return `
		<header>
			<h1>Race Results</h1>
		</header>
		<main>
			<section>
			${raceProgress(positions)}
			<a href="/race" class="button">Start a new race</a>
			</section>
		</main>
	`
}

function raceProgress(positions) {
	const {player_id } = getState();

	let userPlayer = positions.find(e => e.id == player_id)
	userPlayer.driver_name += " (you)"

	positions = positions.sort((a, b) => (a.segment > b.segment) ? -1 : 1)
	let count = 1

	const results = positions.map(p => {
		return `
			<tr>
				<td>
					<h3>${count++} - ${p.driver_name}</h3>
				</td>
			</tr>
		`
	})

	return `
		<main>
			<h2>Leaderboard</h2>
			<section id="leaderBoard">
				${results.join('')}
			</section>
		</main>
	`
}

function renderAt(element, html) {
	const node = document.querySelector(element)

	node.innerHTML = html
}

// ^ Provided code ^ do not remove


// API CALLS ------------------------------------------------

const SERVER = 'http://localhost:8000'

function defaultFetchOpts() {
	return {
		mode: 'cors',
		headers: {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin' : SERVER,
		},
	}
}

/**
 * Composes URL for API calls based on the server and an endpoint passed.
 *
 * @param {string} endpoint
 *
 * @returns {string}
 */
const getEndpoint = (endpoint) => `${SERVER}/api/${endpoint}`;

const makeRequest = async (url, method, data) => {
	const requestOptions = {
		method: method,
		...defaultFetchOpts(),
		dataType: 'json',
	};

	if(typeof data != `undefined`) {
		requestOptions.body = JSON.stringify(data);
	}

	return await fetch(url, requestOptions)
		.then((res) => {
			if(res.headers.get(`Content-Length`) == 0){
				return null;
			}
			return res.json()
		})
};

const getTracks = async () => {
	const url = getEndpoint(`tracks`);

	const tracks = await makeRequest(url, `GET`);

	return tracks;
};

const getRacers = async () => {
	const url = getEndpoint(`cars`);

	const racers = await makeRequest(url, `GET`);

	return racers;
}

const createRace = async (player_id, track_id) => {
	player_id = parseInt(player_id);
	track_id = parseInt(track_id);
	const body = { player_id, track_id };

	const url = getEndpoint(`races`);

	const newRace = makeRequest(url, `POST`, body);

	return newRace;
}

const getRace = async (id) => {
	const url = getEndpoint(`races/${id}`);

	const race = await makeRequest(url, `GET`);

	return race;
}

const startRace = async (id) => {
	const url = getEndpoint(`races/${id}/start`);

	const raceInProgress = await makeRequest(url, `POST`);

	return raceInProgress;
}

const accelerate = async (id) => {
	const url = getEndpoint(`races/${id}/accelerate`);

	const accelerate = await makeRequest(url, `POST`);

	return accelerate;
}
