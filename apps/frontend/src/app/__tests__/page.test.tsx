import { render, screen } from '@testing-library/react';
import Home from '../page';

describe('Home', () => {
  it('renders the home page with expected content', () => {
    render(<Home />);
    
    // Check that the Next.js logo is rendered
    const logo = screen.getByAltText('Next.js logo');
    expect(logo).toBeInTheDocument();
    
    // Check that the getting started text is present
    expect(screen.getByText(/Get started by editing/i)).toBeInTheDocument();
    expect(screen.getByText(/src\/app\/page\.tsx/i)).toBeInTheDocument();
    
    // Check navigation links
    expect(screen.getByRole('link', { name: /deploy now/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /read our docs/i })).toBeInTheDocument();
    
    // Check footer links
    expect(screen.getByRole('link', { name: /learn/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /examples/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /go to nextjs\.org →/i })).toBeInTheDocument();
  });
});
