
var timeDisplay = new SegmentDisplay('display');
timeDisplay.pattern = '##:##';
timeDisplay.segmentCount = SegmentDisplay.SixteenSegment;
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
$(document).ready(function () {
    visitor.value = '05';
    visitor.draw();
})


const client = mqtt.connect('ws://chevallier.io:9001', {
    clean: true,
    connectTimeout: 4000,
    clientId: 'scoreboard',
    username: 'student',
    password: 'la-fleur-en-bouquet-fane',
})

client.on('connect', function () {
    console.log('Connected')
    client.subscribe('test', function (err) {
        if (!err) {
            client.publish('test', 'Hello mqtt')
        }
    })
})

client.on('message', function (topic, message) {
    // message is Buffer
    console.log(message.toString())
    client.end()
})