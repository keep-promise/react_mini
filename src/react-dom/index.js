// fiber解决同步渲染的问题，优化成异步渲染，链表【return、child、sibling】
// 每一个element都是一个节点，转成链表结构
// 结构：树 -》平铺结构
// 异步渲染：类似 requestIdleCallback -- render阶段
// 同步 --- commit阶段

// 基于fiber创建真实dom
function createDOM(fiber) {
  const { type, props = {} } = fiber;
  // 创建元素
  const dom = type === 'TEXT_ELEMENT' ? 
    document.createTextNode('') :
    document.createElement(type);

  // 元素添加属性
  Object.keys(props).forEach(key => {
    if (key !== 'children') {
      dom[key] = props[key];
    }
  });

  return dom;
}

// 
function render(element, container) {
  // 初始化第一个fiber-->root fiber
  wipRoot = {
    dom: container,
    props: {
      children: [element]
    },
    alternate: currentRoot,
    sibling: null, 
    child: null,
    parent: null
  };
  deletion = [];
  nextUnitOfWork = wipRoot;
}

// 调度渲染实现
let nextUnitOfWork = null; // 下一次渲染的节点
let wipRoot = null;
let currentRoot = null;
let deletion = null;

// commit阶段 -- 这一个过程同步执行，不可中断
function commitRoot() {
  deletion.forEach(commitWork);
  commitWork(wipRoot.child);
  currentRoot = wipRoot;
  wipRoot = null;
}

function commitWork(fiber) {
  if (!fiber) {
    return;
  }

  let domParentFiber = fiber.parent;
  while(!domParentFiber.dom) {
    domParentFiber = domParentFiber.parent;
  }
  const parentDOM = domParentFiber.dom;

  // const parentDOM = fiber.parent.dom;

  if(fiber.effectTag === 'PLACEMENT' && fiber.dom) {
    parentDOM.appendChild(fiber.dom);
  } else if(fiber.effectTag === 'DELETION' && fiber.dom) {
    // parentDOM.removeChild(fiber.dom);
    // 函数式组件没有dom
    commitDeletion(fiber, parentDOM);
  } else if(fiber.effectTag === 'UPDATE' && fiber.dom != null) {
    updateDom(fiber.dom, fiber.alternate.props, fiber.props);
  }
  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

function commitDeletion(fiber, domParent) {
  if (fiber.dom) {
    domParent.removeChild(fiber.dom)
  } else {
    commitDeletion(fiber.child, domParent)
  }
}

function updateDom(dom, prevProps, nextProps) {
  const isEvent = (key) => key.startsWith('on');
  // 删除已经没有的或者发送变化的事件处理函数
  Object.keys(prevProps)
    .filter(isEvent)
    .filter(key => !key in nextProps || prevProps[key] != nextProps[key])
    .forEach(key => {
      const eventType = key.toLowerCase().substring(2);
      dom.removeEventListener(eventType, prevProps[key]);
    })

  // 添加事件处理函数
  Object.keys(nextProps)
    .filter(isEvent)
    .filter(key => prevProps[key] !== nextProps[key])
    .forEach(key => {
      const eventType = key.toLowerCase().substring(2);
      dom.addEventListener(eventType, nextProps[key]);
    })


  // 删除已经没有的props
  Object.keys(prevProps)
    .filter(key => key !== 'children')
    .filter(key => !key in nextProps)
    .forEach(key => {
      dom[key] = '';
    });
  
  // 赋予新的或者改变的props
  Object.keys(nextProps)
    .filter(key => key !== 'children')
    .filter(key => !key in nextProps || prevProps[key] != nextProps[key])
    .forEach(key => {
      dom[key] = nextProps[key];
    })
}

// 调度函数
function workLoop(deadLine) {
  console.log('111')
  let shouldYield = false; // 是否中断
  // 有工作且不应该中断
  while(!shouldYield && nextUnitOfWork) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork); // 做工作
    shouldYield = deadLine.timeRemaining() < 1; // 剩余时间小于1ms，要中断
  }

  // 没有fiber要render，且wipRoot存在，就执行commit阶段
  if (!nextUnitOfWork && wipRoot) {
    commitRoot()
  }

  // 没有足够的时间，请求下一次浏览器空闲时间调度
  requestIdleCallback(workLoop); // 异步
}

// 第一次浏览器空闲时间调度
requestIdleCallback(workLoop);

