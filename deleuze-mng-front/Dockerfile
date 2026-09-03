FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps || npm install --legacy-peer-deps --no-audit --no-fund

COPY . .

ARG VITE_MANAGEMENT_API_SECRET
ENV VITE_MANAGEMENT_API_SECRET=$VITE_MANAGEMENT_API_SECRET

RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]