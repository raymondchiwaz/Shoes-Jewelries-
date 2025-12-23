"use client"

import { useEffect, useState } from "react"

export default function UrgencyBanner() {
  const [timeLeft, setTimeLeft] = useState({
    days: 2,
    hours: 14,
    minutes: 32,
    seconds: 15,
  })

  // Countdown logic
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        let { days, hours, minutes, seconds } = prev

        if (seconds > 0) {
          seconds--
        } else if (minutes > 0) {
          minutes--
          seconds = 59
        } else if (hours > 0) {
          hours--
          minutes = 59
          seconds = 59
        } else if (days > 0) {
          days--
          hours = 23
          minutes = 59
          seconds = 59
        }

        return { days, hours, minutes, seconds }
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative bg-gradient-to-r from-red-600 via-red-500 to-red-700 text-white py-3 md:py-4 overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0 bg-black/10 animate-pulse"></div>

      <div className="relative nordstrom-container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          {/* Message */}
          <div className="flex items-center gap-3">
            <span className="text-2xl animate-bounce">🔥</span>
            <div>
              <p className="text-sm md:text-base font-bold uppercase tracking-wider">
                Black Friday Exclusive
              </p>
              <p className="text-xs md:text-sm text-red-100">
                Free shipping over $89 • 60-day returns for VIP
              </p>
            </div>
          </div>

          {/* Countdown Timer */}
          <div className="flex items-center gap-2">
            <span className="text-xs md:text-sm font-semibold uppercase tracking-wider">
              Ends In:
            </span>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
              <div className="text-center">
                <div className="text-lg md:text-2xl font-bold">
                  {String(timeLeft.days).padStart(2, "0")}
                </div>
                <div className="text-xs uppercase">Days</div>
              </div>
              <span className="text-xl font-bold">:</span>
              <div className="text-center">
                <div className="text-lg md:text-2xl font-bold">
                  {String(timeLeft.hours).padStart(2, "0")}
                </div>
                <div className="text-xs uppercase">Hrs</div>
              </div>
              <span className="text-xl font-bold">:</span>
              <div className="text-center">
                <div className="text-lg md:text-2xl font-bold">
                  {String(timeLeft.minutes).padStart(2, "0")}
                </div>
                <div className="text-xs uppercase">Min</div>
              </div>
              <span className="text-xl font-bold">:</span>
              <div className="text-center">
                <div className="text-lg md:text-2xl font-bold">
                  {String(timeLeft.seconds).padStart(2, "0")}
                </div>
                <div className="text-xs uppercase">Sec</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
