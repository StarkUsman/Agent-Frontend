# --- Build stage ---
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Vite inlines VITE_* vars at build time, so allow overriding them via --build-arg.
ARG VITE_MANAGER_URL=http://localhost:8080
ARG VITE_CALLS_URL=http://localhost:8790
ENV VITE_MANAGER_URL=$VITE_MANAGER_URL
ENV VITE_CALLS_URL=$VITE_CALLS_URL

RUN npm run build

# --- Runtime stage ---
FROM nginx:1.27-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 8791

# VITE_MANAGER_URL / VITE_CALLS_URL are re-injected from real container env
# vars at startup (see docker-entrypoint.sh), so the same image works across
# environments without rebuilding — the --build-arg values above are only
# the fallback if no env is supplied at runtime.
ENTRYPOINT ["/docker-entrypoint.sh"]
