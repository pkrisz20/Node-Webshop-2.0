import path from 'path';

// Works both from `src/config` (tsx) and from `dist/config` (compiled build)
const rootDirectory = path.resolve(__dirname, '..', '..');

export const paths = Object.freeze({
    root: rootDirectory,
    envFile: path.join(rootDirectory, '.env'),
    views: path.join(rootDirectory, 'views'),
    public: path.join(rootDirectory, 'public'),
    files: path.join(rootDirectory, 'files'),
    logs: path.join(rootDirectory, 'logs'),
    sessions: path.join(rootDirectory, 'sessions'),
    mixManifest: path.join(rootDirectory, 'public', 'mix-manifest.json'),
});
