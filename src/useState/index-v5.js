// 执行了多次相同的 hook 操作
// setCount(1);
// setCount(2);
// 会直接追加到当前 queue 的链表上去。另外，我们有一些更新任务可能由于优先级不够，暂时被挂起，
// 所以 queue 里面可能还存储着上次没有更新完成的信息。如果再更新，就要先把上一次未做完的更新
// 合并进来，再更新


// 依然会重新生成 hook 节点，只不过这时候再生成的时候，我们的 memorizedState 、queue 
// 就不是 null 了，相同的是，我们还是会把生成的这些 hooks 串起来。它依然是一个单项链表的结构。

var newHook = {
  memoizedState: currentHook.memoizedState,
  baseState: currentHook.baseState,
  baseQueue: currentHook.baseQueue,
  queue: currentHook.queue,
  next: null
};

if (workInProgressHook === null) {
      // 当前还没有 hook 节点被初始化
      currentlyRenderingFiber$1.memoizedState = workInProgressHook = newHook;
} else {
      // 加到链表的最后面
      workInProgressHook = workInProgressHook.next = newHook;
}

// 生成了一个新的 hook 节点之后，我们剩下要做的是根据 hook.queue 算出新的
// memoizedState 的值。

var first = baseQueue.next;
var newState = current.baseState;
var update = first;

do {
  var action = update.action;
  newState = reducer(newState, action);

  update = update.next;
} while (update !== null && update !== first);

hook.memoizedState = newState;

// 最后 memorizedState 这个值算完后，还是跟之前一样，作为 useState 
// 返回值的第一项返回。接下来就是走调度任务了。就不是 useState 的范围了。



