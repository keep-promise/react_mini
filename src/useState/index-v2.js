// 根据 useState 的 initialState 新建一个 hook 节点
// 把新建的节点放到 workInProgressHook 指向的节点的后面
// 让 workInProgressHook 指向下一个节点，也就是最后一个节点
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
