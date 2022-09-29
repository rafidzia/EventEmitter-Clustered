"use strict";

// const assert = require("assert");
// const cluster = require("cluster");
// const { EventEmitter } = require(".");

import assert from "assert"
import cluster from "cluster"
import EventEmitter from "./index.js"
var emitter = new EventEmitter();
var logs = [];

if (cluster.isPrimary) {
    // describe("Cluster Events", () => {
        let hasErr = false,
            worker1,
            worker2;

        // after(() => {
        //     setTimeout(() => process.exit(+hasErr), 100);
        // });

        // it("should fork 2 workers and make handshake as expected", function (done) {
            // this.timeout(5000);
            worker1 = cluster.fork();
            worker2 = cluster.fork();
            let count = 0,
                online = 0;
                

            

            cluster.on("online", () => {
                online++;

                if (online === 2) {
                    emitter.on("received", (data)=>{
                        console.log("c")
                        // assert.deepStrictEqual(logs, data, "handshake received")
                        // done()
                    })
                    // set a timer to ensure that all channel peers are online
                    setTimeout(() => {
                        console.log("a")
                        emitter.emit("handshake", "thid is just a handshake")
                    }, 500);
                }
            })
        // });

    // });
} else {
    
        emitter.on("handshake", (data) => {
            console.log("worker ", process.pid, " receive : ", data)
            // console.log(data)
            // assert.deepStrictEqual(logs, data, "thid is just a handshake")
            emitter.emit("received", "handshake received")
            // emitter.emit("say hello to workers", "Hello World")
        })
    
        emitter.on("say hello to workers", (data) => {
            // assert.deepStrictEqual(logs, data, "Hello World")
        })

    
}