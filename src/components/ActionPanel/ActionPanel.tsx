/**
 * ActionPanel Component
 *
 * Right-aligned vertical menu with editing actions.
 * Optimized for landscape mode.
 */

import { t } from '../../i18n'
import { useLayoutStore } from '../../store'

export function ActionPanel() {
  const clearLayout = useLayoutStore((state) => state.clearLayout)

  return (
    <div className="panel panel--right">
      {/* Header */}
      <div className="panel__header">
        <span className="panel__header-icon">⚙️</span>
      </div>

      {/* Divider */}
      <div className="panel__divider" />

      {/* Actions */}
      <div className="panel__content">
        {/* Clear/Reset */}
        <button
          className="panel__item"
          onClick={clearLayout}
          title={t.toolbar.reset}
        >
          <span className="panel__item-icon">🔄</span>
          <span className="panel__item-label">{t.toolbar.reset}</span>
        </button>
      </div>
    </div>
  )
}