// 渲染fiber节点，并返回下一个需要渲染的fiber节点
function performUnitOfWork(fiber) {
  // 创建dom元素
  // if(!fiber.dom) {
  //   fiber.dom = createDOM(fiber);
  // }

  // 处理函数组件
  const isFunctionComponent = fiber.type instanceof Function;
  if (isFunctionComponent) {
    updateFunctionComponent(fiber);
  } else {
    updateHostComponent(fiber);
  }

  // 追加父节点 -- render阶段不要追加dom，render阶段和commit阶段分离
  // 原因：[commit阶段]挂载到dom上，挂载部分dom时中断，出现部分数据更新，部分数据未更新
  // 用户看到不完整，因此将挂载dom抽离到 [commit阶段]，同步挂载
  // if(fiber.parent) {
  //   fiber.parent.dom.appendChild(fiber.dom);
  // }

  // children创建fiber
  // const children = fiber.props.children;

  // 抽离逻辑
  // let preSibling = null;

  // // 构建fiber，并建立联系
  // for(let i = 0; i < children.length; i++) {
  //   const child = children[i];
  //   const newFiber = {
  //     type: child.type,
  //     props: child.props,
  //     parent: fiber,
  //     dom: null,
  //     child: null,
  //     sibling: null
  //   };

  //   // fiber.child指向第一个子元素
  //   if (i==0) {
  //     fiber.child = newFiber;
  //   } else {
  //     // 不是第一个就是兄弟
  //     preSibling.sibling = newFiber;
  //   }
  //   // 保存上一个fiber，下一次循环，让他的兄弟指向基于其他儿子(非第一个儿子）创建的fiber
  //   preSibling = newFiber;
  // }

  // reconcileChildren(fiber, children);

  // 返回下一个fiber
  if (fiber.child) {
    return fiber.child;
  }
  let nextFiber = fiber;
  while(nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.parent;
  }
}

function updateHostComponent(fiber) {
  // 创建dom元素
  if(!fiber.dom) {
    fiber.dom = createDOM(fiber);
  }
  // children创建fiber
  const children = fiber.props.children;
  reconcileChildren(fiber, children);
}

// 记住上一次的fiber
let wipFiber = null;
let hookIndex = null;

// 处理函数式组件
function updateFunctionComponent(fiber) {
  wipFiber = fiber;
  hookIndex = 0;
  wipFiber.hooks = [];
  const children = [fiber.type(fiber.props)];
  reconcileChildren(fiber, children);
}

export function useState(initial) {
  const oldHook = 
    wipFiber.alternate && 
    wipFiber.alternate.hooks && 
    wipFiber.alternate.hooks[hookIndex];

  console.log('wipFiber', wipFiber, oldHook, hookIndex)
  const hook = {
    state: oldHook ? oldHook.state : initial,
    queue: []
  };

  const actions = oldHook ? oldHook.queue : [];
  actions.forEach(action => {
    hook.state = action(hook.state);
  })

  const setState = action => {
    console.log('setState1', hook.state);
    hook.queue.push(action);
    wipRoot = {
      dom: currentRoot.dom,
      props: currentRoot.props,
      alternate: currentRoot
    }; // 为了方便，更新从根节点Root开始更新。react源码有优化
    nextUnitOfWork = wipRoot;
    deletion = [];
  }
   
  wipFiber.hooks.push(hook);
  hookIndex++;
  console.log('setState', hook.state);
  return [hook.state, setState];
}

// 新建fiber，构建fiber
function reconcileChildren(wipFiber, elements) {
  let index = 0;
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
  let preSibling = null;

  while(index < elements.length || oldFiber) {
    const element = elements[index];
    const sameType = element && oldFiber && element.type === oldFiber.type;
    let newFiber = null;

    if (sameType) {
      // 更新
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: 'UPDATE'
      }
    }

    if(element && !sameType) {
      // 新建
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: wipFiber,
        alternate: null,
        effectTag: 'PLACEMENT'
      }
    }

    if(oldFiber && !sameType) {
      // 删除
      oldFiber.effectTag = 'DELETION';
      deletion.push(oldFiber);
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }
    
    if (index === 0) {
      wipFiber.child = newFiber;
    } else {
      preSibling.sibling = newFiber;
    }
    preSibling = newFiber;
    index++;
  }
}

export {
  render
}
