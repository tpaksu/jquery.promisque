# jquery.promisque

A jQuery based promise queue which queues promises to run N by N in parallel.

Can be used in two methods:

- Run N items and wait for all of them to finish, then run N items again
  (anything but "pipe" mode, default)
- Run N items and once one of it finishes, run the next job on queue, run N jobs in parallel until queue gets empty.
  ("pipe" mode)

### Methods

- **push(callback, arg1, arg2, ..)** : pushes a new promise to the queue, can be pushed while running or stopped. Can use the given args in the callback.
- **next()** : gets the next item from the queue and removes it, if queue is empty returns null. It's an internal method, but if you need to skip an item from the stack, you can use it.
- **run(count[, mode])** : runs the queue, if mode is empty, the default method is used, after pause, it resumes the queue
- **pause()** : pauses the queue after current promises are finished
- **clear()** : clears the queue
- **stop()** : stops and clears the queue

### Example

    var queue = new Promisque();
    queue.push( Promise1 );
    queue.push(Promise2);
    queue.push(PromiseN);
    queue.run(4, "pipe");

 or just:

    (new Promisque()).push(Promise1).push(Promise2).push(PromiseN).run(4, "pipe");