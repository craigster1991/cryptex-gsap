import './App.css'
import LetterSlider from './components/LetterSlider'
import { LetterProvider, useLetters } from './contexts/LetterContext'

function AppContent() {
  const { selectedLetters } = useLetters();

  return (
    <>
      <div>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'row',
          gap: '10px'
        }}>
          <LetterSlider wheelIndex={0} />
          <LetterSlider wheelIndex={1} />
          <LetterSlider wheelIndex={2} />
        </div>
        <div style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#999',
          marginTop: '20px',
        }}>
          {selectedLetters.join('')}
        </div>
      </div>
    </>
  )
}

function App() {
  return (
    <LetterProvider>
      <AppContent />
    </LetterProvider>
  )
}

export default App
