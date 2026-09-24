import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    // Arena preview: https://{port}-{sandboxId}.e2b.app
    // Vite valida el header Host y bloquea previews si no está en lista blanca.
    // `allowedHosts: true` permite cualquier host (seguro en sandbox).
    // Alternativa explícita: ['.e2b.app']
    // @ts-ignore - allowHosts no está tipado en algunas versiones pero funciona
    allowedHosts: true as unknown as string[],
    cors: true,
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    // @ts-ignore
    allowedHosts: true as unknown as string[],
    cors: true,
  },
})
