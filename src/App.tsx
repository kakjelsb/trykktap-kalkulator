import { t } from './i18n'
import { Editor, Palette } from './components'
import './App.css'

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>{t.app.title}</h1>
      </header>
      <main className="app-main">
        <Editor />
      </main>
      <footer className="app-palette">
        <Palette />
      </footer>
    </div>
  )
}

export default App
