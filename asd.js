const EventEmitter = require("./index")


const ee = new EventEmitter()

ee.once("asd", (data)=>{
    console.log(data)
})

ee.emit("asd", "hello world")