/**
 * Sidebar Component
 *
 * Left-aligned vertical menu with logo and collapsible equipment groups.
 * Optimized for landscape mode.
 */

import { useState } from 'react'
import { t } from '../../i18n'
import { equipmentCatalog, type Equipment, type EquipmentCategory } from '../../models'
import { useLayoutStore } from '../../store'
import { getEquipmentIcon } from '../../constants'
import './Sidebar.css'

// Layout constants
const DEFAULT_SOURCE_POSITION = { x: 100, y: 150 }
const DEFAULT_TERMINAL_POSITION = { x: 400, y: 150 }
const POSITION_OFFSET_RANGE = 30

// Equipment categories in display order (excluding source - added automatically)
const categories: EquipmentCategory[] = ['pump', 'hose', 'connector', 'terminal']

// Category icons
const categoryIcons: Record<EquipmentCategory, string> = {
  source: '💧',
  pump: '⛽',
  hose: '〰️',
  connector: '🔀',
  terminal: '🎯',
}

// Category labels
const categoryLabels: Record<EquipmentCategory, string> = {
  source: t.equipment.source,
  pump: t.palette.pumps,
  hose: t.palette.hoses,
  connector: t.palette.connectors,
  terminal: t.palette.terminals,
}

const equipmentByCategory = categories.reduce((acc, cat) => {
  acc[cat] = equipmentCatalog.filter(e => e.type === cat)
  return acc
}, {} as Record<EquipmentCategory, Equipment[]>)

function getEquipmentLabel(equipment: Equipment): string {
  const key = equipment.nameKey.split('.')[1] as keyof typeof t.equipment
  return t.equipment[key] || equipment.id
}

interface CategoryGroupProps {
  category: EquipmentCategory
  items: Equipment[]
  onAdd: (equipment: Equipment) => void
}

function CategoryGroup({ category, items, onAdd }: CategoryGroupProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className={`sidebar-group ${isExpanded ? 'expanded' : ''}`}>
      <button
        className="sidebar-group-header"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <span className="sidebar-group-icon">{categoryIcons[category]}</span>
        <span className="sidebar-group-label">{categoryLabels[category]}</span>
        <span className="sidebar-group-arrow">{isExpanded ? '▼' : '▶'}</span>
      </button>

      {isExpanded && (
        <div className="sidebar-group-items">
          {items.map((equipment) => (
            <button
              key={equipment.id}
              className="sidebar-item"
              onClick={() => onAdd(equipment)}
              title={getEquipmentLabel(equipment)}
            >
              <span className="sidebar-item-icon">{getEquipmentIcon(equipment.id)}</span>
              <span className="sidebar-item-label">{getEquipmentLabel(equipment)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function Sidebar() {
  const addNode = useLayoutStore((state) => state.addNode)

  const handleAddEquipment = (equipment: Equipment) => {
    // Add node near center with random offset to prevent stacking
    const offset = Math.random() * POSITION_OFFSET_RANGE - POSITION_OFFSET_RANGE / 2
    const basePosition = equipment.type === 'source'
      ? DEFAULT_SOURCE_POSITION
      : equipment.type === 'terminal'
        ? DEFAULT_TERMINAL_POSITION
        : { x: 250, y: 150 }

    addNode(equipment, {
      x: basePosition.x + offset,
      y: basePosition.y + offset
    }, 0)
  }

  return (
    <div className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <span className="sidebar-logo-icon">🚒</span>
      </div>

      {/* Divider */}
      <div className="sidebar-divider" />

      {/* Equipment groups */}
      <div className="sidebar-groups">
        {categories.map((category) => {
          const items = equipmentByCategory[category]
          if (items.length === 0) return null

          return (
            <CategoryGroup
              key={category}
              category={category}
              items={items}
              onAdd={handleAddEquipment}
            />
          )
        })}
      </div>
    </div>
  )
}
