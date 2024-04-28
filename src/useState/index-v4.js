// 更新的流程: 调用 setState
// 大体逻辑和初次渲染的时候是一致的
// 只不过我们在初始化阶段只是初始化了每个 hook 节点上的 queue，
// 而更新的时候会往 queue 里加任务了；
// 并且，我们不再根据 initialState 去赋初始值，
// 而是根据上一次生成的 hook 节点链表去赋初始值，
// 并且根据 hook 节点 queue 上的更新任务计算最后的结果。

// setState
// 先把更新任务加到对应的 hook 节点的 queue 里去。
// 每一个 hook 节点都对应一个 queue 对象，这是我们 queue 对象的数据结构
var queue = { 
  pending: null,
  interleaved: null,
  lanes: NoLanes,
  dispatch: null,
  lastRenderedReducer: basicStateReducer,
  lastRenderedState: initialState
};

// 在 mount 阶段，我们已经为 setCount 指定好了两个参数，一个是它对应的 Fiber 对象，
// 另外一个是它的更新队列 queue。我们 setCount 函数的入参将作为第三个参数 action 传入。
//  queue.dispatch = dispatchAction.bind(null, currentlyRenderingFiber$1, queue);

// 执行setState语句
// setCount((count) => {
//   return count + 1;
// })

// 生成update
var update = {
  lane: lane,
  action: action, // 这个就是 setCount 的入参
  eagerReducer: null,
  eagerState: null,
  next: null
};

// queue.pending 存储产生的更新。
// 它的数据结构是一个单项循环链表，当只有一个节点的时候，是自己指向自己，
// 当有多个节点的时候，就把它插入进去


var pending = queue.pending;

if (pending === null) {
  // This is the first update. Create a circular list.
  update.next = update;
} else {
  update.next = pending.next;
  pending.next = update;
}

queue.pending = update;


// 第一个 hook 节点的 queue 队列已经处理好了，由于 React 的事件处理函数一直
// 都自带 AutoBatching 的特性，接下来我们不会去直接计算刚刚产生的 queue 队列，
// 而是先会一样的步骤，执行后面的 hook 语句，处理第二个 hook 节点，为它产生 queue 队列

// 处理完毕后，两个 hook 节点的 queue.pending 内部的节点都只有一个