import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import ChessBoard from './Components/ChessBoard'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
     <ChessBoard/>
    </>
  )
}

export default App
