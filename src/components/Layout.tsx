import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import CatCompanion from './CatCompanion'
import CustomCursor from './CustomCursor'
import SupportWidget from './SupportWidget'
import PawBackground from './PawBackground'

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <PawBackground />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CatCompanion />
      <CustomCursor />
      <SupportWidget />
    </div>
  )
}
