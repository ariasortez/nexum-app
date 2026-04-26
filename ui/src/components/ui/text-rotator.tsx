"use client"

import { useState, useEffect, useCallback } from "react"

interface TextRotatorProps {
  words: string[]
  interval?: number
  className?: string
}

export function TextRotator({ words, interval = 2500, className }: TextRotatorProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const rotateWord = useCallback(() => {
    setIsVisible(false)

    const changeTimeout = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % words.length)
      setIsVisible(true)
    }, 250)

    return () => clearTimeout(changeTimeout)
  }, [words.length])

  useEffect(() => {
    if (!mounted) return

    const timer = setInterval(rotateWord, interval)
    return () => clearInterval(timer)
  }, [mounted, interval, rotateWord])

  if (!mounted) {
    return (
      <span className={className}>
        {words[0]}
      </span>
    )
  }

  return (
    <span
      className={`inline-block ${className}`}
      style={{ minWidth: "fit-content" }}
    >
      <span
        style={{
          display: "inline-block",
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "translateY(0)" : "translateY(8px)",
          transition: "opacity 250ms ease-out, transform 250ms ease-out",
        }}
      >
        {words[currentIndex]}
      </span>
    </span>
  )
}
