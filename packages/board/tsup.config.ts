import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom', 'ai'],
  treeshake: true,
  minify: true,
  target: 'es2020',
  esbuildOptions(options) {
    options.banner = {
      js: '"use client"',
    }
  },
  // Compile CSS with Tailwind and copy to dist
  async onSuccess() {
    const { execSync } = await import('child_process')

    try {
      execSync(
        'npx tailwindcss -i ./src/styles/index.css -o ./dist/styles.css --minify',
        { cwd: __dirname, stdio: 'inherit' }
      )
      console.log('✓ CSS compiled with Tailwind to dist/styles.css')
    } catch (error) {
      console.error('Failed to compile CSS:', error)
      throw error
    }
  },
})
