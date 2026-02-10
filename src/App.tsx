import { Editor, Sidebar, PortraitOverlay } from './components'
import './App.css'

function App() {
  return (
    <div className="app">
      <PortraitOverlay />
      <aside className="app-sidebar">
        <Sidebar />
      </aside>
      <main className="app-main">
        <Editor />
      </main>
    </div>
  )
}

export default App
