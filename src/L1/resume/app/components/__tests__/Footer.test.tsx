import { render, screen } from '@testing-library/react'
import Footer from '@/app/components/Footer'

describe('Footer', () => {
  it('renders a copyright', () => {
    render(<Footer />)

    const copyright = screen.getByText(/Copyright/i)

    expect(copyright).toBeInTheDocument()
  })
})