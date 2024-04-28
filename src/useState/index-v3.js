// 根据 useState 的 initialState 新建一个 hook 节点
// 把新建的节点放到 workInProgressHook 指向的节点的后面
// 让 workInProgressHook 指向下一个节点，也就是最后一个节点

// 当前执行的hook [useState]
let workInProgressHook = null;
function mountWorkInProgressHook() {
  var hook = {
    memoizedState: null,
    baseState: null,
    baseQueue: null,
    queue: null,
    next: null
  };

  if (workInProgressHook === null) {
    // 当初始化第一个 hook 节点的时候
    workInProgressHook = hook;
    currentlyRenderingFiber$1.memoizedState = hook;
  } else {
    // 不是第一个节点，直接放到后面
    workInProgressHook = workInProgressHook.next = hook;
    // currentlyRenderingFiber$1.memoizedState.next = hook;
  }

  return workInProgressHook;
}

// 按照这个思路一直做下去的话，我们就生成了一条链表，该链表的头指针是 
// currentlyRenderingFiber.memoizedState ，剩下的每个节点都是 
// useState 对应的 hook 节点。

function mountState(initialState) {
  // 根据初始值初始化当前执行的 hook 节点
  var hook = mountWorkInProgressHook(); 

  if (typeof initialState === 'function') {
    // $FlowFixMe: Flow doesn't like mixed types
    initialState = initialState();
  }

  hook.memorizedState = hook.baseState = initialState;
  // 初始化当前 hook 对象的更新队列
  // 后面的更新阶段操作会往里面放值
  var queue = { 
    pending: null,
    interleaved: null,
    lanes: NoLanes,
    dispatch: null,
    lastRenderedReducer: basicStateReducer,
    lastRenderedState: initialState
  };
  hook.queue = queue;
  var dispatch = queue.dispatch = dispatchAction.bind(null, currentlyRenderingFiber$1, queue);
  return [hook.memoizedState, dispatch];
}
