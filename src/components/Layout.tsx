import type { FC } from "hono/jsx";

interface LayoutProps {
  title?: string;
  children: unknown;
}

export const Layout: FC<LayoutProps> = ({
  title = "Solar Monitor",
  children,
}) => {
  return (
    <html lang="en">
      <head>
        <title>{title}</title>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        <meta name="theme-color" content="#2563eb" />
        <link
          rel="icon"
          type="image/png"
          href="/favicon-16x16.png"
          size="16x16"
        />
        <link
          rel="icon"
          type="image/png"
          href="/favicon-32x32.png"
          size="32x32"
        />
        <link
          rel="icon"
          type="image/png"
          href="/favicon-192x192.png"
          size="192x192"
        />
        <link rel="apple-touch-icon" href="/favicon-180x180.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Solar Monitor" />
        <link rel="stylesheet" href="/styles.css" />
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <script type="module" src="/scripts/constants.js"></script>
        <script type="module" src="/scripts/client-script.js"></script>
        <script type="module" src="/scripts/dashboard.js"></script>
        <script type="module" src="/scripts/charts.js"></script>
      </head>
      <body>
        <div class="header">
          <div class="header-left">
            <img src="/favicon.png" alt="Solar Monitor" class="logo" />
            <h1>Solar Monitor</h1>
          </div>
          <div class="header-right">
            <button id="install-button" type="button">
              📱 Install App
            </button>
            <button
              id="dark-mode-toggle"
              class="header-button dark-mode-toggle"
              title="Toggle dark mode"
              type="button"
            >
              <svg
                class="sun-icon"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <title>Sun icon</title>
                <path d="M12 17.5C14.4853 17.5 16.5 15.4853 16.5 13C16.5 10.5147 14.4853 8.5 12 8.5C9.51472 8.5 7.5 10.5147 7.5 13C7.5 15.4853 9.51472 17.5 12 17.5Z" />
                <path d="M12 1.25C12.4142 1.25 12.75 1.58579 12.75 2V4C12.75 4.41421 12.4142 4.75 12 4.75C11.5858 4.75 11.25 4.41421 11.25 4V2C11.25 1.58579 11.5858 1.25 12 1.25Z" />
                <path d="M4.39861 4.39861C4.6915 4.10572 5.16638 4.10572 5.45927 4.39861L6.87349 5.81283C7.16638 6.10572 7.16638 6.5806 6.87349 6.87349C6.5806 7.16638 6.10572 7.16638 5.81283 6.87349L4.39861 5.45927C4.10572 5.16638 4.10572 4.6915 4.39861 4.39861Z" />
                <path d="M1.25 12C1.25 11.5858 1.58579 11.25 2 11.25H4C4.41421 11.25 4.75 11.5858 4.75 12C4.75 12.4142 4.41421 12.75 4 12.75H2C1.58579 12.75 1.25 12.4142 1.25 12Z" />
                <path d="M4.39861 19.6014C4.10572 19.3085 4.10572 18.8336 4.39861 18.5407L5.81283 17.1265C6.10572 16.8336 6.5806 16.8336 6.87349 17.1265C7.16638 17.4194 7.16638 17.8943 6.87349 18.1872L5.45927 19.6014C5.16638 19.8943 4.6915 19.8943 4.39861 19.6014Z" />
                <path d="M12 19.25C11.5858 19.25 11.25 19.5858 11.25 20V22C11.25 22.4142 11.5858 22.75 12 22.75C12.4142 22.75 12.75 22.4142 12.75 22V20C12.75 19.5858 12.4142 19.25 12 19.25Z" />
                <path d="M18.1872 17.1265C17.8943 16.8336 17.4194 16.8336 17.1265 17.1265C16.8336 17.4194 16.8336 17.8943 17.1265 18.1872L18.5407 19.6014C18.8336 19.8943 19.3085 19.8943 19.6014 19.6014C19.8943 19.3085 19.8943 18.8336 19.6014 18.5407L18.1872 17.1265Z" />
                <path d="M22.75 12C22.75 12.4142 22.4142 12.75 22 12.75H20C19.5858 12.75 19.25 12.4142 19.25 12C19.25 11.5858 19.5858 11.25 20 11.25H22C22.4142 11.25 22.75 11.5858 22.75 12Z" />
                <path d="M17.1265 6.87349C17.4194 7.16638 17.8943 7.16638 18.1872 6.87349L19.6014 5.45927C19.8943 5.16638 19.8943 4.6915 19.6014 4.39861C19.3085 4.10572 18.8336 4.10572 18.5407 4.39861L17.1265 5.81283C16.8336 6.10572 16.8336 6.5806 17.1265 6.87349Z" />
              </svg>
              <svg
                class="moon-icon"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
                style="display: none;"
              >
                <title>Moon icon</title>
                <path d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.752-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
              </svg>
            </button>
            <a
              href="https://github.com/kotx/solarmon"
              target="_blank"
              rel="noopener noreferrer"
              class="header-button github-link"
              title="View on GitHub"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <title>GitHub icon</title>
                <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
              </svg>
              GitHub
            </a>
            <iframe
              src="https://github.com/sponsors/kotx/button"
              title="Sponsor kotx"
              height="32"
              width="114"
              style="border: 0; border-radius: 6px;"
            ></iframe>
          </div>
        </div>

        {children}
      </body>
    </html>
  );
};
