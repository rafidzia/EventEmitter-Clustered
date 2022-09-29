# EventEmitter Clustered
**Node's event emitter for cluster mode (master-worker, worker-master, worker-master-worker)**

## How it Works

This Module isn't inheriting from EventEmitter Class, instead create new instance inside, and replicate EventEmitter while also integrate EventEmitter itself into it's own.

For different process communication, it's use `Message` event from `cluster` module. So to be able to communicate between workers, it needs to transfer the data to master first.

## Additional Notes

Since there will be two listeners from the same Event, one from Node.Js EventEmitter, and one from worker on Message Event. So it needs to be handle carefully. If you want to send message to another worker without current worker receive the message, you can use `emitter.broadcast` method. Or if you want to send message to current worker only, you can use `emitter.emitself` which an extension to Node.Js EventEmitter itself.

`rawListener` method from EventEmitter cannot be used within this module