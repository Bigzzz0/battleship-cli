FROM node:20-alpine as builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./ 
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build

FROM nginx:alpine
# Remove the default Nginx configuration file
RUN rm /etc/nginx/conf.d/default.conf
# Copy the custom Nginx configuration file
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
# Remove Nginx's default index.html to ensure our app's index.html is served
RUN rm /usr/share/nginx/html/index.html
# Copy the built React app to Nginx's web root
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

