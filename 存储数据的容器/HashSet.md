# 基本使用

`HashSet` 的底层是 `HashMap`，而 `HashMap` 的底层是基于数组、单向链表实现的

基于此，`HashSet` 的修改、查询效率都比较高，但依旧是非线程安全的容器

`HashSet` 常用的 API 方法

- `boolean add(E e)`：添加元素至集合中
- `void clear()`：清空集合中的元素
- `Object clone()`：HashSet实例的浅拷贝
- `boolean contains(Onject o)`：是否包含指定元素
- `boolean isEmpty()`：是否为空
- `Iterator<E> iterator()`：返回元素的迭代器
- `boolean remove(Object o)`：移除指定的元素
- `int size()`：返回数据元素的个数

```java
HashSet<Integer> hashSet = new HashSet<>();

// 添加元素
hashSet.add(1);
hashSet.add(2);

// 查看元素个数
System.out.println(hashSet.size());

// 删除元素
System.out.println(hashSet.remove(1));

// 是否为空
System.out.println(hashSet.isEmpty());

// 清空元素
hashSet.clear();

// 遍历元素
hashSet.add(5);
hashSet.add(6);
hashSet.add(7);
for (Integer i : hashSet) {
	System.out.println(i);
}
```

# 无序、不重复

之前有提到过，集合容器的存储是 **无序**、**不重复** 的

值得注意的是，无序是指 **存储无序**、**取出无序**；不重复也包括 `NULL` 值不重复

`HashSet` 的无序：

- `HashSet` 的无序，不是随机的无序，也不存在真正的随机数
- `HashSet` 的无序，是数据元素根据各自的 **哈希值** 确定存储位置
- 数据元素的哈希值，经过运算，得到唯一的存储地址

简单的概括为一句话，**`HashSet` 的无序，其元素存储地址是基于哈希值的运算结果**

`HashSet` 的去重：
- `HashSet` 的去重，实际使用的是 `equals()` 方法
- 若两个数据元素的哈希值运算一致，则调用 `equals()` 二次判断
- 若 `equals()` 判断不通过，则该元素去重，不添加进容器内
- 若 `equals()` 判断通过，则该元素添加至单链表中，节点地址存储在数组中

对于 `HashSet` 的去重，其中的判定流程做详细说明

- 添加元素 A，其哈希值运算的存储地址，若不存在元素，则直接添加
- 若该存储地址已存在数据元素 B，则二者需要调用 `equals()` 再次判断
- 若这两个元素也通过了 `equals()` 的判断
- 那么，元素 A、B 将存在一个单向链表中，节点地址存储在元素 B 的数组索引位置

上述可以看出，`HashSet` 的存储特征，通过判定的相同元素，单独存储链表中

值得注意的是，`HashSet` 的链表是单向链表

对于自定义的 Java 类对象，一定要重写 `hashcode()`，这是去重判断的第一个依据

> 哈希值相同的元素，其存储位置相同，但是否存储需要经过 `equals()`
> 
> 哈希值由类对象提供，`HashSet` 只负责重写 `equals()`

以包装类 `Integer` 为例，它已经重写 `hashcode()`，无法添加相同的数据元素

简单的概括为一句话，**`HashSet` 的重复元素，会经历 `equals()` 的二次判定**

对于 HashSet，只需要记住一点，**理解了 HashMap，就理解了 HashSet**

# 底层实现

之前有说过，`HashSet` 的底层是基于 `HashMap` 实现的

```java
private transient HashMap<E,Object> map;

public HashSet() {
	map = new HashMap<>();
}

public boolean add(E e) {
	return map.put(e, PRESENT)==null;
}
```

可以很清晰的看到，`HashSet` 在初始化、添加元素，都是使用的 `HashMap`

值得注意的是，HashSet 的值相当于 HashMap 的键，直接看源码

```java
public boolean add(E e) {
	return map.put(e, PRESENT)==null;
}
```

可以看出，HashSet 的元素作为了键，而 Map 的值则是一个固定的数

`private static final Object PRESENT = new Object();`
