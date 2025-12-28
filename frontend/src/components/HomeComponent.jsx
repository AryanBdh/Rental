import React from 'react'
import HeaderComponent from './HeaderComponent'
import HeroSection from './HeroSection'
import { CategoryCards } from './CategoriesComponent'

function HomeComponent() {
  return (
    <div>
        <HeaderComponent />
        <HeroSection />
        <CategoryCards />
    </div>
  )
}

export default HomeComponent
