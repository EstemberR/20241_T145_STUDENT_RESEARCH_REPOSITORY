import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { UserProvider } from './components/Instructor/resources/userContext.jsx'
import { EditModeProvider } from './components/Admin/resources/EditModeContext.jsx'

createRoot(document.getElementById('root')).render(
  <UserProvider>
    <EditModeProvider>
      <StrictMode>
        <App />
      </StrictMode>
    </EditModeProvider>
  </UserProvider>
)
