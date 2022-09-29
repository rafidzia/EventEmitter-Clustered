import {EventEmitter as OREventEmitter} from "events"
import cluster from "cluster"

class EventEmitter{

    #ee = new OREventEmitter()

    emit(eventName, ...args){
        if(cluster.isPrimary){
            if(cluster.workers){
                let keys = Object.keys(cluster.workers)
                for (let i = 0; i < keys.length; i++) {
                    cluster.workers[keys[i]]?.send({event: eventName, data: args})
                }
            }
        }
        if(cluster.isWorker){
            if(process.send){
                process.send({pid: process.pid, event: eventName, data: args}, (err) => {
                    if(err) throw err
                })
            }
        }
        return this.#ee.emit(eventName, ...args)
    }

    removeListener(eventName, listener){
        if(this.#__listeners[eventName]){
            let index = this.#__listeners[eventName].indexOf(listener)
            if(index > -1){
                this.#__listeners[eventName].splice(index, 1)
            }
        }
        this.#ee.removeListener(eventName, listener)
        return this
    }

    removeAllListeners(eventName){
        if(eventName){
            if(this.#__listeners[eventName]){
                this.#__listeners[eventName] = []
            }
            this.#ee.removeAllListeners(eventName)
        }else{
            this.#__listeners = {}
            this.#ee.removeAllListeners()
        }
        return this
    }
    off(eventName, listener){
        return this.removeListener(eventName, listener)
    }

    on(eventName, listener){
        if(!this.#__listeners[eventName]) this.#__listeners[eventName] = []
        if(!this.#__onceListeners[eventName]) this.#__onceListeners[eventName] = []
        if(this.#__maxListeners > 0){
            if((this.#__listeners[eventName].length + this.#__onceListeners[eventName].length) < this.#__maxListeners){
                this.#__listeners[eventName].push(listener)
                this.#ee.on(eventName, listener)
            }
        }else{
            this.#__listeners[eventName].push(listener)
            this.#ee.on(eventName, listener)
        }
        return this
    }

    addListener(eventName, listener){
        return this.on(eventName, listener)
    }

    once(eventName, listener){
        if(!this.#__listeners[eventName]) this.#__listeners[eventName] = []
        if(!this.#__onceListeners[eventName]) this.#__onceListeners[eventName] = []
        if(this.#__maxListeners > 0){
            if((this.#__listeners[eventName].length + this.#__onceListeners[eventName].length) < this.#__maxListeners){
                this.#__onceListeners[eventName].push(listener)
                this.#ee.once(eventName, listener)
            }
        }else{
            this.#__onceListeners[eventName].push(listener)
            this.#ee.once(eventName, listener)
        }
        return this
    }

    prependListener(eventName, listener){
        if(!this.#__listeners[eventName]) this.#__listeners[eventName] = []
        if(!this.#__onceListeners[eventName]) this.#__onceListeners[eventName] = []
        if(this.#__maxListeners > 0){
            if((this.#__listeners[eventName].length + this.#__onceListeners[eventName].length) < this.#__maxListeners){
                this.#__listeners[eventName].unshift(listener)
                this.#ee.prependListener(eventName, listener)
            }
        }else{
            this.#__listeners[eventName].unshift(listener)
            this.#ee.prependListener(eventName, listener)
        }
        return this
    }

    prependOnceListener(eventName, listener){
        if(!this.#__listeners[eventName]) this.#__listeners[eventName] = []
        if(!this.#__onceListeners[eventName]) this.#__onceListeners[eventName] = []
        if(this.#__maxListeners > 0){
            if((this.#__listeners[eventName].length + this.#__onceListeners[eventName].length) < this.#__maxListeners){
                this.#__onceListeners[eventName].unshift(listener)
                this.#ee.prependOnceListener(eventName, listener)
            }
        }else{
            this.#__onceListeners[eventName].unshift(listener)
            this.#ee.prependOnceListener(eventName, listener)
        }
        return this
    }

    setMaxListeners(n){
        this.#__maxListeners = n
        this.#ee.setMaxListeners(n)
        return this
    }
    getMaxListeners(){
        return this.#__maxListeners
    }
    listenerCount(eventName){
        return this.#ee.listenerCount(eventName)
    }
    eventNames(){
        return this.#ee.eventNames()
    }
    listeners(eventName){
        return this.#ee.listeners(eventName)
    }

    
    constructor(){
        this.#__startListen()
    }

    #__listeners = {}

    #__onceListeners = {}

    #__maxListeners = 0

    #__startListen(){
        if(cluster.isPrimary){
            if(cluster.workers){
                let keys = Object.keys(cluster.workers)
                for (let i = 0; i < keys.length; i++) {
                    cluster.workers[keys[i]]?.on("message", (data) => {
                        if(this.#__listeners[data.event]){
                            for(let i = 0; i < this.#__listeners[data.event].length; i++){
                                this.#__listeners[data.event][i](...data.data)
                            }
                        }
                        if(this.#__onceListeners[data.event]){
                            for(let i = 0; i < this.#__onceListeners[data.event].length; i++){
                                this.#__onceListeners[data.event][i](...data.data)
                            }
                            this.#__onceListeners[data.event] = []
                        }
                        if(cluster.workers){
                            let keys = Object.keys(cluster.workers)
                            for (let i = 0; i < keys.length; i++) {
                                if(cluster.workers[keys[i]]?.process.pid == data.pid) continue;
                                cluster.workers[keys[i]]?.send({event: data.event, data: data.data})
                            }
                        }
                    })
                }
            }
        }
        if(cluster.isWorker){
            process.on("message", (data) => {
                if(this.#__listeners[data.event]){
                    for(let i = 0; i < this.#__listeners[data.event].length; i++){
                        this.#__listeners[data.event][i](...data.data)
                    }
                }
                if(this.#__onceListeners[data.event]){
                    for(let i = 0; i < this.#__onceListeners[data.event].length; i++){
                        this.#__onceListeners[data.event][i](...data.data)
                    }
                    this.#__onceListeners[data.event] = []
                }
            })
        }
    }
}

export default EventEmitter