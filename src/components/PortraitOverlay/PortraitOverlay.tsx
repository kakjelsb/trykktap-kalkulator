/**
 * Portrait Mode Overlay
 *
 * Displays a message asking the user to rotate their device to landscape mode.
 */

import { useState, useEffect } from 'react'
import { t } from '../../i18n'
import './PortraitOverlay.css'

export function PortraitOverlay() {
  const [isPortrait, setIsPortrait] = useState(false)

  useEffect(() => {
    const checkOrientation = () => {
      // Check if window height > width (portrait mode)
      setIsPortrait(window.innerHeight > window.innerWidth)
    }

    // Check on mount
    checkOrientation()

    // Listen for resize/orientation changes
    window.addEventListener('resize', checkOrientation)
    window.addEventListener('orientationchange', checkOrientation)

    return () => {
      window.removeEventListener('resize', checkOrientation)
      window.removeEventListener('orientationchange', checkOrientation)
    }
  }, [])

  if (!isPortrait) {
    return null
  }

  return (
    <div className="portrait-overlay">
      <div className="portrait-overlay-content">
        <span className="portrait-overlay-icon">📱↻</span>
        <p className="portrait-overlay-text">{t.app.rotateDevice}</p>
      </div>
    </div>
  )
}
