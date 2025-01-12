export type Tuple2<T> = [T, T]
export type Tuple3<T> = [T, T, T]
export type Tuple4<T> = [T, T, T, T]
export type Tuple5<T> = [T, T, T, T, T]
export type Tuple6<T> = [T, T, T, T, T, T]

// 2x3 matrix indices
// a-d are the 2x2 matrix
// t1, t2 are the translation
const a = 0
const b = 1
const tx = 2
const c = 3
const d = 4
const ty = 5

/**
 * 2x2 matrix
 * | a b |
 * | c d |
 */
export type Mat2x2 = Tuple4<number>

/**
 * 2x3 matrix, typically describing an affine matrix
 * | a b tx |
 * | c d ty |
 */
export type Mat2x3 = Tuple6<number>

/**
 * 2D vector
 */
export type Vec2 = Tuple2<number>
/**
 * n-dimensional vector
 */
export type Vec = number[]

export const vec2 = (x: number, y: number): Vec2 => [x, y]
export const mat2x3 = (
  a: number,
  b: number,
  t1: number,
  c: number,
  d: number,
  t2: number,
): Mat2x3 => [a, b, t1, c, d, t2]
export const mat2x2 = (a: number, b: number, c: number, d: number): Mat2x2 => [
  a,
  b,
  c,
  d,
]

/**
 * Multiply a 2x3 matrix by a homogenized 2D vector (x, y, 1)
 * @param m
 * @param v
 */
export const mult = (m: Mat2x3, v: Vec2): Vec2 => [
  m[a] * v[0] + m[b] * v[1] + m[tx],
  m[c] * v[0] + m[d] * v[1] + m[ty],
]

// TOOD new name
/**
 * Multiply a 2x2 matrix by the 2x2 matrix in an affine matrix
 */
export const multAffine = (tM: Mat2x2, aM: Mat2x3): Mat2x3 =>
  mat2x3(
    tM[0] * aM[a] + tM[1] * aM[c],
    tM[0] * aM[b] + tM[1] * aM[d],
    aM[tx],
    tM[2] * aM[a] + tM[3] * aM[c],
    tM[2] * aM[b] + tM[3] * aM[d],
    aM[ty],
  )

/**
 * The determinant of the 2x2 matrix
 */
export const det = (m: Mat2x3): number => m[a] * m[d] - m[b] * m[c]

/**
 * The inverse of an affine matrix.
 * The new 2x2 matrix is the inverse of the 2x2 matrix in the affine matrix.
 * The translation is the negated multiplication of the inverse 2x2 matrix with the translation vector.
 * @param m
 */
export const inverse = (m: Mat2x3): Mat2x3 =>
  scale(
    [
      m[d],
      -m[b],
      m[b] * m[ty] - m[d] * m[tx],
      -m[c],
      m[a],
      m[c] * m[tx] - m[a] * m[ty],
    ],
    // The determinant is a shared factor
    1 / det(m),
  )

export const scale = <T extends Vec>(m: T, s: number): T =>
  m.map((x) => x * s) as T
export const div = <T extends Vec>(m: T, s: number): T =>
  m.map((x) => x / s) as T

export const neg = <T extends Vec>(m: T): T => m.map((x) => -x) as T
export const add = (a: Vec2, b: Vec2): Vec2 => [a[0] + b[0], a[1] + b[1]]
export const sub = (a: Vec2, b: Vec2): Vec2 => [a[0] - b[0], a[1] - b[1]]

/**
 * Cretae a 2x3 matrix that describes scaling and translation
 * @param options
 */
export const createMat2x3 = ({
  scale,
  translation,
}: {
  translation?: Vec2
  scale?: number
}): Mat2x3 =>
  mat2x3(
    scale ?? 1,
    0,
    translation?.[0] ?? 0,
    0,
    scale ?? 1,
    translation?.[1] ?? 0,
  )

export const toLinearMat2x2 = (m: Mat2x3): Mat2x2 =>
  mat2x2(m[a], m[b], m[c], m[d])

export const createMat2x2 = (options: { scale?: number }) =>
  toLinearMat2x2(createMat2x3(options))

// TODO test
// multAffine(createMat2x2({ scale: 2 }), createMat2x3({ scale: 3 })) => [6, 0, 0, 6, 0, 0]

export const translateAffine = (m: Mat2x3, v: Vec2): Mat2x3 => [
  m[a],
  m[b],
  m[tx] + v[0],
  m[c],
  m[d],
  m[ty] + v[1],
]

export const scaleAffine = (m: Mat2x3, s: number): Mat2x3 =>
  mat2x3(m[a] * s, m[b] * s, m[tx], m[c] * s, m[d] * s, m[ty])

export const getScaling = (m: Mat2x3): Vec2 => vec2(m[a], m[d])
export const getTranslation = (m: Mat2x3): Vec2 => vec2(m[tx], m[ty])
