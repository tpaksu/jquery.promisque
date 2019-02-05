/**
 * jQuery Promisque
 * ----------------
 * A jQuery based promise queue which queues promises to run N by N in parallel.
 *
 * Can be used in two methods:
 *
 *  - Run N items and wait for all of them to finish, then run N items again (anything but "pipe" mode, default)
 *  - Run N items and once one of it finishes, run the next job on queue, run N jobs in parallel until queue gets empty. ("pipe" mode)
 *
 * @method push(callback, arg1, arg2, ..) : pushes a new promise to the queue, can be pushed while running or stopped. Can use the given args in the callback
 * @method next() : gets the next item from the queue and removes it, if queue is empty returns null
 * @method run(count[, mode]) : runs the queue, if mode is empty, the default method is used, after pause, it resumes the queue
 * @method pause() : pauses the queue after current promises are finished
 * @method clear() : clears the queue
 * @method stop() : stops and clears the queue
 *
 * @example
 *
 *  $queue = new Promisque();
 *  $queue.push( Promise1 );
 *  $queue.push(Promise2);
 *  .
 *  .
 *  $queue.push(PromiseN);
 *  $queue.run(4, "pipe");
 *
 * @example
 *
 *  (new Promisque()).push(Promise1).push(Promise2).push(PromiseN).run(4, "pipe");
 *
 *
 * @author Taha Paksu <tpaksu@gmail.com>
 *
 * @constructor
 */
function Promisque() {
    /**
     * Returns the protype of the class
     */
    return {

        /** Stack holding the queue */
        stack: [],

        /** Pause indicator flag */
        interrupt: false,

        /** Chooses the mode */
        mode: null,

        /** Push a new item to the queue, args will be populated dynamically from the 'arguments' variable */
        push: function () {

            // Get the arguments
            var args = arguments;

            // if has arguments and first argument is a callable
            if (args.length > 0 && typeof (args[0]) === "function") {

                // push the promiseful (we don't know yet) callable to the stack
                this.stack.push({
                    callback: args[0],
                    arguments: [].slice.call(args, 1)
                });
            }
            // for chaining purposes
            return this;
        },

        /** Gets the next item to be run from stack */
        next: function () {

            // if the stack has items
            if (this.stack.length > 0) {

                // return first item from stack
                return this.stack.splice(0, 1)[0];
            } else {

                // else return nothing
                return null;
            }
        },

        /** Runs the queue */
        run: function (count, mode) {

            // set the mode if defined
            if (mode != undefined) this.mode = mode;

            // if not interrupted and stack has promises
            if (this.stack.length > 0 && this.interrupt == false) {

                // get N items from the stack
                var callbacks = this.stack.splice(0, count);

                // if the mode is "pipe"
                if (this.mode == "pipe") {

                    //start N pipes with the items from the stack
                    for (var q = 0; q < count; q++) {
                        this.createPipe(callbacks[q], q);
                    }

                    // if the mode is not "pipe"
                } else {
                    // when all the callbacks from the stack finishes,
                    $.when.apply(null, callbacks.map(function (c) {
                        return c.callback.apply(null, c.arguments);
                    })).then($.proxy(function () {

                        // re run the stack
                        this.run(count, this.mode);
                    }, this));
                }
            }

            // for chaining purposes
            return this;
        },

        /** internal method : prepares the pipe to the next promise recursively */
        createPipe: function (c, q) {
            return c.callback.apply(null, c.arguments).then($.proxy(function () {
                var nextCallback = this.next();
                if (nextCallback) {
                    return this.createPipe(nextCallback, q);
                }
            }, this));
        },

        /** Pauses the queue execution */
        pause: function () {
            this.interrupt = true;

            // for chaining purposes
            return this;
        },

        /** Stops the execution after current ones and clears the queue */
        stop: function () {

            // set interrupt flag and clear
            this.pause().clear();

            // for chaining purposes
            return this;
        },

        /** Clears the queue */
        clear: function () {

            // empty the stack
            this.stack = [];

            // for chaining purposes
            return this;
        }
    }
}