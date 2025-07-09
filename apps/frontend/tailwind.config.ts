import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
    },
  },
  plugins: [],
};

export default config;
// This configuration file sets up Tailwind CSS for a Next.js project, specifying where to look for class names and extending the theme with custom colors.
// It includes paths to pages, components, and features directories to ensure Tailwind can purge unused styles effectively.
// The `colors` are defined using CSS variables for easy theming and consistency across the application.
// The `plugins` array is empty, but you can add Tailwind plugins as needed for additional functionality.
// The `export default config;` statement exports the configuration object so that Tailwind can use it when processing styles.
// This setup is typical for modern Next.js applications using Tailwind CSS, allowing for a highly customizable and responsive design system.
// The `content` paths ensure that Tailwind scans all relevant files for class names, enabling tree-shaking to remove unused styles in production builds.
// The `theme.extend` section allows for easy customization of the design system, such as adding new colors or modifying existing ones without overriding the default Tailwind styles.
// This configuration is essential for maintaining a consistent design
