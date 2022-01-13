/**
 * Scoreboard frontend script. Receive MQTT messages and update the display.
 */
var timeDisplay = new SegmentDisplay('display');
timeDisplay.pattern = '##:##';
timeDisplay.segmentCount = SegmentDisplay.FourteenSegment;
timeDisplay.digitHeight     = 20;
timeDisplay.digitWidth      = 10;
timeDisplay.digitWidth = 12;
timeDisplay.displayAngle = 12;
timeDisplay.colorOn = '#48d2fd';
timeDisplay.colorOff = '#2a2a2a';

var homeName = new SegmentDisplay('homeName');
homeName.pattern = '########';
homeName.segmentCount = SegmentDisplay.SixteenSegment;
homeName.colorOn = '#c8722b';
homeName.colorOff = '#2a2a2a';

var visitorName = new SegmentDisplay('visitorName');
visitorName.pattern = '########';
visitorName.segmentCount = SegmentDisplay.SixteenSegment;
visitorName.digitDistance = 2.5;
visitorName.colorOn = '#c8722b';
visitorName.colorOff = '#2a2a2a';

var home = new SegmentDisplay('home');
home.pattern = '##';
home.segmentCount = SegmentDisplay.SevenSegment;
home.colorOn = '#d9d225';
home.colorOff = '#2a2a2a';

var visitor = new SegmentDisplay('visitor');
visitor.pattern = '##';
visitor.segmentCount = SegmentDisplay.SevenSegment;
visitor.colorOn = '#d9d225';
visitor.colorOff = '#2a2a2a';

var clock = new StationClock('clock');

$(document).ready(function () {
    homeName.value = 'CHESEAUX';
    home.value = [0x3f, 0x3f];

    visitorName.value = 'ST-ROCH';
    visitor.value = [0x3f, 0x3f];

    home.draw();    
    visitor.draw();
    homeName.draw();
    visitorName.draw();    
    timeDisplay.draw();
    clock.draw()    
})

window.setInterval(() => { clock.draw() }, 50)

const SBOARD_REG_RESET = 0;
const SBOARD_REG_TEAM = 1;
const SBOARD_REG_DIGIT = 2;
const SBOARD_REG_VALUE = 3;
const SBOARD_REG_COLOR = 4;
const SBOARD_REG_TIME = 5;

const SBOARD_HOME = 0;
const SBOARD_VISITOR = 1;

const SBOARD_TIME_SECONDS = 0;
const SBOARD_TIME_MINUTES = 1;

const topic_base = '/switzerland/geneva/scoreboard'

const genRanHex = size => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');


const client = mqtt.connect('ws://chevallier.io:9001', {
    clean: true,
    connectTimeout: 4000,
    clientId: 'scoreboard-' + genRanHex(10),
    username: 'student',
    password: 'la-fleur-en-bouquet-fane',
})

client.on('connect', function () {
    console.log('Connected to MQTT Broker')
    client.subscribe(topic_base + '/#', err => {
        if (err) {
            console.log(err)
            return
        }
        console.log("Subscribed to " + topic_base + '/#')
    })
})

function reset_display() {
    home.colorOn = colors[0]
    visitor.colorOn = colors[0]

    home.value = [0x3f, 0x3f];
    visitor.value = [0x3f, 0x3f];

    timeDisplay.value = '00:00';

    homeName.value = '';
    visitorName.value = '';

    home.draw();
    visitor.draw();
    timeDisplay.draw();
    homeName.draw();
    visitorName.draw();
}

var state = {
    team: SBOARD_HOME,
    text: homeName,
    digit: 0,
    score: home,
    time: null,
    minutes: 0,
    seconds: 0
}

var colors = [
    '#d9d225',
    '#FFA133',
    '#81FF33',
    '#33FFD3',
    '#337CFF',
    '#AF33FF',
    '#FF33DA',
    '#FF3333',
]

function setCharAt(str, index, chr) {
    if (index > str.length - 1) return str;
    return str.substring(0, index) + chr + str.substring(index + 1);
}

const zeroPad = (num, places) => String(num).padStart(places, '0')

client.on('message', (topic, message) => {
    message = message.toString()
    let value = parseInt(message)
    switch (topic) {
        case topic_base + '/' + SBOARD_REG_RESET:
            if (parseInt(message) === 255) reset_display()
            break
        case topic_base + '/' + SBOARD_REG_TEAM:
            switch (state.team) {
                case SBOARD_HOME:
                    console.log("Selected Team Home")
                    state.text = homeName
                    state.score = home
                    state.time = null
                    break;
                case SBOARD_VISITOR:
                    console.log("Selected Team Visitor")
                    state.text = visitorName
                    state.score = visitor
                    state.time = null
                    break;
                default:
                    console.log("Error: Unknown team")
                    break;
            }
            state.team = parseInt(message)
            break
        case topic_base + '/' + SBOARD_REG_DIGIT:
            if (parseInt(message) > 9) {
                console.log("Error: Invalid digit")
                break;
            }
            state.digit = parseInt(message)
            console.log("Selected digit " + state.digit)
            break
        case topic_base + '/' + SBOARD_REG_VALUE:
            if (state.time !== null) {
                if (value > 59 || value < 0) {
                    console.log("Error: Invalid time")
                    break;
                }
                switch (state.time) {
                    case SBOARD_TIME_SECONDS:
                        state.seconds = value
                        break
                    case SBOARD_TIME_MINUTES:
                        state.minutes = value
                        break;
                }
                timeDisplay.value = zeroPad(state.minutes, 2) + ':' + zeroPad(state.seconds, 2)
                timeDisplay.draw()
                console.log("Set time to " + timeDisplay.value)
                return
            }

            if (state.digit > 1) {
                state.text.value = setCharAt(state.text.value, state.digit - 2, String.fromCharCode(value))
                console.log("Change team digit " + (state.digit - 2) + " to " + String.fromCharCode(value))
                state.text.draw()
            }
            else {
                console.log("Change score digit " + state.digit + " to " + value.toString(16))
                state.score.value[state.digit] = value
                state.score.draw();
            }
            break
        case topic_base + '/' + SBOARD_REG_COLOR:
            if (value > colors.length) {
                console.log("Error: Invalid color")
            }
            else {
                console.log("Change digit color to " + colors[value])
                state.score.colorOn = colors[value]
                state.score.draw()
            }
            break
        case topic_base + '/' + SBOARD_REG_TIME:
            switch (value) {
                case SBOARD_TIME_SECONDS:
                    state.time = SBOARD_TIME_SECONDS
                    console.log('Selected seconds')
                    break;
                case SBOARD_TIME_MINUTES:
                    state.time = SBOARD_TIME_MINUTES
                    console.log('Selected minutes')
                    break;
                default:
                    console.log("Error: Invalid time value")
                    return
            }
            break
    }
})