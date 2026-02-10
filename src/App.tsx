import { Editor, EquipmentPanel, ActionPanel, PortraitOverlay } from './components'
import './App.css'

function App() {
  return (
    <div className="app">
      <PortraitOverlay />
      <aside className="app-equipment-panel">
        <EquipmentPanel />
      </aside>
      <main className="app-main">
        <Editor />
      </main>
      <aside className="app-action-panel">
        <ActionPanel />
      </aside>
    </div>
  )
}

export default App
