# 基本使用

`Vector` 也是基于数组实现的，常用方法与 `Arraylist` 类似

值得注意的是，`Vector` 是 **线程安全的容器**

相反，`ArrayList` 是线程不安全的容器

这也就造成了 `ArrayList`、`Vector` 容器的差异：`Vector` 在保证了线程安全的同时，在使用效率上就低于 `Arraylist`

**在实现线程安全的同时，不可避免的造成更多的资源开销**

这里，可以尝试大批量向 ArrayList、Vector 中插入元素，计算程序的执行时间

二者的使用需要根据实际的场景确定，`ArrayList` 依旧是最常用的容器类

另外，`Vector` 下还有一个子类，`Stack`，可以扩展部分功能

# Vector 子类 Stack

`Stack` 作为 `Vector` 的子类，它的底层是基于 ` 栈 ` 实现的

`Stack` 栈容器的特有方法

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

再次强调，源码的分析必须结合 JDK 的版本

官方的源码并非一成不变，它是随着版本的更新而不断优化的、

若有可能，十年后的人看到这篇文章：这写的什么垃圾玩意，还 JDK11！？？？
