# 基本使用

`TreeeSet` 也是常用的集合，底层基于 `TreeMap` 实现，非线程安全的容器

与 `HashSet` 相比，明显的区别在于，`TreeSet` 可以 **取出有序**

`TreeSet` 的有序取出，可以基于两种方式、规则

1. 通过元素自身实现比较规则
2. 通过比较器指定比较规则

TreeSet的常用方法

- `boolean add(E e)`：添加元素
- `E ceiling(E e)`：返回集合中大于、等于给定元素的元素集
- `void clear()`：清空元素
- `boolean contains(Object o)`：是否存在指定元素
- `E first()`：返回最小的元素，即第一个元素
- `SortedSet<E> headSet(E toElement)`：返回小于给定元素的部分元素视图
- `boolean isEmpty()`：容器是否为空

> 更多常用方法，请参考官方 API 手册，谢谢

# 排序规则

在 `TreeSet` 中，数据元素取出时，默认由小向大、有序取出

值得注意的是，自定义类对象作为元素，必须存在排序规则

Java中，实现数据的大小比较，采用的是`compareTo()`

```java
public final class Integer extends Number implements Comparable<Integer> {}

public int compareTo(Integer anotherInteger) {
	return compare(this.value, anotherInteger.value);
}
```

以上，是 `Integer` 类在实现 `Comparable` 接口，重写 `compareTo` 方法的源码

这就是 `TreeSet` 排序的第一个规则，通过元素自身的 **接口实现**、**方法重写**

---

`TreeSet` 的第一个比较方式，存在一个问题，需要在类的内部重写比较规则

而 `TreeSet` 的第二个比较规则，则可以将类对象元素的比较方式，抽离出来

`TreeSet(Comparator<? super E> comparator>`

以上是 `TreeSet` 的一个有参构造，它可以用于接收一个比较器，进行排序

`Comparator` 接口，可以被实现，并重写其中方法，例如 `int compare(T o1, T o2)`

实现 `Comparator` 接口、重写 `compare(T o1, T o2)` 方法的类，可以作为比较器存在

此时，通过这种方式，**数据元素自身，无须实现比较规则**

这就是 `TreeSet` 排序的第二个规则，单独的类，实现 `Comparator` 接口、重写 `compare(T o1, T o2)` 方法，并作为比较器，传入 `TreeSet` 有参构造中

# 底层实现

`TreeSet` 的底层是基于 `TreeMap` 实现的，对于它的源码，仅作了解即可

```java
private transient NavigableMap<E,Object> m;

public TreeSet() {
	this(new TreeMap<>());
}

	public boolean add(E e) {
	return m.put(e, PRESENT)==null;
}
```