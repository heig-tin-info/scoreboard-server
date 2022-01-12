
var timeDisplay = new SegmentDisplay('display');
timeDisplay.pattern = '##:##';
timeDisplay.segmentCount = SegmentDisplay.FourteenSegment;
timeDisplay.cornerType = SegmentDisplay.RoundedCorner;
timeDisplay.digitHeight = 20;
timeDisplay.digitWidth = 12;
timeDisplay.digitDistance = 2.5;
timeDisplay.displayAngle = 8;
timeDisplay.segmentWidth = 2;
timeDisplay.segmentDistance = 0.4;
timeDisplay.colorOn = '#48d2fd';
timeDisplay.colorOff = '#2a2a2a';
$(document).ready(function () {
    timeDisplay.draw();
})

var homeName = new SegmentDisplay('homeName');
homeName.pattern = '########';
homeName.segmentCount = SegmentDisplay.SixteenSegment;
homeName.cornerType = SegmentDisplay.RoundedCorner;
homeName.digitHeight = 24;
homeName.digitWidth = 15;
homeName.digitDistance = 2.5;
homeName.displayAngle = 2;
homeName.segmentWidth = 2;
homeName.segmentDistance = 0.4;
homeName.colorOn = '#c8722b';
homeName.colorOff = '#2a2a2a';
$(document).ready(function () {
    homeName.value = 'JERRY';
    homeName.draw();
})

var visitorName = new SegmentDisplay('visitorName');
visitorName.pattern = '########';
visitorName.segmentCount = SegmentDisplay.SixteenSegment;
visitorName.cornerType = SegmentDisplay.RoundedCorner;
visitorName.digitHeight = 24;
visitorName.digitWidth = 15;
visitorName.digitDistance = 2.5;
visitorName.displayAngle = 2;
visitorName.segmentWidth = 2;
visitorName.segmentDistance = 0.4;
visitorName.colorOn = '#c8722b';
visitorName.colorOff = '#2a2a2a';
$(document).ready(function () {
    visitorName.value = 'TOMITOR';
    visitorName.draw();
})


var home = new SegmentDisplay('home');
home.pattern = '##';
home.segmentCount = SegmentDisplay.SevenSegment;
home.cornerType = SegmentDisplay.RoundedCorner;
home.digitHeight = 25;
home.digitWidth = 15;
home.digitDistance = 2.5;
home.displayAngle = 2;
home.segmentWidth = 2.5;
home.segmentDistance = 0.4;
home.colorOn = '#d9d225';
home.colorOff = '#2a2a2a';
$(document).ready(function () {
    home.value = '04';
    home.draw();
})

var visitor = new SegmentDisplay('visitor');
visitor.pattern = '##';
visitor.segmentCount = SegmentDisplay.SevenSegment;
visitor.cornerType = SegmentDisplay.RoundedCorner;
visitor.digitHeight = 25;
visitor.digitWidth = 15;
visitor.digitDistance = 2.5;
visitor.displayAngle = 2;
visitor.segmentWidth = 2.5;
visitor.segmentDistance = 0.4;
visitor.colorOn = '#d9d225';
visitor.colorOff = '#2a2a2a';

var clock = new StationClock('clock');


$(document).ready(function () {
    visitor.value = '05';
    visitor.draw();
    clock.draw()
})

window.setInterval(() => {
    clock.draw() }, 50
)

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

const client = mqtt.connect('ws://chevallier.io:9001', {
    clean: true,
    connectTimeout: 4000,
    clientId: 'scoreboard',
    username: 'student',
    password: 'la-fleur-en-bouquet-fane',
})

client.on('connect', function () {
    console.log('Connected')
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
    home.value = '00';
    home.draw();
    visitor.value = '00';
    visitor.draw();
    timeDisplay.value = '00:00';
    timeDisplay.draw();
    homeName.value = '';
    homeName.draw();
    visitorName.value = '';
    visitorName.draw();
}

var state = {
    team : SBOARD_HOME,
    text : homeName,
    digit : 0,
    score : home,
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

function setCharAt(str,index,chr) {
    if(index > str.length-1) return str;
    return str.substring(0,index) + chr + str.substring(index+1);
}

const zeroPad = (num, places) => String(num).padStart(places, '0')


client.on('message', (topic, message) => {
    message = message.toString()
    let value = parseInt(message)
    console.log(topic, message)
    switch(topic) {
        case topic_base + '/' + SBOARD_REG_RESET:
            if (parseInt(message) === 255) reset_display()
            break
        case topic_base + '/' + SBOARD_REG_TEAM:            
            switch(state.team) {
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
                switch(state.time) {
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
                console.log(state.text.value)
                state.text.draw();
            }
            else {

            }
            break
        case topic_base + '/' + SBOARD_REG_COLOR:
            if (value > colors.length) {
                console.log("Error: Invalid color")
            }
            else {
                state.score.colorOn = colors[value]
                state.score.draw()
            }            
            break
        case topic_base + '/' + SBOARD_REG_TIME:
            switch(value) {
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
    
    console.log(message.toString())
})