# 概述

Vector 使用的并不是很多，但相较于 ArrayList，它实现了线程安全，无须统计容器的修改操作

同样的，Vector 底层也是基于数组实现，常用方法与 ArrayList 类似。当然，在细节上存在些许不同

**不要去考虑 Vector 是否存在线程不安全的可能，一定是有的，但这无须在意**

对于基本的方法，不再做介绍

# Vector 子类 Stack

`Stack` 作为 `Vector` 的子类，它的底层是基于 ` 栈 ` 实现的，这里介绍 `Stack` 栈容器的特有方法

- `boolean empty()` ：判断此栈是否为空
- `E peek()` ：查看栈顶的元素对象
- `E pop()` ：删除栈顶的元素对象，并返回该对象
- `E push(E item)` ：添加一个数据元素至栈顶
- `int search(Object o)` ：返回某个对象在栈中的位置

`Stack` 栈容器的扩展方法 使用示例

```java
Stack<String> stack = new Stack<>();

// 元素添加
stack.push("1");
stack.push("2");
stack.push("3");

// 查看栈顶的元素对象
System.out.println(stack.peek());

// 判断此栈是否为空
System.out.println(stack.empty());

// 删除栈顶的元素
System.out.println(stack.pop());

// 遍历栈中的元素，索引自栈底向栈顶
for (String s : stack) {
	System.out.println(s);
}

// 查看某个对象在栈中的位置，当对象不存在时，返回 -1
System.out.println(stack.search("3"));
```

# 线程安全

之前说到过，`Vector`、`ArrayList` 的常用方法、源码组成大致相同

二者最大的区别在于，`Vector` 是线程安全的

现在，开始分析 `Vector` 的源码，找出其实现线程安全的关键

`Vector` 添加元素：注意 `synchronized`

```java
// synchronized 修饰的方法，在同一时间点，只允许被一个线程访问、使用
public synchronized boolean add(E e) {
	modCount++;
	add(e, elementData, elementCount);
	return true;
}
```

上述是 Vector 的元素添加方法，可以很清晰的看到不同，`synchronized` 关键字做修饰

打开 Vector 其它的涉及数组操作的方法，都可以看到 `synchronized` 的存在

`public synchronized E remove(int index) {}`

`public synchronized boolean addAll(int index, Collection<? extends E> c) {}`

# 初始化

`Vector` 的初始化：默认数组的长度是 10

```Java
// 第一步：无参构造，传入 10
public Vector() {
	this(10);
}

// 第二步：有参构造
public Vector(int initialCapacity) {
	this(initialCapacity, 0);
}

// 第三步：有参构造
public Vector(int initialCapacity, int capacityIncrement) {
	super();
	if (initialCapacity < 0)
		throw new IllegalArgumentException("IllegalCapacity:"+ initialCapacity);
	// 数据长度扩容为 10
	this.elementData = new Object[initialCapacity];
	this.capacityIncrement = capacityIncrement;
}
```

与 `ArrayList` 不同，`Vector` 在初始化时，便将数组的长度扩容为 10

简单的说，`ArrayList` 默认数组为空，而 `Vector` 默认数组为 10

# 扩容

`Vector` 元素添加：添加元素时，可能会进行二倍的数组扩容

```java
public synchronized boolean add(E e) {
	modCount++;
	add(e, elementData, elementCount);
	return true;
}

private void add(E e, Object[] elementData, int s) {
	// 判断当前元素个数是否与数组长度相等
	if (s == elementData.length)
		// 开始扩容，依旧是 grow() 方法
		elementData = grow();
	elementData[s] = e;
	// elementCount：当前数组的实际元素个数，与 ArrayList 的 size 类似
	elementCount = s + 1;
}

private Object[] grow() {
	return grow(elementCount + 1);
}

// 拷贝新数组，完成旧数组的扩容
private Object[] grow(int minCapacity) {
	return elementData = Arrays.copyOf(elementData, newCapacity(minCapacity));
}

// 数组扩容，创建新数组
private int newCapacity(int minCapacity) {
	int oldCapacity = elementData.length;
	// capacityIncrement：记录当前数组的容量增长，可见于构造方法的扩容
	// Vector 默认扩容至原有长度的两倍，与 ArrayList 的 1.5 被不同
	int newCapacity = oldCapacity + ((capacityIncrement > 0) ? capacityIncrement : oldCapacity);
	if (newCapacity - minCapacity <= 0) {
		if (minCapacity < 0) 
			throw new OutOfMemoryError();
		return minCapacity;
	}
	// 判断数组当前扩容是否接近极限
	return (newCapacity - MAX_ARRAY_SIZE <= 0)
		? newCapacity
		: hugeCapacity(minCapacity);
}

// 若二次扩容依旧无法满足，则直接扩容至最大容量
private static int hugeCapacity(int minCapacity) {
	if (minCapacity < 0) 
		throw new OutOfMemoryError();
	return (minCapacity > MAX_ARRAY_SIZE) ?
		Integer.MAX_VALUE :
		MAX_ARRAY_SIZE;
}
```

与 `ArrayList` 相比，`Vector` 的扩容还是存在区别的：**每次扩容，增加至原来的二倍**

当然，在大体的流程上，还是极为相似的

`Vector` 的源码分析并不复杂，核心就是线程安全的部分，在扩容上无明显变化
