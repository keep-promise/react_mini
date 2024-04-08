# _react
手写react

react整体工作原理：
1. jsx语法的react组件，编译底层调用React.createElement，转成json对象
(type, props[children...]) --> 虚拟dom
2. 生成的json对象，通过调用render函数，开始执行渲染任务，通过模拟requesrtIdleCallback执行调度任务
3. 调度任务主要渲染fiber节点，构建fiber children, 并返回下一个需要渲染fiber节点；
优先渲染child->sibling然后回溯parent，完成一个任务是可中断
4. Reconciliation-diff：协调过程通过在协调任务中构建filber children tree reconcileChildren 对比新老fiber，老fiber挂载在fiber.alternate
diff算法：
  a. 如果是相同标签，打上update标签;
  b. 如果有新节点没有老节点，但不是相同标签，打上PLACEMENT标签
  c. 如果有老节点没新，但不是相同标签，打上delete标签

5. 所有协调任务都完成后，开始commit[主要从根节点开始]

6. 开始渲染真实dom，通过上面Reconciliation-diff过程打上的标签，进行增删改的操作进行渲染，没有变化的节点，不重新渲染。
