const options = {clean: true, connectTimeout: 4000}
const client = mqtt.connect('ws://broker.mqttdashboard.com:8000/mqtt', options)
client.on('connect', function () {
    console.log('Connected')
    client.subscribe('test', function (err) {
        if (!err) {
            client.publish('test', 'Hello mqtt')
        }
    })
})

client.on('message', function (topic, message) {
    console.log(message.toString())
    client.end()
})


const SBOARD_REG_RESET = 0;
const SBOARD_REG_TEAM = 1;
const SBOARD_REG_DIGIT = 2;
const SBOARD_REG_VALUE = 3;
const SBOARD_REG_COLOR = 4;
const SBOARD_REG_TIME = 5;

const SBOARD_HOME = 0;
const SBOARD_VISITOR = 1;

const base = 'switzerland/geneva/scoreboard'

client.subscribe(base + '/' + SBOARD_REG_RESET, err => {

})

function reset_display() {
    console.log('Reset Display')
}

function update_digit(team, digit, value) {
    console.log('Update Digit', team, digit, value)
}

function update_color(color) {

}

var selected_digit = 0;
var selected_team = SBOARD_HOME;

client.on('message', function (topic, message) {
    switch(topic) {
        case base + '/' + SBOARD_REG_RESET:
            if (message.toNumber() === 255) reset_display()
            break
        case base + '/' + SBOARD_REG_TEAM:
            selected_team = message.toNumber()
            break
        case base + '/' + SBOARD_REG_DIGIT:
            selected_digit = message.toNumber()
            break
        case base + '/' + SBOARD_REG_VALUE:
            update_digit(selected_digit, selected_team, message.toNumber())
            break
        case base + '/' + SBOARD_REG_COLOR:
            update_color(message.toNumber())
            break
        case base + '/' + SBOARD_REG_TIME:
            console.log('Time')
            break
    }
    
    console.log(message.toString())
    client.end()
})