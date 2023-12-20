import { defineConfig } from "vite";

export default defineConfig({
    build: {
        outDir: 'dist',
        lib: {
            entry: 'src/index.ts',
            name: 'hello',
            formats: ['es', 'cjs', 'umd'],
            fileName: (format) => {
                switch (format) {
                    case "es":
                        return "index.mjs"
                    case "cjs":
                        return "index.cjs"
                    default:
                        return "index.min.js"
                }
            }
        },
        minify: true
    }
})