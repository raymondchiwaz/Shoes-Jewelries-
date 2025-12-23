import React from "react"

import Footer from "@modules/layout/templates/footer"
import Nav from "@modules/layout/templates/nav"
import TopCategories from "@modules/layout/templates/top-categories"

const Layout: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <div>
      <Nav />
      <TopCategories />
      <main className="relative">{children}</main>
      <Footer />
    </div>
  )
}

export default Layout
