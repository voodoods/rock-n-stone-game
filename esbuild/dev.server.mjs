import esbuildServe from "esbuild-serve";
import inlineImage from "esbuild-plugin-inline-image";

esbuildServe(
    {
        logLevel: "info",
        entryPoints: ["src/main.ts"],
        bundle: true,
        outfile: "public/bundle.min.js",
        plugins: [ inlineImage() ],
        sourcemap: true // Enable source maps
    },
    { root: "public", port: 8080 },
);