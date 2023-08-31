import { Spin, Skeleton } from 'antd'

export function FullScreenLoading({ size = 'large', msg, transparent = false }) {
  return (
    <div
      className={`fixed inset-0 z-50 flex h-screen items-center justify-center ${
        transparent ? `bg-[--body-bg-color]` : `bg-white bg-opacity-10 backdrop-blur-sm`
      }`}
    >
      <Spin size={size} tip={msg} />
    </div>
  )
}

export function SkeletonLoading({ number = 1 }) {
  return (
    <>
      {Array(number)
        .fill()
        .map((_, index) => (
          <Skeleton active key={index} />
        ))}
    </>
  )
}
