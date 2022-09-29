"use strict";

// const assert = require("assert");
// const cluster = require("cluster");
// const { EventEmitter } = require(".");

import assert from "assert"
import cluster from "cluster"
import EventEmitter from "./index.js"
var emitter = new EventEmitter();

if (cluster.isPrimary) {
    describe("Cluster Events", () => {
        let hasErr = false,
            worker1,
            worker2;

        after(() => {
            setTimeout(() => process.exit(+hasErr), 100);
        });

        it("should fork 2 workers, make handshake, and receive handshake answer", function (done) {
            this.timeout(5000);
            worker1 = cluster.fork();
            worker2 = cluster.fork();
            let online = 0,
                received = 0,
                dataX = "";


            cluster.on("online", () => {
                online++;

                if (online === 2) {
                    emitter.on("received", (data)=>{
                        dataX += data + ";"
                        received++;
                        if(received == 2){
                            assert.deepStrictEqual(new String(dataX), new String("handshake received;handshake received;"))
                            done()
                        }
                    })
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
                dataX = "";
            emitter.on("hello received", (data)=>{
                dataX += data + ";"
                received++
                if(received == 2){
                    assert.deepStrictEqual(new String(dataX), new String("Hello World;Hello World;"))
                    done()
                }
            })
        })


    });
} else {
    emitter.on("handshake", (data) => {
        emitter.emit("received", "handshake received")
        emitter.emit("say hello to workers", "Hello World")
    })

    emitter.on("say hello to workers", (data) => {
        // set a timer to ensure that the first test already done
        setTimeout(()=>{
            emitter.emit("hello received", data)
        }, 1)
    })
}