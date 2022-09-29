# EventEmitter Clustered
**Node's event emitter for cluster mode (master-worker, worker-master, worker-master-worker)**

## How it Works

This Module isn't inheriting from EventEmitter Class, instead create new instance inside, and replicate EventEmitter while also integrate EventEmitter itself into it's own.

For different process communication, it's use `Message` event from `cluster` module. So to be able to communicate between workers, it needs to transfer the data to master first.
