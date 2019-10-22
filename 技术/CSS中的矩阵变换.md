---
Title: "CSS中的矩阵变换"
Author: BigLiao
Date: 2019-10-20
---

# CSS中的矩阵变换

![](https://cdn.bigliao.com/33f0c957f9047c831047a585346ce3b4.jpg)

## CSS3 中的 transform

`transform` 是 CSS3 中加入的用于控制形变的属性，搞前端肯定知道怎么用（不知道的去看看 [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/transform) 上的说明）。就是可以让你的元素进行*旋转*、*移动*、*缩放*等操作。

![](https://cdn.bigliao.com/7578907024066164e5e5563b7cb6eb47.png)

怎么使用 `transform` 不是本文的重点。一般我们只用 `translate`、`scale` 这些简单的属性，几乎不用 `matrix`，因为这个看起来就很复杂（实际上确实是的）。

`matrix` 就是**矩阵**的意思，本文讲深入探讨这个 `matix` 属性。

## tranform matrix

### matrix 参数

`matrix` 里面接收 6 个数字作为参数，`matrix3d` 接收 16 个：

```css
transform: matrix(1.0, 2.0, 3.0, 4.0, 5.0, 6.0);
transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
```

乍一看非常吓人！怎么讲，还是 `translate` 、`sclae`、`skew` 这些好用，组合使用就可以处理完大部分问题。

其实 `matrix` 通过接收的 6 个参数来构成一个 $3 \times 3$ 的矩阵，还有另外 3 个是固定值。

```plain
matrix(a, b, c, d, e, f)
```

他们构成的矩阵如下：
$$
\begin{bmatrix}
a & c & e \\
b & d & f \\
0 & 0 & 1
\end{bmatrix}
$$


其中，a、 b、 c、d 用来描述线性变化，e、f 描述位移。

### matrix 用法

`matrix` 其实就是用了一个**矩阵乘法**。假如图像上一点的坐标为 $(x, y)$，经过变换后的坐标为 $(x', y')$，那么他们的关系是：
$$
\begin{bmatrix}
x' \\
y' \\
1
\end{bmatrix}
=
\begin{bmatrix}
a & c & e \\
b & d & f \\
0 & 0 & 1
\end{bmatrix}
\times
\begin{bmatrix}
x \\
y \\
1
\end{bmatrix}
=
\begin{bmatrix}
ax+cy+e \\
bx+dy+f \\
1
\end{bmatrix}
$$
换而言之，$x' = ax+cy+e$，$y'=bx+dy+f$。

#### 平移 translate

假如要实现一个平移操作，用`translate` 这样写：

```css
transform: translate(40, 50);
```

用 `matrix` 的话，可以让 $x' = 1x+0y+40$，$y'=0x+1y+50$，即：

```css
/* a,b,c,d,e,f 顺序不要错 */
transform: matrix(1,0,0,1,40,50);
```

e, f 是 `matrix` 中的平移因子。

#### 缩放 scale

对于缩放操作，其实也很简单，令 b, c, e, f 都为零，此时 $x' = ax$，$y'=dy$。显然， a, d 是 `matrix` 中的缩放因子。

```css
/* 这两种写法是等价的 */
transform: scale(1.5);
transform: matrix(1.5,0,,0,1.5,0,0);
```

#### 旋转 rotate

旋转就比较复杂了，它需要 a,b,c,d 四个参数来控制。如果要旋转角度为 $\phi$，那么对应的矩阵为：
$$
\begin{bmatrix}
\cos\phi & -\sin\phi & 0 \\
\sin\phi & \cos\phi & 0 \\
0 & 0 & 1
\end{bmatrix}
$$
下面是证明：
$$
\left\{
  \begin{array}{l}
  x'=x\cos\phi-y\sin\phi & \\
  y'=x\sin\phi+y\cos\phi
  \end{array}
\right.
$$
使用极坐标，令 $x=r\cos\theta, y=r\sin\theta$，那么
$$
\left\{
  \begin{array}{lr}
  x'=r(\cos\phi\cos\theta-\sin\phi\sin\theta) \\
  y'=r(\sin\phi\cos\theta+\cos\phi\sin\theta)
  \end{array}
\right.
\Rightarrow
\left\{
  \begin{array}{lr}
  x'=r\cos(\phi+\theta) \\
  y'=r\sin(\phi+\theta)
  \end{array}
\right.
$$


​					

## 矩阵

大学里的《线性代数》课我也没好好学，真是全忘了。现在才发现里面的东西还是很有用的，唉，真是悔不当初。怎么讲，**出来混，总是要还的**。

### 什么是矩阵

把一堆数字排成 $m$ 行 $n$ 列，就构成了一个 $m \times n$ 矩阵。例如一个 8 行 4 列的矩阵：
$$
\begin{bmatrix}
 1      & 2      & \cdots & 4      \\
 7      & 6      & \cdots & 5      \\
 \vdots & \vdots & \ddots & \vdots \\
 8      & 9      & \cdots & 0      \\
\end{bmatrix}
$$
它的 Latex 写法为：

```latex
\begin{bmatrix}
 1      & 2      & \cdots & 4      \\
 7      & 6      & \cdots & 5      \\
 \vdots & \vdots & \ddots & \vdots \\
 8      & 9      & \cdots & 0      \\
\end{bmatrix}
```

### 矩阵的运算

- 加法：两个相同类型的矩阵可以相加。结果就是对应元素相加。
- 数乘以矩阵：等于数乘以每个矩阵元素，矩阵形状不变。
- 矩阵乘以矩阵：只有左矩阵的列数等于右矩阵的行数，两个矩阵才可以相乘。例如 $m\times n$ 的矩阵乘以 $n\times k $ 的矩阵，得到的是 $m \times k$ 的矩阵。

### 矩阵的乘法

只有左矩阵的列数等于右矩阵的行数，两个矩阵才可以相乘。矩阵乘法是没有*交换律*的。
$$
\begin{bmatrix}
a_{11} & a_{12} & a_{13} \\
a_{21} & a_{22} & a_{23} \\
\end{bmatrix}
\times
\begin{bmatrix}
b_{11} & b_{12} \\
b_{21} & b_{22} \\
b_{31} & b_{32}
\end{bmatrix}
\\
=
\begin{bmatrix}
a_{11}b_{11}+a_{12}b_{21}+a_{13}b_{21} & a_{11}b_{12}+a_{12}b_{22}+a_{13}b_{23}\\
a_{21}b_{11}+a_{22}b_{21}+a_{23}b_{21} &
a_{21}b_{12}+a_{22}b_{22}+a_{23}b_{22} \\
\end{bmatrix}
$$
前面讲到的 `matrix` 变换，就是利用了矩阵的乘法。

## 矩阵与线性变换

这里的变换指的是一种映射关系，由空间 A 映射到空间 B，设 $\alpha \in A, \beta \in B$，映射为 $T$：
$$
\beta = T(\alpha)
$$
映射的概念是函数概念的推广。

**线性变换**，也叫做**线性映射**，它指的是保持*保持线性组合的对应的映射*。什么意思呢？就是如果原来的集合里面有某种线性组合，那么通过变换后这种线性组合依旧成立。

若 $\beta=k_1\alpha_1+k_2\alpha_2+\cdots+k_m\alpha_m$，则 $T(\beta)=k_1T(\alpha_1)+k_2T(\alpha_2)+\cdots+k_mT(\alpha_m)$

例如，
$$
\begin{bmatrix}
y_1\\y_2\\\vdots\\y_m
\end{bmatrix}
=
\begin{bmatrix}
a_{11}&a_{12}&\cdots&a_{1n}\\
a_{21}&a_{22}&\cdots&a_{2n}\\
\vdots&\vdots&\ddots&\vdots\\
a_{m1}&a_{m2}&\cdots&a_{mn}\\
\end{bmatrix}
\begin{bmatrix}
x_1\\x_2\\\vdots\\x_n
\end{bmatrix}
$$
也可以表示为 $\textbf{y=Ax}$，确定了从 $\textbf{x}$ 到 $\textbf{y}$ 的一个映射 $A$，而且 $A$ 是线性映射。

也就是说，CSS `transform` 中的 `matrix` ，就是一个从 $[x,y,1]^T$ 到 $[x',y',1]^T$ 的线性变换。为什么要多加一个 1 呢？直接 $[x,y]^T$ 到 $[x',y']^T$的变换不行吗？下面来探讨这个问题。

## 几何图形的线性变换

### 线性变换可以实现的操作

对于平面直角坐标系中的一点 $(x, y)$，可以用列矩阵来表示 $[x, y]^T$。经过线性变换后对应的点为 $[x', y']^T$。这个变换 $A$ 可以描述为：
$$
\begin{bmatrix}
x' \\
y'
\end{bmatrix}
=
\begin{bmatrix}
a_{11} & a_{12} \\
a_{21} & a_{22}
\end{bmatrix}
\begin{bmatrix}
x \\
y
\end{bmatrix}
$$
前面已经证明了旋转可以用线性变换来表示，即：
$$
\begin{bmatrix}
\cos\phi & -\sin\phi \\
\sin\phi & \cos\phi \\
\end{bmatrix}
$$
缩放 $k$ 倍的线性变换：
$$
\begin{bmatrix}
k & 0 \\
0 & k \\
\end{bmatrix}
$$
你也可以对 $x, y$ 方向使用不同的缩放因子，达到斜推（错切）的效果。

值得注意的是：**由于线性变换的性质，原来平行的线段，经过线性变换后依旧会保持平行**。

线性变换可以实现类似 CSS `transform` 中的 `scale`、`rotate`、`skew`，但是没有 `translate`。实际上，线性变换没办法实现平移。

### 为什么线性变换不能平移

假如线性变换可以实现平移的话，那 `matrix` 就只需要 4 个参数就可以了，岂不美哉？

我们可以假设平移操作，假设移动向量为 $[\alpha, \beta]^T$，那么
$$
\begin{bmatrix}
x' \\
y'
\end{bmatrix}
=
\begin{bmatrix}
x \\
y
\end{bmatrix}
+
\begin{bmatrix}
\alpha \\
\beta
\end{bmatrix}
=
\begin{bmatrix}
a_{11} & a_{12} \\
a_{21} & a_{22}
\end{bmatrix}
\begin{bmatrix}
x \\
y
\end{bmatrix}
\\
=
\begin{bmatrix}
a_{11}x+a_{12}y \\
a_{21}x+a_{22}y
\end{bmatrix}
$$
可以列出方程组：
$$
\left\{
  \begin{array}{l}
  a_{11}x+a_{12}y + 0 + 0 = x + \alpha \\
  0 + 0 + a_{21}x+a_{22}y = y + \beta
  \end{array}
\right.
$$
我们要找出这样的 $a_{11},a_{12},a_{21},a_{22}$ 时等式成立，即求解 $a_{11},a_{12},a_{21},a_{22}$。

用矩阵来表示这个方程组：
$$
\begin{bmatrix}
x & y & 0 & 0 \\
0 & 0 & x & y \\

\end{bmatrix}
\begin{bmatrix}
a_{11} \\
a_{12} \\
a_{21} \\
a_{22}
\end{bmatrix}
=
\begin{bmatrix}
x+\alpha \\
y+\beta \\
\end{bmatrix}
$$
根据《线代》中的结论，方程组有解的充分必要条件是**系数矩阵的秩等于增广矩阵的秩**。

当 $x=y=0$ 时，显然是没有解的。

其他情况好像有解？？？**WTF**？

我思考了一下，得出的解 $[a_{11},a_{12},a_{21},a_{22}]^T$ 是与 $x, y$ 相关的，说明找不到这样的常数。

这个解题思路应该是**错误**的。让我们回到方程组：
$$
\left\{
  \begin{array}{l}
  a_{11}x+a_{12}y = x + \alpha \\
  a_{21}x+a_{22}y = y + \beta
  \end{array}
\right.
$$

$$
\left\{
  \begin{array}{l}
  (a_{11}-1)x+a_{12}y = \alpha \\
  a_{21}x+(a_{22}-1)y = \beta
  \end{array}
\right.
$$

要使得对任意 $x, y$，方程组都成立，则 $x, y$ 项的系数应该为零。得到的结果是 $\alpha=\beta=0$，就是不移动……。所以结论是线性变换不能做平移操作。

## 仿射变换

仿射变换就是在线性变换的基础上加入了平移操作。它实际上是用三维的线性变换来实现二维的平移操作。维基百科上的示意图很好地说明了这一点：

![](https://cdn.bigliao.com/6ec464501d6846f9e20d56a7d5b3b0b6.gif)

三维空间的线性变换跟二维空间一样，也不能进行平移操作。在保持 $z$ 轴不变的情况下，三维空间内进行斜推，投影到二维内就是平移。CSS `transform` 中的 `matrix` 用的就是仿射变换，所以它需要的变换矩阵是 $3\times3$的矩阵。
$$
\begin{bmatrix}
a & c & e \\
b & d & f \\
0 & 0 & 1
\end{bmatrix}
\times
\begin{bmatrix}
x \\
y \\
1
\end{bmatrix}
$$


同理可知的是，对三维空间进行平移，需要的是四维空间的线性变换。

## 使用矩阵进行复合变换

你可能会问，知道这些知识有什么用呢？当然很有用！普通的 `translate`、`scale`等组合无法实现变换，矩阵就可以。

### 镜像变换

我们以水平镜像为例，变换后的坐标关系为 $(x', y') = (-x, y)$，求出变换矩阵即可。由
$$
\begin{bmatrix}
x' \\
y' \\
1
\end{bmatrix}
= 
\begin{bmatrix}
-x \\
y \\
1
\end{bmatrix}
=
\begin{bmatrix}
a & c & e \\
b & d & f \\
0 & 0 & 1
\end{bmatrix}
\times
\begin{bmatrix}
x \\
y \\
1
\end{bmatrix}
$$
得到方程组：
$$
\left\{
\begin{array}{l}
-x = ax + cy + e \\
y = bx + dy + f
\end{array}
\right.
$$
等式对任意 $x, y$ 都要成立，可以解得：$a = -1, d = 1$，其他 $b, c, e, f$ 都等于 0 。也就是说，镜像变换的 CSS 应该这样写：

```css
.mirror_transform {
  transform: matrix(-1, 0, 0, 1, 0, 0);
}
```

这里只是一个求解思路，假如你需要的是 $(x', y') = (-2x + 1, y + 2)$ 这种变换，按着这样求解就行。

### 复合变换

如果我们需要的不是一次变换，而是多次变换（例如，先平移，再缩放，再斜推……），这个时候普通 CSS `transform` 倒是支持多个变换并列的写法，但是不觉得这样很麻烦么？用矩阵，一次到位，逼格一下就上来了。

这里的核心知识是，线性变换就是**左乘**了一个矩阵。多次线性变换，就是左乘了多个矩阵。矩阵乘法是有结合律的（注意没有交换律），可以先把所有变换矩阵先乘起来，得到的就是最终的变换矩阵。

#### 举个栗子

要对某个图像依次进行如下变换：

1. 向右平移 20px
2. 缩放 1.5 倍
3. 顺时针旋转 30deg

#### 普通写法

依次写就行了，很直观。

```css
transform: translate(20px, 0) scale(1.5) rotate(30deg);
```

#### 矩阵写法

先计算出变换矩阵。向右平移 20px 的矩阵：
$$
T_1 = 
\begin{bmatrix}
1 & 0 & 20 \\
0 & 1 & 0 \\
0 & 0 & 1
\end{bmatrix}
$$
缩放 1.5 倍的矩阵：
$$
T_2 = 
\begin{bmatrix}
1.5 & 0 & 0 \\
0 & 1.5 & 0 \\
0 & 0 & 1
\end{bmatrix}
$$
旋转 30deg 就比较麻烦了：
$$
T_3 =
\begin{bmatrix}
\cos30^o & -\sin30^o  & 0 \\
\sin30^o  & \cos30^o  & 0\\
0 & 0 & 1
\end{bmatrix}
=
\begin{bmatrix}
0.866 & -0.5 & 0 \\
0.5 & 0.866 & 0 \\
0 & 0 & 1
\end{bmatrix}
$$
做一个矩阵乘法，注意左乘的顺序，不能反：
$$
T_3 \times \ T_2 \times T_1 =
\begin{bmatrix}
1.299 & -0.75 & 25.98 \\
0.75 & 1.299 & 0 \\
0 & 0 & 1
\end{bmatrix}
$$
这个时候的 CSS 写法就是：

```css
transform: matrix(1.299, 0.75, -0.75, 1.299, 25.98,0);
```

可以验证一下，这两种写法最终得到的效果是一样的。

这种写法虽然笔算起来麻烦，但对计算机来说这都不是事儿。对于计算机图像处理来讲，这就是很有必要了。对于我们这种 CSS 切图仔来讲，也可以很好的装逼不是吗！

## 结语

本文针对 CSS 中的矩阵变换，结合《线性代数》知识做了一些思考。以前觉得没啥用的知识，忽然就鲜活了起来。数学确实很重要，要拾起来一些了。

