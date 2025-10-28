import './App.css'
import LetterSlider from './components/LetterSlider'

function App() {

  return (
    <>
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        gap: '10px'
      }}>
        <LetterSlider />
        <LetterSlider />
        <LetterSlider />
      </div>
    </>
  )
}

export default App
