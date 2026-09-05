import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import CatCompanion from './CatCompanion'
import CustomCursor from './CustomCursor'

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CatCompanion />
      <CustomCursor />
    </div>
  )
}
