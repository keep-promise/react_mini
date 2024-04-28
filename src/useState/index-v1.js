// 组件两个useState初始化及更新
// const [count1, setCount1] = useState(0)
// const [count2, setCount2] = useState(10)

// ClassComponent、FunctionComponent 等对应fiber
// fiber：保存它的各种节点状态信息，--》vdom
// Fiber 对象记录内部 State 对象的属性memoizedState，可以在下次渲染的时候取到上一次的值

// Fiber.memoizedState 是一个单项链表的结构
// 每一个 useState 都会在后面生成一个 hook 节点。
// 而它会把当前组件所有 useState 对应的 hook 节点
// 用 next 指针串起来，头结点就是 Fiber.memoizedState

// currentlyRenderingFiber：指当前渲染组件的 Fiber 对象

// workInProgressHook：指当前运行到哪个 hooks 了，
// 我们一个组件内部可以有多个 hook，而当前运行的 hook 只有一个

// hook 节点：我们每一个 useState 语句，在初始化的时候，
// 都会产生一个对象，来记录它的状态，我们称它为 hook 节点

let currentlyRenderingFiber = {};
function useState(initState) {
  var hook = {
    memorizedState: null,
    baseState: null,
    baseQueue: null,
    queue: null,
    next: null
  }

  if (typeof initState === 'function') {
    initState = initState();
  }

  hook.memorizedState = initState;
  hook.baseState = initState;

  var dispatch = queue.dispatch = dispatchAction
      .bind(null, currentlyRenderingFiber, queue);

  currentlyRenderingFiber.memorizedState = hook;
  currentlyRenderingFiber.workInProgressHook = hook;
}

function dispatchAction(fiber, queue, action) {
  // .... 
}