import './App.css'
import LetterSlider from './components/LetterSlider'
import { LetterProvider, useLetters } from './contexts/LetterContext'
import { useIsMobile } from './hooks/useIsMobile'

function AppContent() {
  const { selectedLetters } = useLetters();
  const isMobile = useIsMobile();

  return (
    <>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: '20px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: isMobile ? 'column' : 'row',
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
