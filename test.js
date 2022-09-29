"use strict";

// const assert = require("assert");
// const cluster = require("cluster");
// const { EventEmitter } = require(".");

import assert from "assert"
import cluster from "cluster"
import EventEmitter from "./index.js"
var emitter = new EventEmitter();

var numcluster = 4

if (cluster.isPrimary) {
    describe("Cluster Events", () => {
        // let hasErr = false;

        // after(() => {
        //     setTimeout(() => process.exit(+hasErr), 100);
        // });

        it("should fork " + numcluster +" workers, make handshake, and receive handshake answer", function (done) {
            this.timeout(5000);
            
            let online = 0,
                received = 0,
                dataX = "",
                dataY = "";

            for(let i = 0; i < numcluster; i++){
                cluster.fork()
                dataY += "handshake received;"
            }
            cluster.on("online", () => {
                online++;

                if (online === numcluster) {
                    emitter.on("received", (data)=>{
                        dataX += data + ";"
                        received++;
                    })
                    setTimeout(()=>{
                        assert.deepStrictEqual(new String(dataX), new String(dataY))
                        done()
                    }, 600)
                    // set a timer to ensure that all channel peers are online
                    setTimeout(() => {
                        emitter.emit("handshake", "thid is just a handshake")
                    }, 500);
                }
            })
        });

        it("worker say hello to each other and send back after they done", function(done){
            this.timeout(5000)
            let received = 0,
                dataX = "",
                dataY = "";
            for(let i = 0; i < numcluster; i++){
                dataY += "Hello World;"
            }
            emitter.on("hello received", (data)=>{
                dataX += data + ";"
                received++
            })
            setTimeout(()=>{
                assert.deepStrictEqual(new String(dataX), new String(dataY))
                done()
            }, 600)
        })


    });
} else {
    
    emitter.on("handshake", (data) => {
        emitter.emit("received", "handshake received")
        emitter.emitself("say hello to workers", "Hello World")
    })

    emitter.on("say hello to workers", (data) => {
        // set a timer to ensure that the first test already done
        setTimeout(()=>{
            emitter.broadcast("hello received", data)
        }, 500)
    })
}