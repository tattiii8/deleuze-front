FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

ARG VITE_MANAGEMENT_API_SECRET
ENV VITE_MANAGEMENT_API_SECRET=$VITE_MANAGEMENT_API_SECRET

RUN npm run build

FROM nginx:alpine
# /app/build ではなく Vite の出力先 /app/dist をコピー
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]