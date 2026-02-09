/**
 * Equipment Palette Component
 *
 * Bottom-anchored draggable equipment panel.
 * Mobile-optimized with large touch targets.
 */

import { t } from '../../i18n'
import { equipmentCatalog, type Equipment, type EquipmentCategory } from '../../models'
import { useLayoutStore } from '../../store'
import { getEquipmentIcon } from '../../constants'
import './Palette.css'

// Layout constants
const DEFAULT_NODE_POSITION = { x: 200, y: 200 }
const POSITION_OFFSET_RANGE = 50

// Equipment categories in display order
const categories: EquipmentCategory[] = ['source', 'pump', 'hose', 'connector', 'terminal']

const equipmentByCategory = categories.reduce((acc, cat) => {
  acc[cat] = equipmentCatalog.filter(e => e.type === cat)
  return acc
}, {} as Record<EquipmentCategory, Equipment[]>)

function getEquipmentLabel(equipment: Equipment): string {
  const key = equipment.nameKey.split('.')[1] as keyof typeof t.equipment
  return t.equipment[key] || equipment.id
}

interface PaletteItemProps {
  equipment: Equipment
  onAdd: (equipment: Equipment) => void
}

function PaletteItem({ equipment, onAdd }: PaletteItemProps) {
  const handleClick = () => {
    onAdd(equipment)
  }

  return (
    <button
      className="palette-item"
      onClick={handleClick}
      title={getEquipmentLabel(equipment)}
    >
      <span className="palette-item-icon">{getEquipmentIcon(equipment.id)}</span>
      <span className="palette-item-label">{getEquipmentLabel(equipment)}</span>
    </button>
  )
}

export function Palette() {
  const addNode = useLayoutStore((state) => state.addNode)

  const handleAddEquipment = (equipment: Equipment) => {
    // Add node near center with random offset to prevent stacking
    const offset = Math.random() * POSITION_OFFSET_RANGE - POSITION_OFFSET_RANGE / 2
    addNode(equipment, {
      x: DEFAULT_NODE_POSITION.x + offset,
      y: DEFAULT_NODE_POSITION.y + offset
    }, 0)
  }

  return (
    <div className="palette">
      <div className="palette-scroll">
        {categories.map((category) => {
          const items = equipmentByCategory[category]
          if (items.length === 0) return null

          return (
            <div key={category} className="palette-category">
              {items.map((equipment) => (
                <PaletteItem
                  key={equipment.id}
                  equipment={equipment}
                  onAdd={handleAddEquipment}
                />
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
